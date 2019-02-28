const express = require('express');
const socketio = require('socket.io');

const namespaces = require('./data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});

const io = socketio(expressServer);

io.on('connection', socket => {
  socket.emit('EVENT_NAMESPACE_LIST', createNsImageEndpoint(namespaces));
});

namespaces.forEach(namespace => {
  io.of(namespace.endpoint).on('connection', socket => {
    const username = socket.handshake.query.username;
    socket.emit('EVENT_ROOMS_LIST', namespace.rooms);

    socket.on('EVENT_JOIN_ROOM', room => {
      const roomToLeave = Object.keys(socket.rooms)[1];
      socket.leave(roomToLeave);
      socket.join(room);

      const roomObj = namespace.rooms.find(r => r.roomTitle === room);
      if (roomObj) {
        socket.emit('EVENT_ROOM_HISTORY', roomObj.history);
      }
    });

    socket.on('EVENT_CLIENT_MESSAGE', message => {
      const room = Object.keys(socket.rooms)[1];
      const fullMessage = {
        message,
        timestamp: Date.now(),
        username,
        avatar: 'https://via.placeholder.com/30x30'
      };

      const roomObj = namespace.rooms.find(r => r.roomTitle === room);
      if (roomObj) {
        roomObj.addMessage(fullMessage);
      }

      io.of(namespace.endpoint).to(room).emit('EVENT_SERVER_MESSAGE', fullMessage);
    });
  });
});

function createNsImageEndpoint(namespaces) {
  return namespaces.map(ns=> {
    return { img: ns.img, endpoint: ns.endpoint }
  });
}
