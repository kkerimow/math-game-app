const params = new URLSearchParams(window.location.search);
const gameId = params.get('gameId');

async function fetchGameDetails() {
    try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}`);
        const game = await response.json();

        const players = game.players.map(p => p.username).join(' vs ');
        document.querySelector('.scoreboard').textContent = players;
    } catch (error) {
        console.error('Error fetching game details:', error);
    }
}

fetchGameDetails();

document.addEventListener('DOMContentLoaded', () => {
    // DOM elementlerini seç
    const timerElement = document.getElementById('timer');
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const scoreElement = document.getElementById('player1-score');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');

    // Oyun değişkenleri
    let timeLeft = 120; // 2 dakika
    let score = 0;
    let currentAnswer = null;
    let timerInterval;
    const operation = new URLSearchParams(window.location.search).get('operation');

    // Soru üret
    function generateQuestion() {
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
            default:
                question = "Invalid operation";
                answer = 0;
        }
        return { question, answer };
    }

    // Oyunu başlat
    function startGame() {
        const { question, answer } = generateQuestion();
        questionElement.textContent = question;
        currentAnswer = answer;
        answerInput.value = '';
        answerInput.focus();
        startTimer();
    }

    // Zamanlayıcıyı başlat
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // Cevabı kontrol et
    function validateAnswer(input) {
        const userAnswer = parseFloat(input);
        if (isNaN(userAnswer)) return false;
        return Math.abs(userAnswer - currentAnswer) < 0.001;
    }

    // Oyunu bitir
    function endGame() {
        clearInterval(timerInterval);
        answerInput.disabled = true;
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'block';
    }

    // Cevap girişini dinle
    answerInput.addEventListener('input', (e) => {
        if (validateAnswer(e.target.value)) {
            score++;
            scoreElement.textContent = score;
            const { question, answer } = generateQuestion();
            questionElement.textContent = question;
            currentAnswer = answer;
            answerInput.value = '';
            answerInput.focus();
        }
    });

    // Oyunu başlat
    startGame();
});
