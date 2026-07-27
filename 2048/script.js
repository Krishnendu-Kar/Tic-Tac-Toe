document.addEventListener('DOMContentLoaded', () => {
    const gridEl = document.getElementById('grid');
    const scoreEl = document.getElementById('score');
    const highscoreEl = document.getElementById('highscore');
    const gameOverScreen = document.getElementById('game-over');
    const btnRestart = document.getElementById('btn-restart');

    let grid = [];
    let score = 0;
    let highscore = localStorage.getItem('2048HighScore') || 0;
    highscoreEl.innerText = highscore;

    // Build background grid
    for(let i=0; i<16; i++) {
        let cell = document.createElement('div');
        cell.classList.add('cell');
        gridEl.appendChild(cell);
    }

    function initGame() {
        grid = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        scoreEl.innerText = score;
        gameOverScreen.classList.add('hidden');
        btnRestart.blur();
        
        // clear old tiles
        document.querySelectorAll('.tile').forEach(t => t.remove());
        
        addRandomTile();
        addRandomTile();
        render();
    }

    function addRandomTile() {
        let empty = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) empty.push({r, c});
            }
        }
        if (empty.length > 0) {
            let pos = empty[Math.floor(Math.random() * empty.length)];
            grid[pos.r][pos.c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function render() {
        document.querySelectorAll('.tile').forEach(t => t.remove());
        const cells = document.querySelectorAll('.cell');
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] !== 0) {
                    let tile = document.createElement('div');
                    tile.classList.add('tile', `tile-${grid[r][c]}`);
                    tile.innerText = grid[r][c];
                    
                    let cellIndex = r * 4 + c;
                    cells[cellIndex].appendChild(tile);
                }
            }
        }
    }

    function move(dir) {
        let moved = false;
        
        // clone grid
        let oldGrid = JSON.stringify(grid);

        for (let i = 0; i < 4; i++) {
            let row = [];
            for (let j = 0; j < 4; j++) {
                let r = (dir === 'left' || dir === 'right') ? i : j;
                let c = (dir === 'up' || dir === 'down') ? i : j;
                if (grid[r][c] !== 0) row.push(grid[r][c]);
            }

            if (dir === 'right' || dir === 'down') row.reverse();

            // merge
            for (let k = 0; k < row.length - 1; k++) {
                if (row[k] === row[k+1]) {
                    row[k] *= 2;
                    score += row[k];
                    row.splice(k + 1, 1);
                }
            }

            while (row.length < 4) row.push(0);
            if (dir === 'right' || dir === 'down') row.reverse();

            for (let j = 0; j < 4; j++) {
                let r = (dir === 'left' || dir === 'right') ? i : j;
                let c = (dir === 'up' || dir === 'down') ? i : j;
                grid[r][c] = row[j];
            }
        }

        if (oldGrid !== JSON.stringify(grid)) {
            addRandomTile();
            scoreEl.innerText = score;
            if (score > highscore) {
                highscore = score;
                localStorage.setItem('2048HighScore', highscore);
                highscoreEl.innerText = highscore;
            }
            render();
            checkGameOver();
        }
    }

    function checkGameOver() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) return;
                if (r < 3 && grid[r][c] === grid[r+1][c]) return;
                if (c < 3 && grid[r][c] === grid[r][c+1]) return;
            }
        }
        gameOverScreen.classList.remove('hidden');
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (gameOverScreen.classList.contains('hidden')) {
            if (e.key === 'ArrowUp') move('up');
            if (e.key === 'ArrowDown') move('down');
            if (e.key === 'ArrowLeft') move('left');
            if (e.key === 'ArrowRight') move('right');
        }
        if (e.key === 'Enter' && !gameOverScreen.classList.contains('hidden')) {
            initGame();
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchStartY = 0;

    gridEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});

    gridEl.addEventListener('touchend', (e) => {
        if (!gameOverScreen.classList.contains('hidden')) return;
        let touchEndX = e.changedTouches[0].screenX;
        let touchEndY = e.changedTouches[0].screenY;
        
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) move('right');
            else if (dx < -30) move('left');
        } else {
            if (dy > 30) move('down');
            else if (dy < -30) move('up');
        }
    }, {passive: true});

    btnRestart.addEventListener('click', initGame);

    initGame();
});
