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
    const resultElement = document.getElementById('result');
    const gameOverScreen = document.getElementById('game-over');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalScoreElement = document.getElementById('final-score');
    const correctAnswersElement = document.getElementById('correct-answers');
    const wrongAnswersElement = document.getElementById('wrong-answers');
    const totalQuestionsElement = document.getElementById('total-questions');

    // Oyun değişkenleri
    let timeLeft = 120; // 2 dakika
    let score = 0;
    let currentAnswer = null;
    let timerInterval;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let totalQuestions = 0;
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
        // Değişkenleri sıfırla
        score = 0;
        correctAnswers = 0;
        wrongAnswers = 0;
        totalQuestions = 0;
        timeLeft = 120;
        
        // Skorları sıfırla
        scoreElement.textContent = '0';
        
        // İlk soruyu göster
        const { question, answer } = generateQuestion();
        questionElement.textContent = question;
        currentAnswer = answer;
        answerInput.value = '';
        answerInput.focus();
        
        // Zamanlayıcıyı başlat
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

    // Cevabı kontrol et ve yeni soruya geç
    function checkAnswerAndNext() {
        const userAnswer = parseFloat(answerInput.value);
        if (!isNaN(userAnswer)) {
            totalQuestions++;

            if (Math.abs(userAnswer - currentAnswer) < 0.001) {
                // Doğru cevap
                score += 10;
                correctAnswers++;
                // Skoru güncelle - eski değeri tamamen değiştir
                scoreElement.innerHTML = score;
                resultElement.textContent = 'Correct!';
                resultElement.style.color = '#2ecc71';
            } else {
                // Yanlış cevap
                wrongAnswers++;
                resultElement.textContent = `Wrong! Correct answer: ${currentAnswer}`;
                resultElement.style.color = '#e74c3c';
            }

            // 1 saniye sonra yeni soruya geç
            setTimeout(() => {
                resultElement.textContent = '';
                const { question, answer } = generateQuestion();
                questionElement.textContent = question;
                currentAnswer = answer;
                answerInput.value = '';
                answerInput.focus();
            }, 1000);
        }
    }

    // Oyunu bitir
    function endGame() {
        clearInterval(timerInterval);
        answerInput.disabled = true;
        
        // İstatistikleri güncelle
        finalScoreElement.textContent = score.toString();
        correctAnswersElement.textContent = correctAnswers.toString();
        wrongAnswersElement.textContent = wrongAnswers.toString();
        totalQuestionsElement.textContent = totalQuestions.toString();
        
        // Game over ekranını göster
        gameOverOverlay.style.display = 'block';
        gameOverScreen.style.display = 'block';
    }

    // Enter tuşuna basıldığında cevabı kontrol et
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && answerInput.value.trim() !== '') {
            checkAnswerAndNext();
        }
    });

    // Oyunu başlat
    startGame();
});
