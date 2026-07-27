document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const gameOverScreen = document.getElementById('game-over');
    const startScreen = document.getElementById('start-screen');
    const btnRestart = document.getElementById('btn-restart');
    const btnStart = document.getElementById('btn-start');
    const endMessage = document.getElementById('end-message');

    canvas.width = 800;
    canvas.height = 600;

    let score = 0;
    let lives = 3;
    let gameLoopId;
    let isPlaying = false;

    // Paddle
    const paddleHeight = 15;
    const paddleWidth = 120;
    let paddleX = (canvas.width - paddleWidth) / 2;

    // Ball
    let ballRadius = 10;
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 4;
    let dy = -4;

    // Bricks
    const brickRowCount = 5;
    const brickColumnCount = 9;
    const brickWidth = 75;
    const brickHeight = 25;
    const brickPadding = 10;
    const brickOffsetTop = 50;
    const brickOffsetLeft = (canvas.width - ((brickWidth + brickPadding) * brickColumnCount)) / 2 + 5;

    let bricks = [];

    function initBricks() {
        bricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1, color: `hsl(${r * 40 + c * 20}, 100%, 60%)` };
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#fff";
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
        ctx.fillStyle = "#a855f7";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#a855f7";
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }

    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = bricks[c][r].color;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = bricks[c][r].color;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
        ctx.shadowBlur = 0;
    }

    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let b = bricks[c][r];
                if (b.status === 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score += 10;
                        scoreEl.innerText = score;
                        if (score === brickRowCount * brickColumnCount * 10) {
                            endGame("You Win! 🎉");
                        }
                    }
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius - paddleHeight - 10) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                // Calculate bounce angle based on where it hit paddle
                let hitPoint = x - (paddleX + paddleWidth / 2);
                dx = hitPoint * 0.15;
                dy = -dy;
            } else if (y + dy > canvas.height - ballRadius) {
                lives--;
                livesEl.innerText = lives;
                if (!lives) {
                    endGame("Game Over");
                } else {
                    x = canvas.width / 2;
                    y = canvas.height - 40;
                    dx = 4;
                    dy = -4;
                    paddleX = (canvas.width - paddleWidth) / 2;
                }
            }
        }

        x += dx;
        y += dy;
    }

    function loop() {
        if (!isPlaying) return;
        draw();
        gameLoopId = requestAnimationFrame(loop);
    }

    function endGame(msg) {
        isPlaying = false;
        cancelAnimationFrame(gameLoopId);
        endMessage.innerText = msg;
        gameOverScreen.classList.remove('hidden');
    }

    function initGame() {
        initBricks();
        score = 0;
        lives = 3;
        scoreEl.innerText = score;
        livesEl.innerText = lives;
        x = canvas.width / 2;
        y = canvas.height - 40;
        dx = 4;
        dy = -4;
        paddleX = (canvas.width - paddleWidth) / 2;
        
        isPlaying = true;
        gameOverScreen.classList.add('hidden');
        startScreen.classList.add('hidden');
        btnStart.blur();
        btnRestart.blur();
        loop();
    }

    // Controls
    canvas.addEventListener('mousemove', (e) => {
        if(!isPlaying) return;
        let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let mouseX = (e.clientX - rect.left) * scaleX;
        paddleX = mouseX - paddleWidth / 2;
        if(paddleX < 0) paddleX = 0;
        if(paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    });

    canvas.addEventListener('touchmove', (e) => {
        if(!isPlaying) return;
        e.preventDefault();
        let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let touchX = (e.touches[0].clientX - rect.left) * scaleX;
        paddleX = touchX - paddleWidth / 2;
        if(paddleX < 0) paddleX = 0;
        if(paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }, {passive: false});
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!gameOverScreen.classList.contains('hidden') || !startScreen.classList.contains('hidden')) {
                initGame();
            }
        }
    });

    btnStart.addEventListener('click', initGame);
    btnRestart.addEventListener('click', initGame);
});
