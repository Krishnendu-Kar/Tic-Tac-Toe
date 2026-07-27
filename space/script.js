document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highscoreEl = document.getElementById('highscore');
    const gameOverScreen = document.getElementById('game-over');
    const startScreen = document.getElementById('start-screen');
    const btnRestart = document.getElementById('btn-restart');
    const btnStart = document.getElementById('btn-start');
    const endMessage = document.getElementById('end-message');
    
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnFire = document.getElementById('btn-fire');

    canvas.width = 600;
    canvas.height = 600;

    let score = 0;
    let highscore = localStorage.getItem('spaceHighScore') || 0;
    highscoreEl.innerText = highscore;
    let gameLoopId;
    let isPlaying = false;

    // Player
    const playerWidth = 40;
    const playerHeight = 20;
    let playerX = (canvas.width - playerWidth) / 2;
    const playerY = canvas.height - 40;
    const playerSpeed = 5;

    let keys = { ArrowLeft: false, ArrowRight: false, Space: false };
    
    // Touch controls
    let touchLeft = false;
    let touchRight = false;
    
    btnLeft.addEventListener('pointerdown', () => touchLeft = true);
    btnLeft.addEventListener('pointerup', () => touchLeft = false);
    btnLeft.addEventListener('pointerout', () => touchLeft = false);
    
    btnRight.addEventListener('pointerdown', () => touchRight = true);
    btnRight.addEventListener('pointerup', () => touchRight = false);
    btnRight.addEventListener('pointerout', () => touchRight = false);
    
    btnFire.addEventListener('pointerdown', () => { if(isPlaying && bullets.length < 3) shoot(); });

    // Bullets
    let bullets = [];
    
    // Enemies
    const enemyRows = 4;
    const enemyCols = 8;
    const enemyWidth = 30;
    const enemyHeight = 20;
    const enemyPadding = 15;
    const enemyOffsetTop = 50;
    const enemyOffsetLeft = 50;
    let enemies = [];
    let enemyDirection = 1; // 1 for right, -1 for left
    let enemySpeed = 1;
    let enemyDescend = false;

    function initEnemies() {
        enemies = [];
        for(let c=0; c<enemyCols; c++) {
            for(let r=0; r<enemyRows; r++) {
                enemies.push({
                    x: (c * (enemyWidth + enemyPadding)) + enemyOffsetLeft,
                    y: (r * (enemyHeight + enemyPadding)) + enemyOffsetTop,
                    status: 1
                });
            }
        }
    }

    function drawPlayer() {
        ctx.fillStyle = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22d3ee';
        ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
        ctx.fillRect(playerX + 15, playerY - 10, 10, 10);
        ctx.shadowBlur = 0;
    }

    function drawEnemies() {
        ctx.fillStyle = '#fb7185';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fb7185';
        enemies.forEach(e => {
            if(e.status === 1) {
                ctx.fillRect(e.x, e.y, enemyWidth, enemyHeight);
            }
        });
        ctx.shadowBlur = 0;
    }

    function drawBullets() {
        ctx.fillStyle = '#fde047';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fde047';
        bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, 4, 15);
        });
        ctx.shadowBlur = 0;
    }

    function shoot() {
        bullets.push({
            x: playerX + playerWidth / 2 - 2,
            y: playerY - 15
        });
    }

    function update() {
        // Move player
        if ((keys.ArrowLeft || touchLeft) && playerX > 0) {
            playerX -= playerSpeed;
        }
        if ((keys.ArrowRight || touchRight) && playerX < canvas.width - playerWidth) {
            playerX += playerSpeed;
        }

        // Move bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= 8;
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
            }
        }

        // Move enemies
        let hitEdge = false;
        let activeEnemies = 0;
        enemies.forEach(e => {
            if(e.status === 1) {
                activeEnemies++;
                e.x += enemySpeed * enemyDirection;
                if (e.x + enemyWidth > canvas.width || e.x < 0) {
                    hitEdge = true;
                }
            }
        });

        if (hitEdge) {
            enemyDirection *= -1;
            enemies.forEach(e => {
                if(e.status === 1) e.y += 20;
            });
            enemySpeed += 0.2; // Increase speed slightly when dropping
        }

        // Collision detection
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            let hit = false;
            for (let j = 0; j < enemies.length; j++) {
                let e = enemies[j];
                if (e.status === 1) {
                    if (b.x > e.x && b.x < e.x + enemyWidth && b.y > e.y && b.y < e.y + enemyHeight) {
                        e.status = 0;
                        activeEnemies--;
                        hit = true;
                        score += 10;
                        scoreEl.innerText = score;
                        break;
                    }
                }
            }
            if (hit) {
                bullets.splice(i, 1);
            }
        }

        // Check win/lose
        if (activeEnemies === 0 && enemies.length > 0) {
            endGame("You Saved the Galaxy!");
        }

        enemies.forEach(e => {
            if (e.status === 1 && e.y + enemyHeight >= playerY) {
                endGame("Invasion Successful...");
            }
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawEnemies();
        drawBullets();
    }

    function loop() {
        if (!isPlaying) return;
        update();
        draw();
        gameLoopId = requestAnimationFrame(loop);
    }

    function endGame(msg) {
        isPlaying = false;
        cancelAnimationFrame(gameLoopId);
        endMessage.innerText = msg;
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('spaceHighScore', highscore);
            highscoreEl.innerText = highscore;
        }
        gameOverScreen.classList.remove('hidden');
    }

    function initGame() {
        initEnemies();
        score = 0;
        scoreEl.innerText = score;
        playerX = (canvas.width - playerWidth) / 2;
        bullets = [];
        enemyDirection = 1;
        enemySpeed = 1.5;
        
        isPlaying = true;
        gameOverScreen.classList.add('hidden');
        startScreen.classList.add('hidden');
        btnStart.blur();
        btnRestart.blur();
        loop();
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
        if (e.code === 'ArrowRight') keys.ArrowRight = true;
        if (e.code === 'Space') {
            e.preventDefault(); // stop scrolling
            if(isPlaying && bullets.length < 3) shoot();
        }
        if (e.key === 'Enter') {
            if (!gameOverScreen.classList.contains('hidden') || !startScreen.classList.contains('hidden')) {
                initGame();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
        if (e.code === 'ArrowRight') keys.ArrowRight = false;
    });

    btnStart.addEventListener('click', initGame);
    btnRestart.addEventListener('click', initGame);
});
