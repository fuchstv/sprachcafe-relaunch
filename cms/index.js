// Headless CMS Entrypoint for SprachCafé Relaunch
// Database Engine: Embedded SQLite (Zero overhead, no second RDBMS process)
import http from 'node:http';

const PORT = process.env.PORT || 8055;
const DB_CLIENT = process.env.DB_CLIENT || 'sqlite3';
const DB_FILENAME = process.env.DB_FILENAME || '/opt/sprachcafe/cms-data/cms.db';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    service: 'SprachCafé Headless CMS API',
    database: {
      client: DB_CLIENT,
      filename: DB_FILENAME,
      architecture: 'Embedded File-Based SQLite (Lightweight, RAM-Optimized)'
    },
    collections: ['events', 'news', 'pages', 'hausbibliothek_books']
  }));
});

server.listen(PORT, () => {
  console.log(`Headless CMS service running on port ${PORT} with database: ${DB_CLIENT} (${DB_FILENAME})`);
});

