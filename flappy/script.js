document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highscoreEl = document.getElementById('highscore');
    const gameOverScreen = document.getElementById('game-over');
    const startScreen = document.getElementById('start-screen');
    const btnRestart = document.getElementById('btn-restart');
    const btnStart = document.getElementById('btn-start');

    // Internal game resolution (logical resolution)
    // We scale this up using CSS
    canvas.width = 400;
    canvas.height = 600;

    let score = 0;
    let highscore = localStorage.getItem('flappyHighScore') || 0;
    highscoreEl.innerText = highscore;

    let gameLoopId;
    let isPlaying = false;
    let frame = 0;

    const gravity = 0.4;
    const jump = -7;

    let bird = {
        x: 50,
        y: canvas.height / 2,
        width: 20,
        height: 20,
        velocity: 0,
        draw() {
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            // Tilt based on velocity
            let angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));
            ctx.rotate(angle);

            ctx.fillStyle = '#eab308'; // Primary yellow
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#eab308';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Wing
            ctx.fillStyle = '#ca8a04'; 
            ctx.fillRect(-this.width/2 - 2, -this.height/2 + 8, 10, 8);

            // Beak
            ctx.fillStyle = '#f97316'; 
            ctx.fillRect(this.width/2 - 2, -this.height/2 + 10, 8, 6);

            // Eye
            ctx.fillStyle = 'white';
            ctx.fillRect(this.width/2 - 8, -this.height/2 + 4, 6, 6);
            ctx.fillStyle = 'black';
            ctx.fillRect(this.width/2 - 6, -this.height/2 + 5, 3, 3);
            
            ctx.restore();
        },
        update() {
            this.velocity += gravity;
            this.y += this.velocity;
            
            if(this.y + this.height >= canvas.height) {
                this.y = canvas.height - this.height;
                gameOver();
            }
            if(this.y <= 0) {
                this.y = 0;
                this.velocity = 0;
            }
        },
        flap() {
            this.velocity = jump;
        }
    };

    let pipes = [];
    const pipeWidth = 60;
    const pipeGap = 150;

    function drawPipes() {
        ctx.fillStyle = '#10b981'; // Green pipes
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';
        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            // Top pipe
            ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
            // Bottom pipe
            ctx.fillRect(p.x, canvas.height - p.bottomHeight, pipeWidth, p.bottomHeight);
        }
        ctx.shadowBlur = 0;
    }

    function updatePipes() {
        if (frame % 150 === 0) {
            // Spawn pipe
            let minPipeHeight = 50;
            let maxPipeHeight = canvas.height - pipeGap - minPipeHeight;
            let topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
            let bottomHeight = canvas.height - pipeGap - topHeight;
            
            pipes.push({
                x: canvas.width,
                topHeight: topHeight,
                bottomHeight: bottomHeight,
                passed: false
            });
        }

        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            p.x -= 2; // Pipe speed

            // Collision detection
            if (bird.x < p.x + pipeWidth && bird.x + bird.width > p.x) {
                if (bird.y < p.topHeight || bird.y + bird.height > canvas.height - p.bottomHeight) {
                    gameOver();
                }
            }

            // Score update
            if (p.x + pipeWidth < bird.x && !p.passed) {
                score++;
                scoreEl.innerText = score;
                p.passed = true;
            }
        }

        // Remove offscreen pipes
        if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
            pipes.shift();
        }
    }

    function initGame() {
        bird.y = canvas.height / 2;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        scoreEl.innerText = score;
        frame = 0;
        isPlaying = true;
        gameOverScreen.classList.add('hidden');
        startScreen.classList.add('hidden');
        btnStart.blur();
        btnRestart.blur();
        loop();
    }

    function loop() {
        if (!isPlaying) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        bird.draw();
        bird.update();
        
        drawPipes();
        updatePipes();

        frame++;
        gameLoopId = requestAnimationFrame(loop);
    }

    function gameOver() {
        isPlaying = false;
        cancelAnimationFrame(gameLoopId);
        gameOverScreen.classList.remove('hidden');
        
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('flappyHighScore', highscore);
            highscoreEl.innerText = highscore;
        }
    }

    function input() {
        if (isPlaying) {
            bird.flap();
        }
    }

    // Controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            input();
        }
    });
    canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        input();
    });

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
