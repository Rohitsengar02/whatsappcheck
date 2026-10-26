import express from 'express';
import { pool } from './db.js';
import jwt from 'jsonwebtoken';
import { matchAndExecuteAutomation } from './automations.js';

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

// GET /api/messages - Fetch message history
router.get('/', extractOptionalUser, async (req, res) => {
  try {
    let query = 'SELECT * FROM messages ORDER BY created_at DESC LIMIT 500';
    let params = [];

    if (req.user && req.user.id) {
      query = 'SELECT * FROM messages WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC LIMIT 500';
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    return res.json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error('[Fetch Messages DB Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch messages history' });
  }
});

// POST /api/messages - Save sent message to database
router.post('/', extractOptionalUser, async (req, res) => {
  try {
    const {
      recipient_phone,
      message_type = 'text',
      content,
      media_url,
      media_type,
      file_name,
      caption,
      status = 'delivered',
      direction = 'outgoing',
      wa_message_id,
      instance_name,
      raw_response,
    } = req.body;

    if (!recipient_phone) {
      return res.status(400).json({ error: 'Recipient phone number is required' });
    }

    const userId = req.user ? req.user.id : null;

    let storedMediaUrl = media_url;
    if (storedMediaUrl && storedMediaUrl.startsWith('data:') && storedMediaUrl.length > 250000) {
      const mimeMatch = storedMediaUrl.match(/^data:([^;]+);base64,/);
      const mime = mimeMatch ? mimeMatch[1] : 'media';
      storedMediaUrl = `data:${mime};base64,[${file_name || 'uploaded_media'} - ${Math.round((storedMediaUrl.length * 0.75) / 1024)} KB]`;
    }

    const result = await pool.query(
      `INSERT INTO messages 
       (user_id, instance_name, recipient_phone, message_type, content, media_url, media_type, file_name, caption, status, direction, wa_message_id, raw_response, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING *`,
      [
        userId,
        instance_name || 'default',
        recipient_phone,
        message_type,
        content || '',
        storedMediaUrl || null,
        media_type || null,
        file_name || null,
        caption || null,
        status,
        direction,
        wa_message_id || null,
        raw_response ? JSON.stringify(raw_response) : null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Message saved to database',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Save Message DB Error]:', error);
    return res.status(500).json({ error: 'Failed to record message in database' });
  }
});

// POST /api/messages/webhook - Evolution API Webhook for incoming & outgoing message events
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    const event = payload.event || payload.type;
    const instanceName = payload.instance || 'default';

    if ((event === 'messages.upsert' || event === 'MESSAGES_UPSERT') && payload.data) {
      const msgData = payload.data;
      const key = msgData.key || {};
      const remoteJid = key.remoteJid || '';
      const cleanPhone = remoteJid.replace(/@.*$/, '').replace(/\D/g, '');

      if (cleanPhone) {
        const isFromMe = Boolean(key.fromMe);
        const direction = isFromMe ? 'outgoing' : 'incoming';
        const senderName = msgData.pushName || `+${cleanPhone}`;

        let textContent = '';
        let mediaUrl = null;
        let mediaType = null;
        let fileName = null;

        if (msgData.message) {
          if (msgData.message.conversation) {
            textContent = msgData.message.conversation;
          } else if (msgData.message.extendedTextMessage?.text) {
            textContent = msgData.message.extendedTextMessage.text;
          } else if (msgData.message.imageMessage) {
            mediaType = 'image';
            mediaUrl = msgData.message.imageMessage.url || msgData.message.imageMessage.jpegThumbnail;
            textContent = msgData.message.imageMessage.caption || '';
          } else if (msgData.message.videoMessage) {
            mediaType = 'video';
            mediaUrl = msgData.message.videoMessage.url;
            textContent = msgData.message.videoMessage.caption || '';
          } else if (msgData.message.documentMessage) {
            mediaType = 'document';
            mediaUrl = msgData.message.documentMessage.url;
            fileName = msgData.message.documentMessage.fileName || 'document.pdf';
            textContent = msgData.message.documentMessage.caption || '';
          } else if (msgData.message.audioMessage) {
            mediaType = 'audio';
            mediaUrl = msgData.message.audioMessage.url;
          }
        }

        // Avoid duplicates if wa_message_id is already stored
        if (key.id) {
          const existing = await pool.query('SELECT id FROM messages WHERE wa_message_id = $1 LIMIT 1', [key.id]);
          if (existing.rows.length > 0) {
            return res.status(200).json({ success: true, duplicate: true });
          }
        }

        // Save incoming/outgoing webhook message into database
        await pool.query(
          `INSERT INTO messages 
           (instance_name, recipient_phone, message_type, content, media_url, media_type, file_name, status, direction, wa_message_id, raw_response, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'delivered', $8, $9, $10, NOW())`,
          [
            instanceName,
            `+${cleanPhone}`,
            mediaType || 'text',
            textContent,
            mediaUrl || null,
            mediaType || null,
            fileName || null,
            direction,
            key.id || null,
            JSON.stringify(payload),
          ]
        );

        // Update or insert contact in contacts table
        await pool.query(
          `INSERT INTO contacts (name, phone, tag, last_contacted_at, created_at)
           VALUES ($1, $2, 'Customer', NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [senderName, `+${cleanPhone}`]
        );

        // Instant automated keyword trigger engine
        if (direction === 'incoming' && textContent) {
          matchAndExecuteAutomation({
            incomingText: textContent,
            recipientPhone: `+${cleanPhone}`,
            instanceName,
            incomingMsgId: key.id || null,
          }).catch((err) =>
            console.warn('[Auto-Responder Trigger Error in Webhook]:', err.message)
          );
        }
      }
    }

    return res.status(200).json({ success: true, received: true });
  } catch (err) {
    console.error('[Webhook Processing Error]:', err);
    return res.status(200).json({ success: false, error: err.message });
  }
});

// POST /api/messages/simulate-incoming - Simulate an incoming receiver reply in real-time
router.post('/simulate-incoming', extractOptionalUser, async (req, res) => {
  try {
    const {
      recipient_phone,
      content = 'Hello! I got your message.',
      media_url,
      media_type,
      file_name,
      sender_name,
    } = req.body;

    if (!recipient_phone) {
      return res.status(400).json({ error: 'recipient_phone is required' });
    }

    const clean = recipient_phone.replace(/\D/g, '');
    const fullPhone = recipient_phone.startsWith('+') ? recipient_phone : `+${clean}`;
    const userId = req.user ? req.user.id : null;
    const simId = `sim_${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO messages 
       (user_id, instance_name, recipient_phone, message_type, content, media_url, media_type, file_name, status, direction, wa_message_id, created_at)
       VALUES ($1, 'simulated', $2, $3, $4, $5, $6, $7, 'delivered', 'incoming', $8, NOW())
       RETURNING *`,
      [
        userId,
        fullPhone,
        media_url ? (media_type || 'media') : 'text',
        content,
        media_url || null,
        media_type || null,
        file_name || null,
        simId,
      ]
    );

    // Instant automated keyword response evaluation
    let autoReply = null;
    if (content) {
      autoReply = await matchAndExecuteAutomation({
        incomingText: content,
        recipientPhone: fullPhone,
        instanceName: 'simulated',
        incomingMsgId: result.rows[0]?.id ? String(result.rows[0].id) : simId,
        userId,
      }).catch((err) => {
        console.warn('[Auto-Responder Trigger Error in Simulate]:', err.message);
        return null;
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Receiver message received and saved',
      data: result.rows[0],
      autoReply: autoReply || null,
    });
  } catch (error) {
    console.error('[Simulate Incoming Error]:', error);
    return res.status(500).json({ error: 'Failed to record simulated receiver message' });
  }
});

// DELETE /api/messages/:id - Delete message from database
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Message deleted from database' });
  } catch (error) {
    console.error('[Delete Message DB Error]:', error);
    return res.status(500).json({ error: 'Failed to delete message' });
  }
});

// POST /api/messages/register-button-trigger - Save automated button response trigger
router.post('/register-button-trigger', async (req, res) => {
  try {
    const { instance_name = 'default', button_id, button_text, response_text } = req.body;

    if (!button_id || !response_text) {
      return res.status(400).json({ error: 'button_id and response_text are required' });
    }

    const result = await pool.query(
      `INSERT INTO button_triggers (instance_name, button_id, button_text, response_text, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [instance_name, button_id, button_text || button_id, response_text]
    );

    return res.status(201).json({
      success: true,
      message: 'Button trigger registered in database',
      trigger: result.rows[0],
    });
  } catch (error) {
    console.error('[Register Button Trigger Error]:', error);
    return res.status(500).json({ error: 'Failed to register button trigger' });
  }
});

// GET /api/messages/triggers - Fetch registered triggers
router.get('/triggers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM button_triggers ORDER BY created_at DESC LIMIT 50');
    return res.json({ success: true, triggers: result.rows });
  } catch (error) {
    console.error('[Fetch Triggers Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch button triggers' });
  }
});

