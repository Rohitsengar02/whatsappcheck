import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRouter from './auth.js';
import messagesRouter from './messages.js';
import contactsRouter from './contacts.js';
import automationsRouter from './automations.js';
import { initDb, pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Database Table
initDb();

// API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/automations', automationsRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as db_time');
    res.json({
      status: 'healthy',
      database: 'connected (Neon PostgreSQL)',
      time: result.rows[0].db_time,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Production Static Serving (only when run standalone)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath) && process.argv[1] && process.argv[1].endsWith('index.js')) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/whatsapp-api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Resilient backend execution: ensures port 5000 is always active
try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Server] WhatsApp Studio Backend listening on http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`ℹ️ [Server] Port ${PORT} already active, reusing running instance.`);
    } else {
      console.error('[Server Error]:', err);
    }
  });
} catch {
  // ignore
}

export default app;
