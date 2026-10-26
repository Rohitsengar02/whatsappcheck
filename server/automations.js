import express from 'express';
import { pool } from './db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'evolution_wa_secure_key_2026_jwt_secret';

// Optional token extractor
const extractOptionalUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // ignore invalid token, proceed as anonymous
    }
  }
  next();
};

// In-memory cache of active automation rules for sub-millisecond keyword evaluation
let cachedRules = null;
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 10000; // 10s TTL

export async function getActiveAutomationRules(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedRules && now - lastCacheUpdate < CACHE_TTL_MS) {
    return cachedRules;
  }

  try {
    const res = await pool.query(
      'SELECT * FROM automation_rules WHERE is_active = true ORDER BY id DESC'
    );
    cachedRules = res.rows;
    lastCacheUpdate = now;
    return cachedRules;
  } catch (err) {
    console.error('[Automation Cache Error]:', err.message);
    return cachedRules || [];
  }
}

export function invalidateAutomationCache() {
  cachedRules = null;
  lastCacheUpdate = 0;
}

// In-memory deduplication set to avoid multiple replies for identical messages or concurrent webhook retries
const processedKeys = new Map(); // key -> timestamp

function isRecentlyProcessed(key, ttlMs = 20000) {
  const now = Date.now();
  if (processedKeys.size > 2000) {
    for (const [k, ts] of processedKeys.entries()) {
      if (now - ts > ttlMs) processedKeys.delete(k);
    }
  }
  const ts = processedKeys.get(key);
  if (ts && now - ts < ttlMs) {
    return true;
  }
  processedKeys.set(key, now);
  return false;
}

// Evaluate incoming text against keyword rules and automatically dispatch reply
export async function matchAndExecuteAutomation({
  incomingText,
  recipientPhone,
  instanceName = 'default',
  serverUrl = 'https://www.bitechez.com',
  apiKey = '429683C4C977415CAAFCCE10F7D57E11',
  userId = null,
  incomingMsgId = null,
}) {
  if (!incomingText || !recipientPhone) return null;

  const cleanPhone = recipientPhone.replace(/\D/g, '');
  const normalized = incomingText.trim().toLowerCase();

  // Deduplication guard 1: unique message ID check
  if (incomingMsgId && isRecentlyProcessed(`msg_${incomingMsgId}`, 60000)) {
    console.log(`[Auto-Responder Backend] Suppressed duplicate for message ID: ${incomingMsgId}`);
    return null;
  }

  // Deduplication guard 2: phone + normalized text within 15 seconds
  const phoneTextKey = `txt_${cleanPhone}_${normalized}`;
  if (isRecentlyProcessed(phoneTextKey, 15000)) {
    console.log(`[Auto-Responder Backend] Suppressed duplicate for phone ${cleanPhone} query "${incomingText}"`);
    return null;
  }

  const rules = await getActiveAutomationRules();

  if (!rules || rules.length === 0) return null;

  for (const rule of rules) {
    const keywords = (rule.keywords || '')
      .split(/[,]+/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (keywords.length === 0) continue;

    const isMatch =
      rule.match_type === 'exact'
        ? keywords.some((k) => normalized === k)
        : keywords.some((k) => normalized.includes(k));

    if (isMatch) {
      console.log(
        `[Auto-Responder] Keyword match! Rule "${rule.name}" triggered by text "${incomingText}" for ${recipientPhone}`
      );

      // Increment trigger count asynchronously
      pool.query('UPDATE automation_rules SET trigger_count = trigger_count + 1 WHERE id = $1', [rule.id]).catch(() => {});

      const fullPhone = recipientPhone.startsWith('+') ? recipientPhone : `+${cleanPhone}`;
      const responseText = rule.response_text;
      const mediaUrl = rule.media_url || null;
      const mediaType = rule.media_type || (mediaUrl ? 'document' : null);

      let waResult = null;
      let isDelivered = false;

      // Fast dispatch to Evolution API WhatsApp if server URL is provided
      const effectiveInstance = (
        instanceName && instanceName !== 'default' && instanceName !== 'simulated'
          ? instanceName
          : (process.env.WA_INSTANCE || 'user_rjx6ebs')
      );
      const cleanApiKey = (apiKey || process.env.WA_API_KEY || '429683C4C977415CAAFCCE10F7D57E11')
        .replace(/^wapi_live_/i, '')
        .toUpperCase();
      const baseEndpoint = (serverUrl || process.env.WA_API_BASE_URL || 'https://www.bitechez.com').replace(/\/+$/, '');

      try {
        if (mediaUrl) {
          // Send media message
          const waRes = await fetch(
            `${baseEndpoint}/message/sendMedia/${encodeURIComponent(effectiveInstance)}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: cleanApiKey,
              },
              body: JSON.stringify({
                number: cleanPhone,
                mediatype: mediaType || 'document',
                media: mediaUrl,
                caption: responseText,
                mediaMessage: {
                  mediatype: mediaType || 'document',
                  caption: responseText,
                  media: mediaUrl,
                },
              }),
            }
          );
          waResult = await waRes.json().catch(() => ({}));
          isDelivered = waRes.ok;
        } else {
          // Send text message
          const waRes = await fetch(
            `${baseEndpoint}/message/sendText/${encodeURIComponent(effectiveInstance)}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: cleanApiKey,
              },
              body: JSON.stringify({
                number: cleanPhone,
                text: responseText,
              }),
            }
          );
          waResult = await waRes.json().catch(() => ({}));
          isDelivered = waRes.ok;
        }
      } catch (waErr) {
        console.warn('[Auto-Responder Dispatch Notice]:', waErr.message);
      }

      if (instanceName === 'simulated' && !isDelivered) {
        isDelivered = true;
      }

      // Record automated reply into messages table
      let savedMsg = null;
      try {
        const insertRes = await pool.query(
          `INSERT INTO messages 
           (user_id, instance_name, recipient_phone, message_type, content, media_url, media_type, status, direction, wa_message_id, raw_response, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'outgoing', $9, $10, NOW())
           RETURNING *`,
          [
            userId,
            instanceName,
            fullPhone,
            mediaUrl ? (mediaType || 'document') : 'text',
            responseText,
            mediaUrl,
            mediaType,
            isDelivered ? 'delivered' : 'sent',
            waResult?.key?.id || `auto_${Date.now()}`,
            waResult ? JSON.stringify(waResult) : null,
          ]
        );
        savedMsg = insertRes.rows[0];
      } catch (dbErr) {
        console.error('[Auto-Responder Message Save Error]:', dbErr);
      }

      return {
        matched: true,
        rule,
        responseText,
        mediaUrl,
        savedMsg,
        waResult,
      };
    }
  }

  return null;
}

