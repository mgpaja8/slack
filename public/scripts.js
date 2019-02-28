const BASE_URL = 'http://localhost:3000';

const username = prompt('What is your username?');

const socket = io(BASE_URL, {
  query: {
    username
  }
});
let namespaceSocket;

document.querySelector('#message-form').addEventListener('submit', e => {
  e.preventDefault();
  const message = document.querySelector('#message-input').value;
  if (message.length > 0) {
    namespaceSocket.emit('EVENT_CLIENT_MESSAGE', message);
    document.querySelector('#message-input').value = '';
  }
});

socket.on('EVENT_NAMESPACE_LIST', data => {
  const namespacesDiv = document.querySelector('#namespaces');
  namespacesDiv.innerHTML = '';
  data.forEach(ns => {
    namespacesDiv.innerHTML += `<div class=namespace ns=${ns.endpoint}><img src="${ns.img}" /></div>`;
  });

  if (data.length > 0) {
    joinNamespace(data[0].endpoint);
  }

  Array.from(document.getElementsByClassName('namespace')).forEach(element => {
    element.addEventListener('click', e => {
      joinNamespace(element.getAttribute('ns'));
    });
  });
});

function joinNamespace(endpoint) {
  if (namespaceSocket) {
    namespaceSocket.close();
  }

  namespaceSocket = io(`${BASE_URL}${endpoint}`, {
    query: {
      username
    }
  });

  namespaceSocket.on('EVENT_ROOMS_LIST', data => {
    const roomsList = document.querySelector('#rooms-list');
    roomsList.innerHTML = '';
    data.forEach(room => {
      roomsList.innerHTML += `<li><span class="margin-right-10">#</span><span class="room">${room.roomTitle}</span></li>`;
    });

    if (data.length > 0) {
      joinRoom(data[0].roomTitle);
    }

    Array.from(document.getElementsByClassName('room')).forEach(room => {
      room.addEventListener('click', e => {
       joinRoom(e.target.innerHTML);
      });
    });
  });

  namespaceSocket.on('EVENT_SERVER_MESSAGE', fullMessage => {
    const messagesDom = document.querySelector('#messages-container');
    messagesDom.innerHTML += createMessageHtml(fullMessage);
    messagesDom.scrollTo(0, messagesDom.scrollHeight);
  });

  namespaceSocket.on('EVENT_ROOM_HISTORY', history => {
    const messagesDom = document.querySelector('#messages-container');
    messagesDom.innerHTML = '';

    history.forEach(message => messagesDom.innerHTML += createMessageHtml(message));
    messagesDom.scrollTo(0, messagesDom.scrollHeight);
  });
}

function joinRoom(room) {
  namespaceSocket.emit('EVENT_JOIN_ROOM', room);

  document.querySelector('#header-text').innerHTML = `# ${room}`;
  document.querySelector('#search-bar').value = '';
}

function createMessageHtml(fullMessage) {
  const date = new Date(fullMessage.timestamp).toLocaleTimeString();
  return `
    <div class="message">
      <div class="message-avatar"><img src="${fullMessage.avatar}"></div>
      <div class="message-body">
        <div class="message-header">
          <span class="message-username">${fullMessage.username}</span>
          <span class="message-timestamp">${date}</span>
        </div>
        <div class="message-value">${fullMessage.message}</div>
      </div>
    </div>
  `;
}

document.querySelector('#search-bar').addEventListener('input', e => {
  const searchText = e.target.value.toLowerCase();

  Array.from(document.getElementsByClassName('message')).forEach(message => {
    const messageText = message.getElementsByClassName('message-value')[0].innerText.toLowerCase();

    if (messageText.indexOf(searchText) === -1) {
      message.style.display = 'none';
    } else {
      message.style.display = 'flex';
    }
  });
});
