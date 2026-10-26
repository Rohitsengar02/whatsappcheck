import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_mOYztb16AIgH@ep-calm-brook-b418krot-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
});

export async function initDb() {
  try {
    const client = await pool.connect();
    try {
      console.log('[PostgreSQL] Initializing tables on Neon...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50) DEFAULT '',
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          instance_name VARCHAR(100) DEFAULT 'default',
          api_key VARCHAR(255) DEFAULT '',
          server_url VARCHAR(255) DEFAULT 'https://www.bitechez.com',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          instance_name VARCHAR(100),
          recipient_phone VARCHAR(50) NOT NULL,
          message_type VARCHAR(20) DEFAULT 'text',
          content TEXT,
          media_url TEXT,
          media_type VARCHAR(50),
          file_name VARCHAR(255),
          caption TEXT,
          status VARCHAR(50) DEFAULT 'delivered',
          direction VARCHAR(20) DEFAULT 'outgoing',
          wa_message_id VARCHAR(255),
          raw_response JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS direction VARCHAR(20) DEFAULT 'outgoing';
        CREATE TABLE IF NOT EXISTS button_triggers (
          id SERIAL PRIMARY KEY,
          instance_name VARCHAR(100),
          button_id VARCHAR(100) NOT NULL,
          button_text VARCHAR(255) NOT NULL,
          response_text TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          tag VARCHAR(50) DEFAULT 'Lead',
          notes TEXT,
          last_contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS automation_rules (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          keywords TEXT NOT NULL,
          response_text TEXT NOT NULL,
          media_url TEXT,
          media_type VARCHAR(50),
          match_type VARCHAR(50) DEFAULT 'contains',
          is_active BOOLEAN DEFAULT true,
          trigger_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed default rules if table is empty
      const existingRules = await client.query('SELECT COUNT(*) FROM automation_rules');
      if (parseInt(existingRules.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO automation_rules (name, keywords, response_text, match_type, is_active, trigger_count)
          VALUES 
            ('Instant Welcome & Menu Bot', 'hi, hello, start, hey, menu', '👋 Welcome to our WhatsApp Support!\n\nHow can we help you today?\n1️⃣ Product Catalog\n2️⃣ Pricing & Plans\n3️⃣ Talk to Support\n\nReply with a keyword to get started!', 'contains', true, 12),
            ('Pricing & Quotation Responder', 'price, pricing, cost, rate, quote, fees', '📄 *Pricing Plans & Quotation:*\n\n• Starter: ₹499/mo\n• Business Pro: ₹1,499/mo\n• Enterprise: Custom\n\nWould you like a live product demo or trial access?', 'contains', true, 28),
            ('Order & Delivery Tracking', 'order, track, status, shipping, delivery', '📦 Please share your 6-digit Order ID or invoice number and our automated agent will look up your real-time shipping status.', 'contains', true, 9),
            ('Support & Live Agent', 'help, support, agent, human, problem', '🤝 A dedicated support executive has been notified and will jump into this conversation shortly. Please state your query!', 'contains', true, 6);
        `);
      }

      console.log('[PostgreSQL] Users, Messages, Button Triggers, Contacts, and Automation Rules tables ready on Neon DB.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[PostgreSQL] Database initialization error:', error);
  }
}
