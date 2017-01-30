var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room') || 'Public';
var socket = io();


// var $roomName = jQuery('.room-title');
// $roomName.append('Connected to chat room: ' + room + '.')

jQuery('.room-title').text('Chat Room: ' + room);

socket.on('connect', function() {
  console.log('Connected to socket.io server!');
  socket.emit('joinRoom', {
    name: name,
    room: room
  });
});

socket.on('message', function(message) {
  console.log('New message: ' + message.text);
  // console.log(message.text);
  var $messages = jQuery('.messages');
  var $message = jQuery('<li class="list-group-item"></li>');

  $message.append('<p> <strong>' + message.name + ' ' +
    moment.unix(message.timestamp).format("MMM Do YYYY, h:mm a") +
    ': </strong>');

  $message.append('<p>' + message.text + '</p>');
  $messages.append($message);
});

// Handles submitting of new messages from UI
var $form = jQuery('#message-form');

$form.on('submit', function(event) {
  event.preventDefault();

  var $message = $form.find('input[name = message]');

  socket.emit('message', {
    name: name,
    text: $message.val()
  });

  $message.val('');
});
