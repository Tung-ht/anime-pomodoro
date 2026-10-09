const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('='.repeat(60));
  console.log(`  🌙 Starlight Pomodoro - Anime Night Edition`);
  console.log(`  ✨ Đang chạy tại: ${url}`);
  console.log(`  (Nhấn Ctrl+C để dừng máy chủ)`);
  console.log('='.repeat(60));

  // Tự động mở trình duyệt trên Windows
  exec(`start ${url}`);
});
