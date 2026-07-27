document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const flipsEl = document.getElementById('flips');
    const matchesEl = document.getElementById('matches');
    const gameOverScreen = document.getElementById('game-over');
    const restartBtn = document.getElementById('btn-restart');

    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let flips = 0;
    let matches = 0;

    function initGame() {
        grid.innerHTML = '';
        flips = 0;
        matches = 0;
        flipsEl.innerText = flips;
        matchesEl.innerText = matches;
        gameOverScreen.classList.add('hidden');
        hasFlippedCard = false;
        lockBoard = false;
        firstCard = null;
        secondCard = null;

        cards = [...emojis, ...emojis];
        cards.sort(() => Math.random() - 0.5); // Shuffle

        cards.forEach((emoji) => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('card');
            cardEl.dataset.emoji = emoji;

            cardEl.innerHTML = `
                <div class="card-face card-front">${emoji}</div>
                <div class="card-face card-back"></div>
            `;
            
            cardEl.addEventListener('click', flipCard);
            grid.appendChild(cardEl);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        flips++;
        flipsEl.innerText = flips;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        matches++;
        matchesEl.innerText = matches;

        if (matches === emojis.length) {
            setTimeout(() => {
                gameOverScreen.classList.remove('hidden');
            }, 500);
        }

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    restartBtn.addEventListener('click', initGame);
    initGame();
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