// GET /api/automations - Fetch all automation rules
router.get('/', extractOptionalUser, async (req, res) => {
  try {
    let query = 'SELECT * FROM automation_rules ORDER BY id DESC';
    let params = [];

    if (req.user && req.user.id) {
      query = 'SELECT * FROM automation_rules WHERE user_id = $1 OR user_id IS NULL ORDER BY id DESC';
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    return res.json({
      success: true,
      rules: result.rows,
    });
  } catch (error) {
    console.error('[Fetch Automations DB Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch automation rules' });
  }
});

// POST /api/automations - Create or update an automation rule
router.post('/', extractOptionalUser, async (req, res) => {
  try {
    const {
      id,
      name,
      keywords,
      response_text,
      media_url,
      media_type,
      match_type = 'contains',
      is_active = true,
    } = req.body;

    if (!name || !keywords || !response_text) {
      return res.status(400).json({
        error: 'Rule name, keywords, and response_text are required fields',
      });
    }

    const userId = req.user ? req.user.id : null;
    const cleanKeywords = Array.isArray(keywords)
      ? keywords.join(', ')
      : String(keywords);

    let result;
    if (id) {
      // Update existing rule
      result = await pool.query(
        `UPDATE automation_rules 
         SET name = $1, keywords = $2, response_text = $3, media_url = $4, media_type = $5, match_type = $6, is_active = $7
         WHERE id = $8
         RETURNING *`,
        [
          name,
          cleanKeywords,
          response_text,
          media_url || null,
          media_type || null,
          match_type,
          Boolean(is_active),
          id,
        ]
      );
    } else {
      // Create new rule
      result = await pool.query(
        `INSERT INTO automation_rules 
         (user_id, name, keywords, response_text, media_url, media_type, match_type, is_active, trigger_count, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW())
         RETURNING *`,
        [
          userId,
          name,
          cleanKeywords,
          response_text,
          media_url || null,
          media_type || null,
          match_type,
          Boolean(is_active),
        ]
      );
    }

    invalidateAutomationCache();

    return res.status(201).json({
      success: true,
      rule: result.rows[0],
      message: id ? 'Automation rule updated' : 'Automation rule created successfully',
    });
  } catch (error) {
    console.error('[Save Automation DB Error]:', error);
    return res.status(500).json({ error: 'Failed to save automation rule in database' });
  }
});

// PATCH /api/automations/:id/toggle - Toggle active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE automation_rules 
       SET is_active = NOT is_active 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Automation rule not found' });
    }

    invalidateAutomationCache();

    return res.json({
      success: true,
      rule: result.rows[0],
    });
  } catch (error) {
    console.error('[Toggle Automation Error]:', error);
    return res.status(500).json({ error: 'Failed to toggle automation status' });
  }
});

// DELETE /api/automations/:id - Delete an automation rule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM automation_rules WHERE id = $1', [id]);
    invalidateAutomationCache();

    return res.json({
      success: true,
      message: 'Automation rule deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Automation Error]:', error);
    return res.status(500).json({ error: 'Failed to delete automation rule' });
  }
});

// POST /api/automations/test - Instant Keyword Tester
router.post('/test', async (req, res) => {
  try {
    const { test_text } = req.body;
    if (!test_text) {
      return res.status(400).json({ error: 'test_text is required' });
    }

    const normalized = test_text.trim().toLowerCase();
    const rules = await getActiveAutomationRules();

    let matched = null;
    for (const rule of rules) {
      const keywords = (rule.keywords || '')
        .split(/[,]+/)
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      const isMatch =
        rule.match_type === 'exact'
          ? keywords.some((k) => normalized === k)
          : keywords.some((k) => normalized.includes(k));

      if (isMatch) {
        matched = rule;
        break;
      }
    }

    if (matched) {
      return res.json({
        success: true,
        matched: true,
        rule: matched,
        replyText: matched.response_text,
      });
    }

    return res.json({
      success: true,
      matched: false,
      replyText: '⚠️ No active automation rule matched this keyword. Add or edit a keyword rule.',
    });
  } catch (error) {
    console.error('[Test Automation Error]:', error);
    return res.status(500).json({ error: 'Failed to test automation' });
  }
});

export default router;
