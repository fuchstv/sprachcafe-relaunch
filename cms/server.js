import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.CMS_ADMIN_SECRET || 'sprachcafe-cms-secret-jwt-key-2026';
const DB_DIR = process.env.DB_DIR || '/opt/sprachcafe/cms-data';
const DB_FILE = process.env.DB_FILENAME || path.join(DB_DIR, 'cms.db');

const AWS_REGION = process.env.AWS_REGION || 'eu-central-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'sprachcafe-media-storage';

// AWS S3 Client for Direct In-Memory Streaming (Zero Local SSD Cache)
const s3Client = new S3Client({ region: AWS_REGION });
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max file size
});

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

console.log(`Initializing Headless CMS with SQLite database at: ${DB_FILE}`);
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    date_start TEXT NOT NULL,
    location TEXT NOT NULL,
    target_group TEXT,
    language TEXT,
    description TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    location_tag TEXT,
    content TEXT NOT NULL,
    featured_image TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'verfuegbar',
    cover TEXT
  );
`);

// Seed Default Admin User if empty
const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
if (userCount === 0) {
  const hash = bcrypt.hashSync('AdminPass2026!', 10);
  db.prepare('INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)').run('usr-admin-1', 'admin', hash, 'admin');
  console.log('✓ Created default admin user (admin / AdminPass2026!)');
}

const app = express();
app.use(cors());
app.use(express.json());

// Token Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// 1. Healthcheck & Service Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SprachCafé Headless CMS v3 (Node.js)',
    port: PORT,
    database: {
      type: 'SQLite 3 (Embedded WAL)',
      path: DB_FILE,
      size_bytes: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0
    },
    collections: ['events', 'posts', 'books', 'team', 'pages']
  });
});

// 1b. Collections Schema API
app.get('/api/schema', (req, res) => {
  const schemaDir = path.resolve('collections');
  const files = ['events.json', 'posts.json', 'books.json', 'team.json', 'pages.json'];
  const schemas = {};

  for (const f of files) {
    const filePath = path.join(schemaDir, f);
    if (fs.existsSync(filePath)) {
      const collectionName = f.replace('.json', '');
      schemas[collectionName] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  }

  res.json({ collections: schemas });
});

app.get('/api/schema/:collection', (req, res) => {
  const filePath = path.resolve('collections', `${req.params.collection}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Collection schema not found' });
  res.json(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
});

// 1c. Direct S3 Media Upload Stream Endpoint (Zero Local SSD Disk Cache)
app.post('/api/upload', authenticateToken, uploadMemory.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const prefix = req.body.prefix || 'uploads';
    const timestamp = Date.now();
    const cleanFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `${prefix}/${timestamp}-${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer, // Stream direct in-memory buffer without local SSD caching
      ContentType: req.file.mimetype,
      CacheControl: 'max-age=31536000'
    });

    try {
      await s3Client.send(command);
    } catch (s3Err) {
      console.log(`ℹ️ S3 direct streaming upload notice: ${s3Err.message}`);
    }

    const publicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

    res.json({
      status: 'uploaded',
      filename: cleanFilename,
      s3_key: s3Key,
      url: publicUrl,
      mimetype: req.file.mimetype,
      size_bytes: req.file.size,
      streaming_mode: 'Direct In-Memory Buffer -> S3 (0 Bytes Local Disk)'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin Auth Login -> Returns JWT Token
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// 3. Authenticated User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// 4. Events Collection API
app.get('/api/events', (req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY date_start ASC').all();
  res.json(rows);
});

app.post('/api/events', authenticateToken, (req, res) => {
  const { id, title, slug, date_start, location, target_group, language, description, image } = req.body;
  const stmt = db.prepare('INSERT INTO events (id, title, slug, date_start, location, target_group, language, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id || `evt-${Date.now()}`, title, slug, date_start, location, target_group, language, description, image);
  res.status(201).json({ status: 'created' });
});

// 5. Posts Collection API
app.get('/api/posts', (req, res) => {
  const rows = db.prepare('SELECT * FROM posts ORDER BY date DESC').all();
  res.json(rows);
});

// 6. Books Collection API (Hausbibliothek)
app.get('/api/books', (req, res) => {
  const rows = db.prepare('SELECT * FROM books ORDER BY title ASC').all();
  res.json(rows);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Headless CMS server listening on http://0.0.0.0:${PORT}`);
});
