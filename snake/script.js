document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('high-score');
    const gameOverScreen = document.getElementById('game-over');
    const restartBtn = document.getElementById('btn-restart');

    const gridSize = 10;
    const tileCount = canvas.width / gridSize;
    
    let snake = [];
    let velocity = { x: 0, y: 0 };
    let food = { x: 15, y: 15 };
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameLoop;
    let speed = 100;

    highScoreEl.innerText = highScore;

    function initGame() {
        snake = [{ x: 10, y: 10 }];
        velocity = { x: 1, y: 0 };
        score = 0;
        speed = 100;
        scoreEl.innerText = score;
        spawnFood();
        gameOverScreen.classList.add('hidden');
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, speed);
    }

    function update() {
        // Move snake
        const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return gameOver();
        }

        // Self collision
        for (let part of snake) {
            if (head.x === part.x && head.y === part.y) return gameOver();
        }

        snake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.innerText = score;
            spawnFood();
            // Increase speed slightly
            if (speed > 50) {
                speed -= 2;
                clearInterval(gameLoop);
                gameLoop = setInterval(update, speed);
            }
        } else {
            snake.pop();
        }

        draw();
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw food (Neon Red)
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw snake (Neon Green)
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        snake.forEach((part, index) => {
            if (index === 0) ctx.shadowBlur = 10; // Head glow
            else ctx.shadowBlur = 0;
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
        });
        ctx.shadowBlur = 0; // Reset
    }

    function spawnFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // Ensure food doesn't spawn on snake
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) spawnFood();
        }
    }

    function gameOver() {
        clearInterval(gameLoop);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreEl.innerText = highScore;
        }
        gameOverScreen.classList.remove('hidden');
    }

    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                if (velocity.y !== 1) velocity = { x: 0, y: -1 }; break;
            case 'ArrowDown':
            case 's':
                if (velocity.y !== -1) velocity = { x: 0, y: 1 }; break;
            case 'ArrowLeft':
            case 'a':
                if (velocity.x !== 1) velocity = { x: -1, y: 0 }; break;
            case 'ArrowRight':
            case 'd':
                if (velocity.x !== -1) velocity = { x: 1, y: 0 }; break;
        }
    });

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
