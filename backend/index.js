const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store users with their socket IDs and availability
let users = {};

const addUser = (userId, socketId, userName, avatarNumber) => {
  if (!users[userId]) {
    users[userId] = { socketId, userName, avatarNumber, available: true };
  }
};

const removeUser = (socketId) => {
  Object.keys(users).forEach((userId) => {
    if (users[userId].socketId === socketId) {
      delete users[userId];
    }
  });
};

const setUserAvailability = (userId, available) => {
  if (users[userId]) {
    users[userId].available = available;
  }
};

io.on('connection', (socket) => {
  socket.on('join', ({ userName, avatarNumber }) => {
    const userId = socket.id;
    addUser(userId, socket.id, userName, avatarNumber);
    socket.emit('yourID', userId);
    io.sockets.emit('allUsers', users);
  });

  socket.on('callUser', ({ userIdToCall, signalData, from }) => {
    setUserAvailability(from, false);
    setUserAvailability(userIdToCall, false);
    io.to(userIdToCall).emit('hey', {
      signal: signalData,
      from,
    });
    io.sockets.emit('allUsers', users);
  });

  socket.on('acceptCall', (data) => {
    io.to(data.to).emit('callAccepted', {
      signal: data.signal,
      from: data.from,
    });
  });

  socket.on('rejectCall', ({ id, name }) => {
    setUserAvailability(id, true);
    setUserAvailability(socket.id, true);
    io.to(id).emit('rejectCallAcknowledgement', { name });
    io.sockets.emit('allUsers', users);
  });

  socket.on('disconnectCall', (caller) => {
    setUserAvailability(caller.id, true);
    setUserAvailability(socket.id, true);
    const userToNotify = users[caller.id];
    if (userToNotify) {
      io.to(userToNotify.socketId).emit('partnerDisconnected');
    }
    io.sockets.emit('allUsers', users);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    io.sockets.emit('allUsers', users);
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
