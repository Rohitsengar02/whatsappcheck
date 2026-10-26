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

// GET /api/contacts - Fetch user's saved contacts
router.get('/', extractOptionalUser, async (req, res) => {
  try {
    let query = 'SELECT * FROM contacts ORDER BY last_contacted_at DESC LIMIT 100';
    let params = [];

    if (req.user && req.user.id) {
      query = 'SELECT * FROM contacts WHERE user_id = $1 OR user_id IS NULL ORDER BY last_contacted_at DESC LIMIT 100';
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    return res.json({
      success: true,
      contacts: result.rows,
    });
  } catch (error) {
    console.error('[Fetch Contacts DB Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts from database' });
  }
});

// POST /api/contacts - Create or update a contact
router.post('/', extractOptionalUser, async (req, res) => {
  try {
    const { name, phone, tag = 'Lead', notes = '' } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const userId = req.user ? req.user.id : null;
    const cleanPhone = phone.trim();

    // Check if contact already exists for user
    const existing = await pool.query(
      'SELECT id FROM contacts WHERE phone = $1 AND (user_id = $2 OR (user_id IS NULL AND $2 IS NULL))',
      [cleanPhone, userId]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update contact
      result = await pool.query(
        `UPDATE contacts 
         SET name = $1, tag = $2, notes = $3, last_contacted_at = NOW() 
         WHERE id = $4 RETURNING *`,
        [name, tag, notes, existing.rows[0].id]
      );
    } else {
      // Insert new contact
      result = await pool.query(
        `INSERT INTO contacts (user_id, name, phone, tag, notes, last_contacted_at, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [userId, name, cleanPhone, tag, notes]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Contact saved to database',
      contact: result.rows[0],
    });
  } catch (error) {
    console.error('[Save Contact DB Error]:', error);
    return res.status(500).json({ error: 'Failed to save contact in database' });
  }
});

// DELETE /api/contacts/:id - Remove a contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Contact removed from database' });
  } catch (error) {
    console.error('[Delete Contact DB Error]:', error);
    return res.status(500).json({ error: 'Failed to remove contact' });
  }
});

export default router;
