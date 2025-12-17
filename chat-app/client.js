let userName = '';
let socket;

document.addEventListener('DOMContentLoaded', () => {
  connectToServer();
});

function getWebSocketUrl() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${window.location.host}`;
}

function connectToServer() {
  socket = new WebSocket(getWebSocketUrl());

  socket.onopen = () => {
    console.log('WebSocket bağlantısı kuruldu.');
    updateConnectionStatus(true);
  };

  socket.onmessage = (event) => {
    const message = event.data;

    if (message instanceof Blob) {
      const reader = new FileReader();
      reader.onload = function () {
        displayMessage(reader.result, false);
      };
      reader.readAsText(message);
    } else {
      displayMessage(message, false);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket bağlantısı kapandı.');
    updateConnectionStatus(false);
  };

  socket.onerror = (error) => {
    console.log('WebSocket hatası:', error);
  };
}

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

function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value;

  if (message && socket && socket.readyState === WebSocket.OPEN) {
    const fullMessage = `${userName}: ${message}`;
    socket.send(fullMessage);

    displayMessage(fullMessage, true);
    input.value = '';
  }
}

function displayMessage(message, isOwnMessage) {
  const chatBox = document.getElementById('chat-box');
  const userPara = document.createElement('p');
  userPara.classList.add(isOwnMessage ? 'kendi-mesaj' : 'baska-mesaj');
  userPara.textContent = message;
  chatBox.appendChild(userPara);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function disconnect() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = `${userName} bağlantıyı kesti.`;
    socket.send(message);

    displayMessage('Bağlantınızı kestiniz.', true);

    socket.close();

    document.getElementById('reconnect-button').style.display = 'block';
    document.getElementById('disconnect-button').style.display = 'none';
  }
}

function reconnect() {
  connectToServer();
  document.getElementById('reconnect-button').style.display = 'none';
  document.getElementById('disconnect-button').style.display = 'block';
  document.getElementById('disconnect-button').disabled = false;
}

function updateConnectionStatus(isConnected) {
  const status = document.getElementById('connection-status');
  if (isConnected) {
    status.textContent = 'Bağlantı Açık';
    status.style.color = 'green';
  } else {
    status.textContent = 'Bağlantı Kapalı';
    status.style.color = 'red';
    document.getElementById('disconnect-button').disabled = true;
  }
}

