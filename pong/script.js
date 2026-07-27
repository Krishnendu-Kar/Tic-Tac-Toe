document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scorePlayerEl = document.getElementById('score-player');
    const scoreComputerEl = document.getElementById('score-computer');
    const gameOverScreen = document.getElementById('game-over');
    const startScreen = document.getElementById('start-screen');
    const btnRestart = document.getElementById('btn-restart');
    const btnStart = document.getElementById('btn-start');
    const winnerText = document.getElementById('winnerText');

    // Internal logic size
    canvas.width = 800;
    canvas.height = 600;

    let scorePlayer = 0;
    let scoreComputer = 0;
    const maxScore = 5;

    let gameLoopId;
    let isPlaying = false;

    // Paddle objects
    const paddleWidth = 10;
    const paddleHeight = 100;
    
    let player = {
        x: 20,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#06b6d4',
        dy: 0
    };

    let computer = {
        x: canvas.width - 20 - paddleWidth,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#ef4444',
        dy: 4
    };

    // Ball object
    let ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speed: 6,
        dx: 6,
        dy: 6,
        color: 'white'
    };

    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fillRect(x, y, w, h);
        ctx.shadowBlur = 0;
    }

    function drawCircle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawNet() {
        for (let i = 0; i <= canvas.height; i += 40) {
            drawRect(canvas.width / 2 - 1, i, 2, 20, 'rgba(255,255,255,0.2)');
        }
    }

    function collision(b, p) {
        let pTop = p.y;
        let pBottom = p.y + p.height;
        let pLeft = p.x;
        let pRight = p.x + p.width;

        let bTop = b.y - b.radius;
        let bBottom = b.y + b.radius;
        let bLeft = b.x - b.radius;
        let bRight = b.x + b.radius;

        return bRight > pLeft && bTop < pBottom && bLeft < pRight && bBottom > pTop;
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 6;
        ball.dx = -ball.dx; // Serve to the one who scored
    }

    function update() {
        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Computer AI (chase ball)
        let computerLevel = 0.1;
        computer.y += (ball.y - (computer.y + computer.height / 2)) * computerLevel;

        // Keep paddles inside canvas
        if(player.y < 0) player.y = 0;
        if(player.y + player.height > canvas.height) player.y = canvas.height - player.height;
        
        if(computer.y < 0) computer.y = 0;
        if(computer.y + computer.height > canvas.height) computer.y = canvas.height - computer.height;

        // Top/Bottom collision for ball
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.dy = -ball.dy;
        }

        // Check which paddle to check collision with
        let paddle = (ball.x < canvas.width / 2) ? player : computer;

        if (collision(ball, paddle)) {
            // Where ball hit paddle
            let collidePoint = ball.y - (paddle.y + paddle.height / 2);
            collidePoint = collidePoint / (paddle.height / 2);
            
            // Angle
            let angleRad = (Math.PI / 4) * collidePoint;
            
            let direction = (ball.x < canvas.width / 2) ? 1 : -1;
            
            ball.dx = direction * ball.speed * Math.cos(angleRad);
            ball.dy = ball.speed * Math.sin(angleRad);
            
            // Speed up
            ball.speed += 0.5;
        }

        // Score update
        if (ball.x - ball.radius < 0) {
            scoreComputer++;
            scoreComputerEl.innerText = scoreComputer;
            checkWinner();
            resetBall();
        } else if (ball.x + ball.radius > canvas.width) {
            scorePlayer++;
            scorePlayerEl.innerText = scorePlayer;
            checkWinner();
            resetBall();
        }
    }

    function checkWinner() {
        if(scorePlayer >= maxScore || scoreComputer >= maxScore) {
            isPlaying = false;
            winnerText.innerText = (scorePlayer >= maxScore) ? "You Win! 🎉" : "Computer Wins! 😭";
            gameOverScreen.classList.remove('hidden');
        }
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawNet();
        drawRect(player.x, player.y, player.width, player.height, player.color);
        drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
        drawCircle(ball.x, ball.y, ball.radius, ball.color);
    }

    function loop() {
        if (!isPlaying) return;
        update();
        draw();
        gameLoopId = requestAnimationFrame(loop);
    }

    function initGame() {
        scorePlayer = 0;
        scoreComputer = 0;
        scorePlayerEl.innerText = scorePlayer;
        scoreComputerEl.innerText = scoreComputer;
        player.y = canvas.height / 2 - paddleHeight / 2;
        computer.y = canvas.height / 2 - paddleHeight / 2;
        resetBall();
        isPlaying = true;
        
        gameOverScreen.classList.add('hidden');
        startScreen.classList.add('hidden');
        loop();
    }

    // Controls
    canvas.addEventListener('mousemove', (e) => {
        if(!isPlaying) return;
        let rect = canvas.getBoundingClientRect();
        let scaleY = canvas.height / rect.height;
        player.y = (e.clientY - rect.top) * scaleY - player.height / 2;
    });

    canvas.addEventListener('touchmove', (e) => {
        if(!isPlaying) return;
        e.preventDefault();
        let rect = canvas.getBoundingClientRect();
        let scaleY = canvas.height / rect.height;
        player.y = (e.touches[0].clientY - rect.top) * scaleY - player.height / 2;
    }, {passive: false});

    btnStart.addEventListener('click', initGame);
    btnRestart.addEventListener('click', initGame);
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
