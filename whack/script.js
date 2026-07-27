document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const scoreEl = document.getElementById('score');
    const timeLeftEl = document.getElementById('time-left');
    const gameOverScreen = document.getElementById('game-over');
    const startScreen = document.getElementById('start-screen');
    const btnRestart = document.getElementById('btn-restart');
    const btnStart = document.getElementById('btn-start');
    const finalScoreEl = document.getElementById('final-score');

    let holes = [];
    let lastHole;
    let timeUp = false;
    let score = 0;
    let timeLeft = 30;
    let countdownTimer;

    // Create 9 holes
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.classList.add('hole');
        const mole = document.createElement('div');
        mole.classList.add('mole');
        hole.appendChild(mole);
        grid.appendChild(hole);
        holes.push(hole);

        // Click event on mole
        mole.addEventListener('pointerdown', (e) => {
            if(!e.isTrusted) return; // prevent fake clicks
            if(!hole.classList.contains('up')) return;
            score++;
            hole.classList.remove('up');
            hole.classList.add('whacked');
            scoreEl.innerText = score;
            
            setTimeout(() => {
                hole.classList.remove('whacked');
            }, 300);
        });
    }

    function randomTime(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    function randomHole(holesList) {
        const idx = Math.floor(Math.random() * holesList.length);
        const hole = holesList[idx];
        if (hole === lastHole) {
            return randomHole(holesList);
        }
        lastHole = hole;
        return hole;
    }

    function peep() {
        const time = randomTime(400, 1000);
        const hole = randomHole(holes);
        hole.classList.add('up');
        setTimeout(() => {
            hole.classList.remove('up');
            if (!timeUp) peep();
        }, time);
    }

    function countdown() {
        timeLeft--;
        timeLeftEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            timeUp = true;
            finalScoreEl.innerText = score;
            setTimeout(() => {
                gameOverScreen.classList.remove('hidden');
            }, 500); // Wait for last mole to drop
        }
    }

    function startGame() {
        score = 0;
        timeLeft = 30;
        timeUp = false;
        scoreEl.innerText = 0;
        timeLeftEl.innerText = 30;
        gameOverScreen.classList.add('hidden');
        startScreen.classList.add('hidden');
        
        peep();
        countdownTimer = setInterval(countdown, 1000);
    }

    btnStart.addEventListener('click', startGame);
    btnRestart.addEventListener('click', startGame);
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
