const express = require('express');
const http = require('http');
const socket = require('socket.io');
const app = express();
const server = http.createServer(app);
// Socket IO Initialization.
const io = socket(server);

// User object to store sockets in memory.
const users = {};

io.on('connection', (socket) => {
  const userName = socket.handshake.query['userName'];
  // Every socket gets a unique ID. Use that as a hack to differentiate between users.
  if (!users[socket.id]) {
    users[socket.id] = {
      id: socket.id,
      name: userName
    };
  }
  // Send ID to the client for him to differentiate with other users.
  socket.emit('yourID', socket.id);

  // Broadcast to all users that a new user has joined.
  io.sockets.emit('allUsers', users);

  // Socket disconnection. Not to be confused with call disconnection.
  socket.on('disconnect', () => {
    delete users[socket.id];

    // Tells users that someone has left.
    io.sockets.emit('allUsers', users);
  });

  // Request from the client to pass on this signal request to another user in the data.
  socket.on('callUser', (data) => {
    io.to(data.userIdToCall).emit('hey', { signal: data.signalData, from: data.from, name: data.name });
  });
  
  // This is sent from the user the hey event was sent to.
  socket.on('acceptCall', (data) => {
    io.to(data.to).emit('callAccepted', {
      signal: data.signal,
      from: data.from
    });
  });

  socket.on('disconnectCall', (data) => {
    /*
      Data will be in the format
        {
          id: socketid,
          name: 'xyz'
        }
    */ 
    console.log('Disconnect call ran', data);
    io.to(data.id).emit('partnerDisconnected', data);
  })
});

server.listen(8000, () => console.log('server is running on port 8000'));
