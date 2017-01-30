var express = require('express');
var PORT = process.env.PORT || 3000;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

var now = moment().format("X");

var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers(socket) {
  var userData = clientInfo[socket.id];
  var users = [];
  if (typeof userData === 'undefined') {
    return;
  }
  Object.keys(clientInfo).forEach(function(socketId) {
    var userInfo = clientInfo[socketId];
    if (userData.room === userInfo.room) {
      users.push(userInfo.name);
    }
  });

  socket.emit('message', {
    name: 'System',
    text: 'Current Users: ' + users.join(', '),
    timestamp: now
  });
}

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  console.log('User connected via socket.io');

  socket.on('disconnect', function() {
    var userData = clientInfo[socket.id];
    console.log('User disconnected:');

    if (typeof userData !== 'undefined') {
      io.to(userData.room).emit('message', {
        text: 'User ' + userData.name + ' has left!',
        timestamp: now,
        name: 'System'
      });

      socket.leave(userData.room);
      delete clientInfo[socket.id];
    }
  });

  socket.on('joinRoom', function(req) {
    clientInfo[socket.id] = req;
    socket.join(req.room);
    socket.broadcast.to(req.room).emit('message', {
      name: 'System',
      text: req.name + ' has joined!',
      timestamp: now
    });
  });

  socket.on('message', function(message) {
    console.log('Message received: ' + message.text);

    if (message.text === '@currentUsers') {
      sendCurrentUsers(socket);
    } else {
      // Adds timestamp to message object
      message.timestamp = now;
      io.to(clientInfo[socket.id].room).emit('message', message);
      // This sends to everyone but the sender
      // socket.broadcast.emit('message', message);
    }
  });

  socket.emit('message', {
    text: 'Welcome to the chat application!',
    name: 'System',
    timestamp: now
  });
});

http.listen(PORT, function() {
  console.log('Server started at port ' + PORT + '.');
});
