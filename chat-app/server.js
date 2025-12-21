const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const publicDir = __dirname;

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  if (pathname === '/favicon.ico') {
    const candidates = [
      path.join(publicDir, 'favicon.ico'),
      path.join(publicDir, 'images', 'favicon.ico'),
    ];

    const iconPath = candidates.find((p) => fs.existsSync(p));
    if (!iconPath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('favicon not found');
      return;
    }

    serveFile(res, iconPath, 'image/x-icon');
    return;
  }

  const urlPath = pathname === '/' ? '/index.html' : pathname;

  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(publicDir, safePath);

  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
  };

  const contentType = types[ext] || 'application/octet-stream';
  serveFile(res, filePath, contentType);
});

const wss = new WebSocket.Server({ server });
const clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('message', (message) => {
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on('close', () => {
    const i = clients.indexOf(ws);
    if (i !== -1) clients.splice(i, 1);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP : http://localhost:${PORT}`);
  console.log(`WS   : ws://localhost:${PORT}`);
});
