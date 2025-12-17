const API = 'http://localhost:8080/messages';
let isConnected = false;
let currentUser = '';

async function checkConnection() {
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(3000) });
    isConnected = res.ok;
  } catch (e) {
    isConnected = false;
  }
  updateStatus();
}

function updateStatus() {
  const status = document.getElementById('status');
  if (isConnected) {
    status.textContent = '✓ Connected';
    status.className = 'status connected';
  } else {
    status.textContent = '✗ Backend offline (run: mvn spring-boot:run)';
    status.className = 'status';
  }
}

async function loadMessages() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Backend not reachable');
    const messages = await res.json();
    const container = document.getElementById('messages');
    
    if (!messages.length) {
      container.innerHTML = '<div class="no-messages">No messages yet<br>Start chatting!</div>';
      isConnected = true;
    } else {
      container.innerHTML = messages.map(m => {
        const isOwn = m.from === currentUser;
        const time = new Date(m.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `<div class="msg ${isOwn ? 'own' : ''}">
          <div class="meta">${escapeHtml(m.from || 'Anon')} • ${time}</div>
          <div>${escapeHtml(m.text)}</div>
        </div>`;
      }).join('');
      isConnected = true;
    }
    updateStatus();
  } catch (e) {
    isConnected = false;
    updateStatus();
  }
}

async function sendMessage() {
  const from = document.getElementById('from').value.trim() || 'Anon';
  const text = document.getElementById('text').value.trim();
  
  if (!text) {
    alert('Please enter a message');
    return;
  }
  
  if (!isConnected) {
    alert('Backend is offline. Please start the server first.');
    return;
  }
  
  currentUser = from;
  document.getElementById('from').value = from;
  
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, text })
    });
    if (!res.ok) throw new Error('Send failed');
    document.getElementById('text').value = '';
    await loadMessages();
  } catch (e) {
    alert('Failed to send message. Check if backend is running.');
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

document.getElementById('send').addEventListener('click', sendMessage);
document.getElementById('text').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

checkConnection();
loadMessages();
setInterval(() => { checkConnection(); loadMessages(); }, 2000);
