// Headless CMS Entrypoint for SprachCafé Relaunch
import http from 'node:http';

const PORT = process.env.PORT || 8055;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    service: 'SprachCafé Headless CMS API',
    collections: ['events', 'news', 'pages', 'hausbibliothek_books']
  }));
});

server.listen(PORT, () => {
  console.log(`Headless CMS service running on port ${PORT}`);
});
