document.addEventListener('DOMContentLoaded', () => {
    const socket = io(window.API_URL, {
        transports: ['websocket', 'polling'],
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const waitingRoom = document.getElementById('waiting-room');
    const gameContainer = document.getElementById('game-container');
    const gameOver = document.getElementById('game-over');
    const player1Name = document.getElementById('player1-name');
    const player2Name = document.getElementById('player2-name');
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const timerElement = document.getElementById('timer');
    const resultElement = document.getElementById('result');

    // Check if all required elements exist
    if (!waitingRoom || !gameContainer || !gameOver || !player1Name || 
        !player2Name || !questionElement || !answerInput || !timerElement) {
        console.error('Required DOM elements not found');
        return;
    }

    const username = localStorage.getItem('username');
    const operation = new URLSearchParams(window.location.search).get('operation');
    let gameStarted = false;
    let timeLeft = 120; // 2 minutes
    let timerInterval;
    let currentAnswer = null;

    function focusInput() {
        answerInput.focus();
    }

    function validateAnswer(input) {
        const userAnswer = parseFloat(input);
        if (isNaN(userAnswer)) return false;
        return Math.abs(userAnswer - currentAnswer) < 0.001;
    }

    function updateInputStyle(isCorrect) {
        answerInput.classList.remove('correct', 'wrong');
        if (isCorrect) {
            answerInput.classList.add('correct');
        } else {
            answerInput.classList.add('wrong');
        }
    }

    console.log('Connecting with username:', username, 'operation:', operation);

    // Socket event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
        
        if (username && operation) {
            socket.emit('joinGame', { username, operation });
            console.log('Emitted joinGame event');
        } else {
            console.error('Missing username or operation');
            alert('Please start from the main page and make sure you are logged in.');
            window.location.href = 'index2.html';
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });

    // Listen for game start
    socket.on('gameStart', ({ players }) => {
        console.log('Game starting with players:', players);
        gameStarted = true;
        waitingRoom.style.display = 'none';
        gameContainer.style.display = 'block';
        
        player1Name.textContent = players[0].username;
        player2Name.textContent = players[1].username;
        
        startTimer();
        focusInput();
    });

    // Listen for new questions
    socket.on('newQuestion', ({ question, answer }) => {
        console.log('New question received:', question);
        questionElement.textContent = question;
        currentAnswer = answer;
        answerInput.value = '';
        answerInput.classList.remove('correct', 'wrong');
        focusInput(); 
    });

    socket.on('updateScores', ({ scores, correct, answeredBy }) => {
        console.log('Score update:', scores);
        Object.entries(scores).forEach(([player, score], index) => {
            const scoreElement = document.getElementById(`player${index + 1}-score`);
            if (scoreElement) {
                scoreElement.textContent = score;
            }
        });

        if (answeredBy === username) {
            updateInputStyle(correct);
        }
    });

    // Handle answer submission
    answerInput.addEventListener('input', (e) => {
        if (gameStarted) {
            const isCorrect = validateAnswer(e.target.value);
            updateInputStyle(isCorrect);

            if (isCorrect) {
                socket.emit('submitAnswer', { answer: parseFloat(e.target.value), username });
            }
        }
    });

    // Listen for game over
    socket.on('gameOver', ({ winner, scores }) => {
        console.log('Game over - Winner:', winner, 'Scores:', scores);
        clearInterval(timerInterval);
        gameContainer.style.display = 'none';
        gameOver.style.display = 'block';
        
        const finalResult = document.getElementById('final-result');
        if (finalResult) {
            if (winner === 'tie') {
                finalResult.textContent = "It's a tie!";
            } else {
                finalResult.textContent = `${winner} wins with ${scores[winner]} points!`;
            }
        }
    });

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                console.log('Time up!');
                socket.emit('timeUp');
                clearInterval(timerInterval);
            }
        }, 1000);
    }
});