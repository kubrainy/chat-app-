const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = [];  // Tüm istemcileri saklayacak dizi

wss.on('connection', (ws) => {
  console.log('Bir istemci bağlandı.');
  clients.push(ws);
  ws.on('message', (message) => {
    console.log('Alınan mesaj: ' + message);
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);  // Diğer istemcilere mesajı ilet
      }
    });
  });
  ws.on('close', () => {
    console.log('Bir istemci bağlantıyı kapattı.');
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

console.log('WebSocket sunucusu başlatıldı: ws://127.0.0.1:8080');
