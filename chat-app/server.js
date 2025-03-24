const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = [];  // Tüm istemcileri saklayacak dizi

wss.on('connection', (ws) => {
  console.log('Bir istemci bağlandı.');

  // Yeni istemciyi client'lar listesine ekle
  clients.push(ws);

  // İstemciden gelen mesajı al
  ws.on('message', (message) => {
    console.log('Alınan mesaj: ' + message);

    // Gelen mesajı, bağlanan tüm istemcilere gönder
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);  // Diğer istemcilere mesajı ilet
      }
    });
  });

  // Bağlantı kapandığında
  ws.on('close', () => {
    console.log('Bir istemci bağlantıyı kapattı.');

    // Bağlantıyı kapatan istemciyi listeden kaldır
    const index = clients.indexOf(ws);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

console.log('WebSocket sunucusu başlatıldı: ws://127.0.0.1:8080');
