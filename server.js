var express = require('express');
var PORT = process.env.PORT || 3000;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

var now = moment().format("X");

var clientInfo = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  console.log('User connected via socket.io');

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
    // Adds timestamp to message object
    message.timestamp = now;
    io.to(clientInfo[socket.id].room).emit('message', message);
    // This sends to everyone but the sender
    // socket.broadcast.emit('message', message);
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
