document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const menuView = document.getElementById("menu-view");
    const gameView = document.getElementById("game-view");
    const boardEl = document.getElementById("board");
    const turnIndicator = document.getElementById("turn-indicator");
    const scoreXEl = document.getElementById("score-x");
    const scoreOEl = document.getElementById("score-o");
    const playerONameEl = document.getElementById("player-o-name");
    const strikeLine = document.getElementById("strike-line");
    const gameOverModal = document.getElementById("game-over-modal");
    const winMsgEl = document.getElementById("win-msg");
    const totalMovesEl = document.getElementById("total-moves");

    // Buttons
    const btnPvP = document.getElementById("btn-pvp");
    const btnPvEEasy = document.getElementById("btn-pve-easy");
    const btnPvEMedium = document.getElementById("btn-pve-medium");
    const btnPvEHard = document.getElementById("btn-pve-hard");
    const btnBack = document.getElementById("btn-back");
    const btnReset = document.getElementById("btn-reset");
    const btnPlayAgain = document.getElementById("btn-play-again");

    // Game State
    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameActive = false;
    let mode = "pvp"; // 'pvp', 'easy', 'medium', 'hard'
    let scores = { X: 0, O: 0 };
    let moveCount = 0;
    let boxes = [];

    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Initialize Board UI
    function initBoard() {
        boardEl.innerHTML = "";
        boxes = [];
        for (let i = 0; i < 9; i++) {
            const btn = document.createElement("button");
            btn.classList.add("box");
            btn.dataset.index = i;
            btn.addEventListener("click", () => handleBoxClick(i));
            boardEl.appendChild(btn);
            boxes.push(btn);
        }
    }

    // Switch Views
    function showGame(selectedMode) {
        mode = selectedMode;
        menuView.classList.add("hidden");
        gameView.classList.remove("hidden");
        
        playerONameEl.innerText = mode === "pvp" ? "Player O" : 
                                 mode === "easy" ? "Computer (Easy)" : 
                                 mode === "medium" ? "Computer (Med)" : "Computer (Imp)";
        
        scores = { X: 0, O: 0 };
        updateScoreUI();
        startNewGame();
    }

    function showMenu() {
        gameView.classList.add("hidden");
        menuView.classList.remove("hidden");
        gameActive = false;
    }

    // Game Logic
    function startNewGame() {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        gameActive = true;
        moveCount = 0;
        
        boxes.forEach(box => {
            box.innerText = "";
            box.className = "box";
            box.removeAttribute("disabled");
        });
        
        strikeLine.style.display = "none";
        gameOverModal.classList.add("hidden");
        updateTurnIndicator();
    }

    function handleBoxClick(index) {
        if (!gameActive || board[index] !== "") return;
        if (mode !== "pvp" && currentPlayer === "O") return; // Block click during AI turn

        makeMove(index, currentPlayer);

        if (gameActive && mode !== "pvp") {
            setTimeout(makeComputerMove, 400); // Small delay for realism
        }
    }

    function makeMove(index, player) {
        board[index] = player;
        boxes[index].innerText = player;
        boxes[index].classList.add(player === "X" ? "x-mark" : "o-mark");
        boxes[index].setAttribute("disabled", "true");
        moveCount++;

        checkWin(player);

        if (gameActive) {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            updateTurnIndicator();
        }
    }

    function updateTurnIndicator() {
        turnIndicator.innerText = `${currentPlayer === "X" ? "Player X's" : mode === "pvp" ? "Player O's" : "Computer's"} Turn`;
        turnIndicator.style.color = currentPlayer === "X" ? "var(--player-x)" : "var(--player-o)";
    }

    function updateScoreUI() {
        scoreXEl.innerText = scores.X;
        scoreOEl.innerText = scores.O;
    }

    function checkWin(player) {
        for (let i = 0; i < winPatterns.length; i++) {
            const [a, b, c] = winPatterns[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                handleWin(player, i);
                return;
            }
        }

        if (!board.includes("")) {
            handleDraw();
        }
    }

    function handleWin(player, patternIndex) {
        gameActive = false;
        scores[player]++;
        updateScoreUI();
        drawStrikeLine(patternIndex);
        
        setTimeout(() => {
            winMsgEl.innerText = `${player === "X" ? "Player X" : mode === "pvp" ? "Player O" : "Computer"} Wins!`;
            winMsgEl.style.color = player === "X" ? "var(--player-x)" : "var(--player-o)";
            totalMovesEl.innerText = moveCount;
            gameOverModal.classList.remove("hidden");
        }, 800);
    }

    function handleDraw() {
        gameActive = false;
        setTimeout(() => {
            winMsgEl.innerText = "Match Draw!";
            winMsgEl.style.color = "white";
            totalMovesEl.innerText = moveCount;
            gameOverModal.classList.remove("hidden");
        }, 500);
    }

    // Strike Line Drawing
    function drawStrikeLine(patternIndex) {
        strikeLine.style.display = "block";
        
        // Reset styles
        strikeLine.style.width = "0";
        strikeLine.style.height = "8px";
        strikeLine.style.top = "auto";
        strikeLine.style.left = "auto";
        strikeLine.style.transform = "none";
        
        // Calculate based on 3x3 grid layout (0,0 is top-left)
        // Rows: 0-2, Cols: 3-5, Diag: 6-7
        
        setTimeout(() => {
            strikeLine.style.width = "90%";
            strikeLine.style.left = "5%";
            
            if (patternIndex < 3) { // Rows
                const row = patternIndex;
                strikeLine.style.top = `calc(${16.66 + (row * 33.33)}% - 4px)`;
            } else if (patternIndex < 6) { // Cols
                const col = patternIndex - 3;
                strikeLine.style.left = `calc(${16.66 + (col * 33.33)}% - 4px)`;
                strikeLine.style.top = "5%";
                strikeLine.style.width = "8px";
                strikeLine.style.height = "90%";
            } else if (patternIndex === 6) { // Diagonal \
                strikeLine.style.width = "120%";
                strikeLine.style.top = "50%";
                strikeLine.style.left = "-10%";
                strikeLine.style.transform = "translateY(-50%) rotate(45deg)";
            } else { // Diagonal /
                strikeLine.style.width = "120%";
                strikeLine.style.top = "50%";
                strikeLine.style.left = "-10%";
                strikeLine.style.transform = "translateY(-50%) rotate(-45deg)";
            }
        }, 50);
    }

    // Computer AI
    function makeComputerMove() {
        if (!gameActive) return;

        let moveIndex = -1;

        if (mode === "easy") {
            // Random move
            const available = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
            if (available.length > 0) {
                moveIndex = available[Math.floor(Math.random() * available.length)];
            }
        } else if (mode === "medium") {
            // Win or Block, else Random
            moveIndex = findWinningMove("O");
            if (moveIndex === -1) moveIndex = findWinningMove("X");
            if (moveIndex === -1) {
                if (board[4] === "") moveIndex = 4; // take center
                else {
                    const available = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
                    if(available.length > 0) {
                        moveIndex = available[Math.floor(Math.random() * available.length)];
                    }
                }
            }
        } else if (mode === "hard") {
            // Minimax
            moveIndex = bestMove();
        }

        if (moveIndex !== -1) {
            makeMove(moveIndex, "O");
        }
    }

    function findWinningMove(player) {
        for (let i = 0; i < winPatterns.length; i++) {
            const [a, b, c] = winPatterns[i];
            if (board[a] === player && board[b] === player && board[c] === "") return c;
            if (board[a] === player && board[c] === player && board[b] === "") return b;
            if (board[b] === player && board[c] === player && board[a] === "") return a;
        }
        return -1;
    }

    // --- Minimax Algorithm ---
    function bestMove() {
        // Optimization: If board is empty, just take center to save time
        if (board.every(val => val === "")) return 4;
        
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, 0, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    let minimaxScores = { "O": 10, "X": -10, "tie": 0 };

    function checkWinnerForMinimax() {
        for (let i = 0; i < winPatterns.length; i++) {
            const [a, b, c] = winPatterns[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (!board.includes("")) return "tie";
        return null;
    }

    function minimax(board, depth, isMaximizing) {
        let result = checkWinnerForMinimax();
        if (result !== null) {
            return minimaxScores[result] - depth * (result === "O" ? 1 : -1);
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    let score = minimax(board, depth + 1, false);
                    board[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = "X";
                    let score = minimax(board, depth + 1, true);
                    board[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    // Event Listeners
    btnPvP.addEventListener("click", () => showGame("pvp"));
    btnPvEEasy.addEventListener("click", () => showGame("easy"));
    btnPvEMedium.addEventListener("click", () => showGame("medium"));
    btnPvEHard.addEventListener("click", () => showGame("hard"));
    btnBack.addEventListener("click", showMenu);
    btnReset.addEventListener("click", startNewGame);
    btnPlayAgain.addEventListener("click", startNewGame);

    initBoard();
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
