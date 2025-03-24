const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

// Configuração do servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permitir conexões de qualquer origem
    methods: ["GET", "POST"]
  }
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '.')));

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Armazenamento de salas
const rooms = new Map();

// Gerenciamento de conexões Socket.IO
io.on('connection', (socket) => {
  console.log(`Novo cliente conectado: ${socket.id}`);
  
  // Criar uma nova sala
  socket.on('create-room', () => {
    const roomId = uuidv4().substring(0, 8); // ID de sala curto
    
    rooms.set(roomId, {
      id: roomId,
      players: [socket.id],
      gameState: null
    });
    
    socket.join(roomId);
    console.log(`Sala criada: ${roomId}`);
    
    socket.emit('room-created', { roomId });
  });
  
  // Entrar em uma sala existente
  socket.on('join-room', (roomId) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Sala não encontrada' });
      return;
    }
    
    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Sala cheia' });
      return;
    }
    
    room.players.push(socket.id);
    socket.join(roomId);
    
    console.log(`Jogador ${socket.id} entrou na sala ${roomId}`);
    
    // Notificar o jogador que ele entrou
    socket.emit('room-joined', { roomId });
    
    // Notificar o outro jogador que alguém entrou
    socket.to(roomId).emit('opponent-joined');
  });
  
  // Processar movimento
  socket.on('move', (data) => {
    const { roomId, move, gameState, nextTurn, isMultiCapture } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Sala não encontrada' });
      return;
    }
    
    // Atualizar estado do jogo no servidor
    room.gameState = gameState;
    
    // Transmitir movimento para o outro jogador
    socket.to(roomId).emit('move-made', {
      move,
      gameState,
      nextTurn,
      isMultiCapture
    });
  });
  
  // Fim de jogo
  socket.on('game-over', (data) => {
    const { roomId, winner } = data;
    
    // Transmitir resultado para o outro jogador
    socket.to(roomId).emit('game-ended', { winner });
  });
  
  // Novo jogo
  socket.on('new-game', (data) => {
    const { roomId } = data;
    
    // Transmitir reinício para o outro jogador
    socket.to(roomId).emit('game-restarted');
  });
  
  // Desconexão
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
    
    // Encontrar todas as salas onde o jogador estava
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.includes(socket.id)) {
        // Remover jogador da sala
        room.players = room.players.filter(id => id !== socket.id);
        
        // Se ainda há jogadores na sala, notificar que o oponente saiu
        if (room.players.length > 0) {
          io.to(roomId).emit('opponent-left');
        } else {
          // Remover sala se estiver vazia
          rooms.delete(roomId);
          console.log(`Sala removida: ${roomId}`);
        }
      }
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DOMAIN = process.env.DOMAIN || 'localhost';

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} em modo ${NODE_ENV}`);
  console.log(`Acesse: http://${DOMAIN === 'localhost' ? DOMAIN + ':' + PORT : DOMAIN}`);
});
