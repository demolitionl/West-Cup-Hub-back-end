const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

let queue = [];
const socketToName = new Map();

io.on('connection', (socket) => {
  console.log('🟢 Conectado:', socket.id);

  socket.emit('queue-updated', queue);

  socket.on('join-queue', (name) => {
    const nameExists = queue.includes(name);
    if (nameExists) {
      socket.emit('join-error', 'Esse nome já está na fila.');
      return;
    }

    queue.push(name);
    socketToName.set(socket.id, name);
    io.emit('queue-updated', queue);
  });

  socket.on('leave-queue', (name) => {
    queue = queue.filter(n => n !== name);
    io.emit('queue-updated', queue);
  });

  socket.on('disconnect', () => {
    const name = socketToName.get(socket.id);
    if (name) {
      queue = queue.filter(n => n !== name);
      socketToName.delete(socket.id);
      io.emit('queue-updated', queue);
    }
    console.log('❌ Desconectado:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('🚀 Servidor backend rodando em http://localhost:3001');
});
