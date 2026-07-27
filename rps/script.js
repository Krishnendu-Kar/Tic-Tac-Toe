document.addEventListener('DOMContentLoaded', () => {
    const playerChoiceDisplay = document.getElementById('player-choice');
    const computerChoiceDisplay = document.getElementById('computer-choice');
    const resultText = document.getElementById('result-text');
    const scorePlayerEl = document.getElementById('score-player');
    const scoreComputerEl = document.getElementById('score-computer');
    const choiceBtns = document.querySelectorAll('.choice-btn');

    const choices = ['rock', 'paper', 'scissors'];
    const emojis = { 'rock': '🪨', 'paper': '📄', 'scissors': '✂️' };
    
    let scorePlayer = 0;
    let scoreComputer = 0;

    choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const playerChoice = btn.getAttribute('data-choice');
            playGame(playerChoice);
        });
    });

    function playGame(playerChoice) {
        // Animation phase
        playerChoiceDisplay.innerText = '🤜';
        computerChoiceDisplay.innerText = '🤛';
        playerChoiceDisplay.classList.add('animate');
        computerChoiceDisplay.classList.add('animate');
        resultText.innerText = '...';

        // Wait for animation to finish
        setTimeout(() => {
            playerChoiceDisplay.classList.remove('animate');
            computerChoiceDisplay.classList.remove('animate');

            const computerChoice = choices[Math.floor(Math.random() * choices.length)];
            
            playerChoiceDisplay.innerText = emojis[playerChoice];
            computerChoiceDisplay.innerText = emojis[computerChoice];

            const result = getResult(playerChoice, computerChoice);
            updateUI(result);
        }, 500);
    }

    function getResult(p, c) {
        if (p === c) return 'draw';
        if (
            (p === 'rock' && c === 'scissors') ||
            (p === 'paper' && c === 'rock') ||
            (p === 'scissors' && c === 'paper')
        ) {
            return 'win';
        }
        return 'lose';
    }

    function updateUI(result) {
        if (result === 'win') {
            resultText.innerText = 'You Win! 🎉';
            resultText.style.color = '#10b981'; // Green
            scorePlayer++;
            scorePlayerEl.innerText = scorePlayer;
        } else if (result === 'lose') {
            resultText.innerText = 'Computer Wins! 😭';
            resultText.style.color = '#ef4444'; // Red
            scoreComputer++;
            scoreComputerEl.innerText = scoreComputer;
        } else {
            resultText.innerText = 'It\'s a Draw! 🤝';
            resultText.style.color = 'white';
        }
    }
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const restartBtn = document.getElementById('btn-restart') || document.getElementById('reset');
        const startBtn = document.getElementById('btn-start');
        
        if (startBtn && !startBtn.parentElement.classList.contains('hidden')) {
            startBtn.click();
            startBtn.blur();
        } else if (restartBtn) {
            const gameOver = document.getElementById('game-over');
            const msgCon = document.querySelector('.msg-container');
            if ((gameOver && !gameOver.classList.contains('hidden')) || (msgCon && msgCon.style.display !== 'none')) {
                restartBtn.click();
                restartBtn.blur();
            }
        }
    }
});
