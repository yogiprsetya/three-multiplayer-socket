'use strict';
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 1989;
const server = app.listen(port);

//Console the port
console.log('Server is running localhost on port: ' + port);

// Template engine
app.set('views', __dirname + '/views');

//Setup ejs, so I can write HTML(:
app.engine('.html', ejs.__express);
app.set('view-engine', 'html');

//Setup the public client folder
app.use(express.static(__dirname + '/public'));

/////SOCKET.IO///////
const io = new Server(server);
let clients = {};

io.on('connection', (client) => {
  console.log(
    'User ' +
      client.id +
      ' connected, there are ' +
      io.engine.clientsCount +
      ' clients connected'
  );

  clients[client.id] = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  };

  client.emit(
    'introduction',
    client.id,
    io.engine.clientsCount,
    Object.keys(clients)
  );

  io.sockets.emit(
    'newUserConnected',
    io.engine.clientsCount,
    client.id,
    Object.keys(clients)
  );

  client.on('move', (pos) => {
    clients[client.id].position = pos;
    io.sockets.emit('userPositions', clients);
  });

  //Handle the disconnection
  client.on('disconnect', () => {
    //Delete this client from the object
    delete clients[client.id];

    io.sockets.emit(
      'userDisconnected',
      io.engine.clientsCount,
      client.id,
      Object.keys(clients)
    );

    console.log(
      'User ' +
        client.id +
        ' dissconeted, there are ' +
        io.engine.clientsCount +
        ' clients connected'
    );
  });
});

// ROUTER
app.use(cors());

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/*', (req, res) => {
  res.render('404.html');
});
