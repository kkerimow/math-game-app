const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Socket.IO setup
const io = new Server(server, {
  cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/users', userRoutes);

// Game state management
const games = new Map();

function generateQuestion(operation) {
  const num1 = Math.floor(Math.random() * 100);
  const num2 = Math.floor(Math.random() * 100);
    let question, answer;

    switch (operation) {
    case '+':
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
      break;
    case '-':
            question = `${num1} - ${num2}`;
            answer = num1 - num2;
      break;
    case '*':
            question = `${num1} × ${num2}`;
            answer = num1 * num2;
      break;
    case '/':
            const divisor = Math.floor(Math.random() * 10) + 1;
            const dividend = divisor * (Math.floor(Math.random() * 10) + 1);
            question = `${dividend} ÷ ${divisor}`;
            answer = dividend / divisor;
            break;
    }
    return { question, answer };
}

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGame', ({ username, operation }) => {
        console.log(`${username} trying to join game with operation: ${operation}`);
        let gameRoom = null;

        // Find an available game or create a new one
        for (const [room, game] of games.entries()) {
            if (game.players.length === 1 && game.operation === operation && !game.started) {
                gameRoom = room;
                break;
            }
        }

        if (!gameRoom) {
            gameRoom = `game_${Date.now()}`;
            games.set(gameRoom, {
                players: [],
                operation,
                scores: {},
                currentQuestion: null,
                started: false
            });
            console.log(`Created new game room: ${gameRoom}`);
        }

        const game = games.get(gameRoom);
        game.players.push({ id: socket.id, username });
        game.scores[username] = 0;
        
        socket.join(gameRoom);
        socket.gameRoom = gameRoom;

        console.log(`Players in room ${gameRoom}:`, game.players.length);

        // Start game if we have 2 players
        if (game.players.length === 2) {
            game.started = true;
            const question = generateQuestion(game.operation);
            game.currentQuestion = question;
            
            console.log(`Starting game in room ${gameRoom}`);
            io.to(gameRoom).emit('gameStart', {
                players: game.players.map(p => ({ username: p.username }))
            });
            io.to(gameRoom).emit('newQuestion', { 
                question: question.question,
                answer: question.answer 
            });
        }
    });

    socket.on('submitAnswer', ({ answer, username }) => {
        const gameRoom = socket.gameRoom;
        const game = games.get(gameRoom);
        
        if (game && game.currentQuestion) {
            const isCorrect = Math.abs(answer - game.currentQuestion.answer) < 0.001;
            
            if (isCorrect) {
                game.scores[username]++;
                
                // Skor güncellemesini gönder
                io.to(gameRoom).emit('updateScores', { 
                    scores: game.scores,
                    correct: isCorrect,
                    answeredBy: username
                });

                // Yeni soru gönder
                const question = generateQuestion(game.operation);
                game.currentQuestion = question;
                io.to(gameRoom).emit('newQuestion', { 
                    question: question.question,
                    answer: question.answer 
                });
            }
        }
    });

    socket.on('timeUp', () => {
        const gameRoom = socket.gameRoom;
        const game = games.get(gameRoom);
        
        if (game) {
            const scores = game.scores;
            const players = Object.keys(scores);
            let winner;
            
            if (scores[players[0]] === scores[players[1]]) {
                winner = 'tie';
            } else {
                winner = scores[players[0]] > scores[players[1]] ? players[0] : players[1];
            }
            
            io.to(gameRoom).emit('gameOver', { winner, scores });
            games.delete(gameRoom);
        }
  });

  socket.on('disconnect', () => {
        const gameRoom = socket.gameRoom;
        if (gameRoom) {
            const game = games.get(gameRoom);
            if (game) {
                const remainingPlayer = game.players.find(p => p.id !== socket.id)?.username;
                if (remainingPlayer) {
                    io.to(gameRoom).emit('gameOver', {
                        winner: remainingPlayer,
                        scores: game.scores
                    });
                }
                games.delete(gameRoom);
            }
        }
        console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
