let userName = ''; // Kullanıcının adı
let socket; // WebSocket bağlantısı

document.addEventListener('DOMContentLoaded', () => {
  connectToServer(); // Otomatik bağlan
});

// Sunucuya bağlanma fonksiyonu
function connectToServer() {
  socket = new WebSocket('ws://127.0.0.1:8080');

  socket.onopen = () => {
    console.log('WebSocket bağlantısı kuruldu.');
    updateConnectionStatus(true); // Bağlantı durumunu güncelle
  };

  // Sunucudan gelen mesajları dinle
  socket.onmessage = (event) => {
    const chatBox = document.getElementById('chat-box');
    const message = event.data;

    // Gelen mesaj Blob ise, okuyup metin olarak dönüştür
    if (message instanceof Blob) {
      const reader = new FileReader();
      reader.onload = function () {
        displayMessage(reader.result, false); // Mesajı göster
      };
      reader.readAsText(message);
    } else {
      displayMessage(message, false); // Mesaj metinse doğrudan göster
    }
  };

  socket.onclose = () => {
    console.log('WebSocket bağlantısı kapandı.');
    updateConnectionStatus(false); // Bağlantı durumu kapalı
  };

  socket.onerror = (error) => {
    console.log('WebSocket hatası:', error);
  };
}

// Kullanıcı adı belirleme
function setName() {
  userName = document.getElementById('name-input').value;
  if (userName) {
    document.getElementById('name-section').style.display = 'none';
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-button').disabled = false;
    document.getElementById('disconnect-button').disabled = false;
  } else {
    alert('Lütfen bir isim girin!');
  }
}

// Mesaj gönderme
function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value;
  if (message) {
    const fullMessage = `${userName}: ${message}`;
    socket.send(fullMessage);

    // Kendi mesajını ekrana yazdır
    displayMessage(fullMessage, true);
    input.value = ''; // Mesaj kutusunu temizle
  }
}

// Mesajı ekrana yazdırma fonksiyonu
function displayMessage(message, isOwnMessage) {
  const chatBox = document.getElementById('chat-box');
  const userPara = document.createElement("p");
  userPara.classList.add(isOwnMessage ? "kendi-mesaj" : "baska-mesaj");
  userPara.textContent = message;
  chatBox.appendChild(userPara);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Bağlantıyı kesme fonksiyonu
// Bağlantıyı kesme fonksiyonu
function disconnect() {
  if (socket.readyState === WebSocket.OPEN) {
    const message = `${userName} bağlantıyı kesti.`;
    socket.send(message);

    // Kendi ekranına "Bağlantınızı kestiniz" mesajı yazdır
    displayMessage('Bağlantınızı kestiniz.', true);

    socket.close(); // Bağlantıyı kapat

    // Tekrar bağlan butonunu göster
    document.getElementById('reconnect-button').style.display = 'block';

    // "Bağlantıyı Kes" butonunu gizle
    document.getElementById('disconnect-button').style.display = 'none';
  }
}

// Tekrar bağlanma fonksiyonu
function reconnect() {
  connectToServer(); // Sunucuya yeniden bağlan
  document.getElementById('reconnect-button').style.display = 'none'; // "Tekrar Bağlan" butonunu gizle
  document.getElementById('disconnect-button').style.display = 'block'; // "Bağlantıyı Kes" butonunu tekrar göster
  document.getElementById('disconnect-button').disabled = false; // Bağlantıyı kesme butonunu aktif et
}


// Bağlantı durumu göstergesi
function updateConnectionStatus(isConnected) {
  const status = document.getElementById('connection-status');
  if (isConnected) {
    status.textContent = 'Bağlantı Açık';
    status.style.color = 'green';
  } else {
    status.textContent = 'Bağlantı Kapalı';
    status.style.color = 'red';
    document.getElementById('disconnect-button').disabled = true; // Bağlantıyı kesme butonunu devre dışı bırak
  }
}