// POST /api/messages/trigger-button-action - Simulate/handle button tap and send automated response
router.post('/trigger-button-action', extractOptionalUser, async (req, res) => {
  try {
    const {
      instance_name = 'default',
      button_id,
      button_text,
      recipient_phone,
      custom_response,
      server_url = 'https://www.bitechez.com',
      api_key = '429683C4C977415CAAFCCE10F7D57E11',
    } = req.body;

    if (!recipient_phone) {
      return res.status(400).json({ error: 'Recipient phone number is required' });
    }

    // Find trigger in DB or fallback to custom_response
    let responseText = custom_response;

    if (!responseText) {
      const dbTrigger = await pool.query(
        'SELECT response_text FROM button_triggers WHERE button_id = $1 OR button_text = $2 ORDER BY id DESC LIMIT 1',
        [button_id, button_text]
      );
      if (dbTrigger.rows.length > 0) {
        responseText = dbTrigger.rows[0].response_text;
      } else {
        responseText = `🤖 Automated Reply: You clicked "${button_text || button_id}". How else can we assist you?`;
      }
    }

    const cleanPhone = recipient_phone.replace(/\D/g, '');

    // Dispatch automated response to WhatsApp via Evolution API
    const waUrl = `${server_url.replace(/\/+$/, '')}/message/sendText/${encodeURIComponent(instance_name)}`;
    console.log(`[Auto-Trigger] Dispatching automated reply to ${cleanPhone} via ${waUrl}`);

    let waResult = null;
    let isDelivered = false;

    try {
      const waRes = await fetch(waUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: api_key.replace(/^wapi_live_/i, '').toUpperCase(),
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: responseText,
        }),
      });
      waResult = await waRes.json().catch(() => ({}));
      isDelivered = waRes.ok;
    } catch (e) {
      console.warn('[Auto-Trigger Dispatch Notice]:', e.message);
    }

    // Save automated response in Neon PostgreSQL database
    const userId = req.user ? req.user.id : null;
    const dbSave = await pool.query(
      `INSERT INTO messages 
       (user_id, instance_name, recipient_phone, message_type, content, status, raw_response, created_at)
       VALUES ($1, $2, $3, 'text', $4, $5, $6, NOW())
       RETURNING *`,
      [
        userId,
        instance_name,
        `+${cleanPhone}`,
        `[Automated Button Reply]: ${responseText}`,
        isDelivered ? 'delivered' : 'sent',
        waResult ? JSON.stringify(waResult) : null,
      ]
    );

    return res.json({
      success: true,
      message: 'Automated response dispatched and saved to database',
      responseText,
      savedRecord: dbSave.rows[0],
      waResult,
    });
  } catch (error) {
    console.error('[Trigger Button Action Error]:', error);
    return res.status(500).json({ error: 'Failed to process automated button action' });
  }
});

