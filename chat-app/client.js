let userName = '';
let socket;

document.addEventListener('DOMContentLoaded', () => {
  connectToServer();

  document.getElementById('message-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  document.getElementById('message-input').addEventListener('input', sendTyping);

  document.getElementById('name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setName();
  });
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
    handleIncoming(event.data);
  };

  socket.onclose = () => {
    console.log('WebSocket bağlantısı kapandı.');
    updateConnectionStatus(false);
  };

  socket.onerror = (error) => {
    console.log('WebSocket hatası:', error);
  };
}

function handleIncoming(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    data = { text: String(raw) };
  }
  if (data.type === 'typing') {
    showTyping(data.name);
    return;
  }

  if (data.name) clearTyping(data.name);
  displayMessage(data.text, false, data.name);
}

const TYPING_SEND_INTERVAL = 2000;
const TYPING_TIMEOUT = 3000;
let lastTypingSent = 0;
const typingUsers = new Map();

function sendTyping() {
  const now = Date.now();
  if (!userName || now - lastTypingSent < TYPING_SEND_INTERVAL) return;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'typing', name: userName }));
    lastTypingSent = now;
  }
}

function showTyping(name) {
  if (!name) return;
  clearTimeout(typingUsers.get(name));
  typingUsers.set(name, setTimeout(() => clearTyping(name), TYPING_TIMEOUT));
  renderTyping();
}

function clearTyping(name) {
  clearTimeout(typingUsers.get(name));
  typingUsers.delete(name);
  renderTyping();
}

function renderTyping() {
  const names = [...typingUsers.keys()];
  const el = document.getElementById('typing-indicator');
  if (names.length === 0) {
    el.textContent = '';
  } else if (names.length === 1) {
    el.textContent = `${names[0]} yazıyor...`;
  } else {
    el.textContent = `${names.join(', ')} yazıyor...`;
  }
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
    socket.send(JSON.stringify({ name: userName, text: message }));

    displayMessage(message, true, userName);
    input.value = '';
    lastTypingSent = 0;
  }
}

function displayMessage(message, isOwnMessage, name) {
  const chatBox = document.getElementById('chat-box');
  const userPara = document.createElement('div');
  userPara.classList.add(isOwnMessage ? 'kendi-mesaj' : 'baska-mesaj');

  if (name) {
    const nameEl = document.createElement('span');
    nameEl.classList.add('mesaj-isim');
    nameEl.textContent = name;
    userPara.appendChild(nameEl);
  }

  const textEl = document.createElement('span');
  textEl.classList.add('mesaj-metin');
  textEl.textContent = message;
  userPara.appendChild(textEl);
  chatBox.appendChild(userPara);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function disconnect() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ text: `${userName} bağlantıyı kesti.` }));

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

