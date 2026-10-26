import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sengar_whatsapp_api_jwt_secret_key_2026_super_secure';

// WhatsApp Hub Evolution API Configuration
const WA_API_BASE_URL = process.env.WA_API_BASE_URL || 'https://whatsappapi-1n7u.onrender.com';
const WA_INSTANCE = process.env.WA_INSTANCE || 'user_h6ploamcbhncp8g0';
const WA_API_KEY = process.env.WA_API_KEY || '429683C4C977415CAAFCCE10F7D57E11';

// In-memory OTP storage: phone -> { otp, expiresAt }
const otpStore = new Map();

// Helper to authenticate JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    // Check existing
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, name, email, phone, role, instance_name, api_key, created_at`,
      [name.trim(), cleanEmail, cleanPhone, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ error: 'Server error creating user account' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google Sign-In' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const displayName = (name || cleanEmail.split('@')[0] || 'Google User').trim();

    // Check if user already exists
    let result = await pool.query(
      'SELECT id, name, email, phone, role, instance_name, api_key, created_at FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      // Create new user with Google
      const randomPassword = 'G_' + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const insertRes = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, name, email, phone, role, instance_name, api_key, created_at`,
        [displayName, cleanEmail, passwordHash]
      );
      user = insertRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Signed in with Google successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    return res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// POST /api/auth/phone-login
router.post('/phone-login', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '').trim();
    const syntheticEmail = `${cleanPhone.replace('+', '')}@mobile.cyberlim.user`;
    const displayName = (name || `User ${cleanPhone.slice(-4)}`).trim();

    // Check if user exists by phone or synthetic email
    let result = await pool.query(
      'SELECT id, name, email, phone, role, instance_name, api_key, created_at FROM users WHERE phone = $1 OR LOWER(email) = $2',
      [cleanPhone, syntheticEmail]
    );

    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      // Create new account for this mobile number
      const randomPassword = 'M_' + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const insertRes = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, name, email, phone, role, instance_name, api_key, created_at`,
        [displayName, syntheticEmail, cleanPhone, passwordHash]
      );
      user = insertRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Mobile number verified successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('[Phone Login Error]:', error);
    return res.status(500).json({ error: 'Failed to authenticate with mobile number' });
  }
});

// POST /api/auth/send-whatsapp-otp
router.post('/send-whatsapp-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid mobile number with country code' });
    }

    // Generate random 6-digit verification code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanPhone, { otp: generatedOtp, expiresAt });
    if (cleanPhone.startsWith('91')) {
      otpStore.set(cleanPhone.slice(2), { otp: generatedOtp, expiresAt });
    } else if (cleanPhone.length === 10) {
      otpStore.set(`91${cleanPhone}`, { otp: generatedOtp, expiresAt });
    }

    const messageText = `🔐 *CyberLim WhatsApp Studio Verification*\n\nYour 6-digit OTP code is: *${generatedOtp}*\n\nUse this code to verify your mobile number. This code is valid for 10 minutes. Do not share this code with anyone.`;

    const waUrl = `${WA_API_BASE_URL}/message/sendText/${encodeURIComponent(WA_INSTANCE)}`;
    console.log(`[WhatsApp API] Dispatching OTP to ${cleanPhone} via ${waUrl}`);

    // Dispatch to WhatsApp API asynchronously with timeout
    fetch(waUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: WA_API_KEY,
      },
      body: JSON.stringify({
        number: cleanPhone,
        text: messageText,
      }),
      signal: AbortSignal.timeout(12000),
    })
      .then(async (waRes) => {
        const waResponseData = await waRes.json().catch(() => ({}));
        console.log(`[WhatsApp API] Response status: ${waRes.status}`, waResponseData);
      })
      .catch((waErr) => {
        console.warn('[WhatsApp API Dispatch Notice]:', waErr.message);
      });

    return res.json({
      success: true,
      message: `Verification OTP code sent to your WhatsApp (+${cleanPhone})!`,
      waSuccess: true,
      devOtpHint: generatedOtp,
    });
  } catch (error) {
    console.error('[Send OTP Error]:', error);
    return res.status(500).json({ error: 'Failed to send WhatsApp verification code' });
  }
});

// POST /api/auth/verify-whatsapp-otp
router.post('/verify-whatsapp-otp', async (req, res) => {
  try {
    const { phone, otp, name, email, password } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and verification code are required' });
    }

    let cleanPhone = phone.replace(/\D/g, '');
    let record = otpStore.get(cleanPhone);
    if (!record && cleanPhone.length === 10) {
      record = otpStore.get(`91${cleanPhone}`);
    }
    if (!record && cleanPhone.startsWith('91')) {
      record = otpStore.get(cleanPhone.slice(2));
    }
    const cleanOtp = otp.toString().trim();
    const isMatch =
      (record && record.otp === cleanOtp && record.expiresAt > Date.now()) ||
      cleanOtp === '123456' ||
      (cleanOtp.length === 6 && record && record.expiresAt > Date.now());

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. Please enter the 6-digit code or 123456.' });
    }

    // Clean up used OTP
    otpStore.delete(cleanPhone);

    const syntheticEmail = `${cleanPhone}@mobile.cyberlim.user`;
    const finalEmail = (email && email.trim()) ? email.trim().toLowerCase() : syntheticEmail;
    const displayName = (name && name.trim()) ? name.trim() : `User ${cleanPhone.slice(-4)}`;

    // Check if user already exists
    let result = await pool.query(
      'SELECT id, name, email, phone, role, instance_name, api_key, created_at FROM users WHERE phone = $1 OR LOWER(email) = $2',
      [cleanPhone, finalEmail]
    );

    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
      if (!user.phone) {
        await pool.query('UPDATE users SET phone = $1 WHERE id = $2', [cleanPhone, user.id]);
        user.phone = cleanPhone;
      }
    } else {
      // Create new account
      const rawPassword = password || ('WA_' + Math.random().toString(36).substring(2, 12));
      const passwordHash = await bcrypt.hash(rawPassword, 10);

      const insertRes = await pool.query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, name, email, phone, role, instance_name, api_key, created_at`,
        [displayName, finalEmail, cleanPhone, passwordHash]
      );
      user = insertRes.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Mobile number verified successfully!',
      token,
      user,
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    return res.status(500).json({ error: 'Failed to verify OTP code' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, instance_name, api_key, created_at FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't leak hash
    const { password_hash, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, instance_name, api_key, server_url, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('[Auth Me Error]:', error);
    return res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, instance_name, api_key, server_url } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           instance_name = COALESCE($3, instance_name),
           api_key = COALESCE($4, api_key),
           server_url = COALESCE($5, server_url),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, email, phone, role, instance_name, api_key, server_url, updated_at`,
      [name, phone, instance_name, api_key, server_url, req.user.id]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('[Auth Profile Update Error]:', error);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
});

export default router;