// POST /api/messages/send - Universal Server-Side WhatsApp Dispatcher (Zero CORS, 100% Reliable Delivery)
router.post('/send', extractOptionalUser, async (req, res) => {
  try {
    const {
      recipient_phone,
      text,
      media_url,
      media_type = 'image',
      file_name,
      caption,
      mimetype,
      instance_name,
      server_url,
      api_key,
    } = req.body;

    if (!recipient_phone) {
      return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
    }

    const cleanPhone = recipient_phone.replace(/\D/g, '');
    const fullPhone = recipient_phone.startsWith('+') ? recipient_phone : `+${cleanPhone}`;
    const userId = req.user ? req.user.id : null;

    // Resolve target server configuration with automatic fallbacks
    const effectiveServerUrl = (
      server_url ||
      process.env.WA_API_BASE_URL ||
      'https://www.bitechez.com'
    ).replace(/\/+$/, '');
    const effectiveInstance = (
      instance_name && instance_name !== 'default'
        ? instance_name
        : (process.env.WA_INSTANCE || 'user_rjx6ebs')
    );
    const rawApiKey = api_key || process.env.WA_API_KEY || '429683C4C977415CAAFCCE10F7D57E11';
    const effectiveApiKey = rawApiKey.replace(/^wapi_live_/i, '').toUpperCase();

    let waResult = null;
    let isDelivered = false;
    let errorMsg = null;

    try {
      if (media_url) {
        // Send Media Message to Evolution API (supports both v1/v2 schema)
        const waEndpoint = `${effectiveServerUrl}/message/sendMedia/${encodeURIComponent(effectiveInstance)}`;
        console.log(`[Server-Send] Dispatching media (${media_type}) to ${cleanPhone} via ${waEndpoint}`);
        const waRes = await fetch(waEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: effectiveApiKey,
          },
          body: JSON.stringify({
            number: cleanPhone,
            mediatype: media_type || 'image',
            media: media_url,
            caption: caption || text || '',
            fileName: file_name || 'attachment',
            mimetype: mimetype || undefined,
            mediaMessage: {
              mediatype: media_type || 'image',
              caption: caption || text || '',
              media: media_url,
              fileName: file_name || 'attachment',
              mimetype: mimetype || undefined,
            },
          }),
        });
        waResult = await waRes.json().catch(() => ({}));
        isDelivered = waRes.ok;
        if (!waRes.ok) {
          errorMsg = waResult?.message || waResult?.error || `HTTP ${waRes.status}`;
        }
      } else if (text) {
        // Send Text Message to Evolution API
        const waEndpoint = `${effectiveServerUrl}/message/sendText/${encodeURIComponent(effectiveInstance)}`;
        console.log(`[Server-Send] Dispatching text to ${cleanPhone} via ${waEndpoint}`);
        const waRes = await fetch(waEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: effectiveApiKey,
          },
          body: JSON.stringify({
            number: cleanPhone,
            text: text.trim(),
          }),
        });
        waResult = await waRes.json().catch(() => ({}));
        isDelivered = waRes.ok;
        if (!waRes.ok) {
          errorMsg = waResult?.message || waResult?.error || `HTTP ${waRes.status}`;
        }
      }
    } catch (waErr) {
      console.warn('[Server-Send Dispatch Warning]:', waErr.message);
      errorMsg = waErr.message;
    }

    // Save outgoing message directly in Neon PostgreSQL database
    let savedMsg = null;
    try {
      const dbRes = await pool.query(
        `INSERT INTO messages 
         (user_id, instance_name, recipient_phone, message_type, content, media_url, media_type, file_name, caption, status, direction, wa_message_id, raw_response, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'outgoing', $11, $12, NOW())
         RETURNING *`,
        [
          userId,
          effectiveInstance,
          fullPhone,
          media_url ? (media_type || 'media') : 'text',
          text || caption || '',
          media_url || null,
          media_type || null,
          file_name || null,
          caption || text || '',
          isDelivered ? 'delivered' : 'sent',
          waResult?.key?.id || waResult?.messageId || `out_${Date.now()}`,
          waResult ? JSON.stringify(waResult) : null,
        ]
      );
      savedMsg = dbRes.rows[0];
    } catch (dbErr) {
      console.error('[Server-Send DB Save Error]:', dbErr);
    }

    return res.json({
      success: isDelivered,
      delivered: isDelivered,
      error: errorMsg,
      data: waResult,
      savedMessage: savedMsg,
    });
  } catch (err) {
    console.error('[Send Endpoint Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/messages/sync-whatsapp - Manual or client-driven trigger to sync incoming WhatsApp messages
router.post('/sync-whatsapp', async (req, res) => {
  try {
    const result = await syncLatestWhatsAppMessages(req.body || {});
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Live WhatsApp Real-Time Receiver Synchronizer Engine
export async function syncLatestWhatsAppMessages(options = {}) {
  const serverUrl = (
    options.server_url ||
    process.env.WA_API_BASE_URL ||
    'https://www.bitechez.com'
  ).replace(/\/+$/, '');
  const instanceName = (
    options.instance_name && options.instance_name !== 'default'
      ? options.instance_name
      : (process.env.WA_INSTANCE || 'user_rjx6ebs')
  );
  const rawApiKey = options.api_key || process.env.WA_API_KEY || '429683C4C977415CAAFCCE10F7D57E11';
  const cleanApiKey = rawApiKey.replace(/^wapi_live_/i, '').toUpperCase();

  try {
    const waEndpoint = `${serverUrl}/chat/findMessages/${encodeURIComponent(instanceName)}`;
    const response = await fetch(waEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cleanApiKey,
      },
      body: JSON.stringify({ where: {} }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const json = await response.json().catch(() => ({}));
    const records = json?.messages?.records || (Array.isArray(json) ? json : []);
    if (!Array.isArray(records) || records.length === 0) {
      return { success: true, newCount: 0, autoReplies: 0 };
    }

    let newCount = 0;
    let autoReplies = 0;

    // Process from oldest to newest so conversation ordering is preserved
    const sorted = [...records].reverse();

    for (const item of sorted) {
      const key = item.key || {};
      const msgId = key.id;
      const remoteJid = key.remoteJid || '';

      if (!msgId || !remoteJid) continue;
      // Skip group messages for 1-on-1 customer chat
      if (remoteJid.endsWith('@g.us')) continue;

      const cleanPhone = remoteJid.replace(/@.*$/, '').replace(/\D/g, '');
      if (!cleanPhone) continue;

      const fullPhone = `+${cleanPhone}`;
      const isFromMe = Boolean(key.fromMe);
      const direction = isFromMe ? 'outgoing' : 'incoming';
      const senderName = item.pushName || fullPhone;

      // Check if message is already stored in Neon DB
      const existing = await pool.query(
        'SELECT id FROM messages WHERE wa_message_id = $1 LIMIT 1',
        [msgId]
      );
      if (existing.rows.length > 0) {
        continue;
      }

      // Extract text content and media attributes
      let textContent = '';
      let mediaType = null;
      let mediaUrl = null;
      let fileName = null;

      if (item.message) {
        if (item.message.conversation) {
          textContent = item.message.conversation;
        } else if (item.message.extendedTextMessage?.text) {
          textContent = item.message.extendedTextMessage.text;
        } else if (item.message.imageMessage) {
          mediaType = 'image';
          mediaUrl = item.message.imageMessage.url || item.message.imageMessage.jpegThumbnail;
          textContent = item.message.imageMessage.caption || '';
        } else if (item.message.videoMessage) {
          mediaType = 'video';
          mediaUrl = item.message.videoMessage.url;
          textContent = item.message.videoMessage.caption || '';
        } else if (item.message.documentMessage) {
          mediaType = 'document';
          mediaUrl = item.message.documentMessage.url;
          fileName = item.message.documentMessage.fileName || 'document.pdf';
          textContent = item.message.documentMessage.caption || '';
        } else if (item.message.audioMessage) {
          mediaType = 'audio';
          mediaUrl = item.message.audioMessage.url;
        }
      }

      // Insert incoming/outgoing message into database
      await pool.query(
        `INSERT INTO messages 
         (instance_name, recipient_phone, message_type, content, media_url, media_type, file_name, status, direction, wa_message_id, raw_response, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'delivered', $8, $9, $10, NOW())`,
        [
          instanceName,
          fullPhone,
          mediaType || 'text',
          textContent || (mediaType ? `[${mediaType.toUpperCase()} Attachment]` : ''),
          mediaUrl || null,
          mediaType || null,
          fileName || null,
          direction,
          msgId,
          JSON.stringify(item),
        ]
      );
      newCount++;

      // Update or create contact in contacts table
      await pool.query(
        `INSERT INTO contacts (name, phone, tag, last_contacted_at, created_at)
         VALUES ($1, $2, 'Customer', NOW(), NOW())
         ON CONFLICT (phone) DO UPDATE SET last_contacted_at = NOW(), name = COALESCE(EXCLUDED.name, contacts.name)`,
        [senderName, fullPhone]
      ).catch(() => {});

      // IF INCOMING MESSAGE: Trigger Keyword Automation Engine!
      if (!isFromMe && textContent) {
        console.log(`[Auto-Responder Incoming Sync] Evaluating keywords for ${fullPhone}: "${textContent}"`);
        try {
          const autoRes = await matchAndExecuteAutomation({
            incomingText: textContent,
            recipientPhone: fullPhone,
            instanceName,
            serverUrl,
            apiKey: rawApiKey,
            incomingMsgId: msgId,
          });

          if (autoRes?.matched) {
            console.log(`[Auto-Responder Match] Dispatched "${autoRes.rule?.name}" reply to ${fullPhone} on WhatsApp!`);
            autoReplies++;
          }
        } catch (autoErr) {
          console.warn('[Auto-Responder Trigger Error]:', autoErr.message);
        }
      }
    }

    return { success: true, newCount, autoReplies };
  } catch (err) {
    console.error('[Sync WhatsApp Messages Error]:', err.message);
    return { success: false, error: err.message };
  }
}

// Automatic 2.5s Background Sync Loop
let isSyncingLoop = false;
async function runBackgroundSync() {
  if (isSyncingLoop) return;
  isSyncingLoop = true;
  try {
    await syncLatestWhatsAppMessages();
  } catch (e) {
    // silent catch to avoid unhandled rejections
  } finally {
    isSyncingLoop = false;
  }
}

setInterval(runBackgroundSync, 2500);
setTimeout(runBackgroundSync, 1500);

export default router;
