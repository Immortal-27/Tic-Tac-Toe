const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory game rooms ──────────────────────────────────────────────
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms.has(code) ? generateRoomCode() : code;
}

function createRoom(code, hostId) {
  return {
    code,
    players: [{ id: hostId, symbol: 'X', name: '' }],
    board: Array(9).fill(null),
    turn: 'X',
    scores: { X: 0, O: 0, draws: 0 },
    gameOver: false,
    winner: null,
    winLine: null,
  };
}

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],  // rows
  [0,3,6],[1,4,7],[2,5,8],  // cols
  [0,4,8],[2,4,6],           // diags
];

function checkWinner(board) {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winLine: combo };
    }
  }
  if (board.every(cell => cell !== null)) return { winner: 'draw', winLine: null };
  return null;
}

// ── Socket.IO events ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`⚡ Connected: ${socket.id}`);

  // Create a new room
  socket.on('createRoom', (playerName, callback) => {
    const code = generateRoomCode();
    const room = createRoom(code, socket.id);
    room.players[0].name = playerName || 'Player 1';
    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    callback({ success: true, code, symbol: 'X' });
    console.log(`🏠 Room ${code} created by ${socket.id}`);
  });

  // Join an existing room
  socket.on('joinRoom', (data, callback) => {
    const { code, playerName } = data;
    const room = rooms.get(code);

    if (!room) return callback({ success: false, message: 'Room not found.' });
    if (room.players.length >= 2) return callback({ success: false, message: 'Room is full.' });

    room.players.push({ id: socket.id, symbol: 'O', name: playerName || 'Player 2' });
    socket.join(code);
    socket.roomCode = code;
    callback({ success: true, code, symbol: 'O' });

    // Notify both players the game is starting
    io.to(code).emit('gameStart', {
      board: room.board,
      turn: room.turn,
      scores: room.scores,
      players: room.players.map(p => ({ symbol: p.symbol, name: p.name })),
    });
    console.log(`🎮 Room ${code} — game started!`);
  });

  // Handle a move
  socket.on('makeMove', (index) => {
    const code = socket.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room || room.gameOver) return;

    // Identify player
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    if (room.turn !== player.symbol) return; // not your turn
    if (room.board[index] !== null) return;  // cell taken

    room.board[index] = player.symbol;
    const result = checkWinner(room.board);

    if (result) {
      room.gameOver = true;
      room.winner = result.winner;
      room.winLine = result.winLine;
      if (result.winner === 'draw') {
        room.scores.draws++;
      } else {
        room.scores[result.winner]++;
      }
    } else {
      room.turn = room.turn === 'X' ? 'O' : 'X';
    }

    io.to(code).emit('moveMade', {
      board: room.board,
      turn: room.turn,
      gameOver: room.gameOver,
      winner: room.winner,
      winLine: room.winLine,
      scores: room.scores,
    });
  });

  // Restart / rematch
  socket.on('restartGame', () => {
    const code = socket.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    room.board = Array(9).fill(null);
    room.turn = 'X';
    room.gameOver = false;
    room.winner = null;
    room.winLine = null;

    io.to(code).emit('gameRestarted', {
      board: room.board,
      turn: room.turn,
      scores: room.scores,
      players: room.players.map(p => ({ symbol: p.symbol, name: p.name })),
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const code = socket.roomCode;
    if (code) {
      const room = rooms.get(code);
      if (room) {
        io.to(code).emit('opponentLeft');
        rooms.delete(code);
      }
    }
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
});

// ── Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Tic-Tac-Toe server running at http://localhost:${PORT}\n`);
});
