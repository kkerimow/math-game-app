let selectedOperation = null;

function selectOperation(operation) {
    document.querySelectorAll('.buttons-container button').forEach(button => {
        button.classList.remove('selected');
    });
    selectedOperation = operation;
    document.getElementById(getButtonId(operation)).classList.add('selected');
}

function getButtonId(operation) {
    switch (operation) {
        case '+': return 'add';
        case '-': return 'subtract';
        case '/': return 'divide';
        case '*': return 'multiply';
    }
}

function playSingleplayer() {
    if (!selectedOperation) {
        alert('Please select an operation first.');
        return;
    }
    countdown('single');
}

function playMultiplayer() {
    if (!selectedOperation) {
        alert('Please select an operation first.');
        return;
    }
    countdown('multi');
}

function countdown(mode) {
    const countdownElement = document.getElementById('countdown');
    countdownElement.style.display = 'block';
    let countdown = 3;

    countdownElement.textContent = countdown;

    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown === 0) {
            clearInterval(interval);
            countdownElement.style.display = 'none';
            if (mode === 'single') {
                window.location.href = `game.html?operation=${encodeURIComponent(selectedOperation)}`;
            } else {
                window.location.href = `multiplayer.html?operation=${encodeURIComponent(selectedOperation)}`;
            }
        }
    }, 1000);
}