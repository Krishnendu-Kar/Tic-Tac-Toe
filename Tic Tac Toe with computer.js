// --- Get HTML Elements ---
let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset");
let winMsgElement = document.querySelector("#win-msg");
let winMsgContainer = document.querySelector(".msg-container");
let moveCountElement = document.querySelector("#box-count");
let scoreXElement = document.querySelector("#score-x");
let scoreOElement = document.querySelector("#score-o");

// --- Game State Variables ---
const PLAYER_X = "X";
const PLAYER_O = "O"; // The Computer
let currentPlayer = PLAYER_X;
let isGameOver = false;
let moveCount = 0;
let scoreX = 0;
let scoreO = 0;

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]  // Diagonals
];

// --- Main Game Functions ---

/**
 * Resets the game board for a new round.
 */
const resetGame = () => {
  winMsgContainer.style.display = "none";
  moveCount = 0;
  moveCountElement.innerText = "0";
  currentPlayer = PLAYER_X;
  isGameOver = false;
  enableBoxes();
  winMsgElement.innerText = "";
  console.clear();
};

/**
 * Re-enables all boxes for a new game.
 */
const enableBoxes = () => {
  for (let box of boxes) {
    box.disabled = false;
    box.innerText = "";
    box.style.opacity = "1";
  }
};

/**
 * Disables all boxes after a win or draw.
 */
const disableBoxes = () => {
  isGameOver = true;
  for (let box of boxes) {
    box.disabled = true;
  }
};

/**
 * Handles a move (placing an X or O) for both player and AI.
 */
const handleMove = (box, player) => {
  if (isGameOver) return;

  // Place the mark
  box.innerText = player;
  box.disabled = true;
  box.style.opacity = "0.7";
  if (player === PLAYER_O) {
    box.style.color = "#ffc76cff";
  }

  // Update move count
  moveCount++;
  moveCountElement.innerText = `${moveCount}`;
  console.log(`box count = ${moveCount}`);

  // Check for winner
  if (checkWinner(player)) {
    showWinner(player);
  } else if (moveCount === 9) {
    // Check for draw
    showDraw();
  }
};

/**
 * Checks all winning patterns to see if the current player won.
 */
const checkWinner = (player) => {
  for (let pattern of winPatterns) {
    let [pos1, pos2, pos3] = pattern;
    if (
      boxes[pos1].innerText === player &&
      boxes[pos2].innerText === player &&
      boxes[pos3].innerText === player
    ) {
      return true; // We have a winner
    }
  }
  return false; // No winner yet
};

/**
 * Displays the winner message and updates the score.
 */
const showWinner = (winner) => {
  console.log("Winner", winner);
  if (winner === PLAYER_X) {
    scoreX++;
    scoreXElement.innerText = `${scoreX}`;
  } else {
    scoreO++;
    scoreOElement.innerText = `${scoreO}`;
  }
  winMsgContainer.style.display = "grid";
  winMsgElement.innerText = `Congratulations, Winner is ${winner}`;
  disableBoxes();
};

/**
 * Displays the draw message.
 */
const showDraw = () => {
  console.log("Match draw");
  winMsgContainer.style.display = "grid";
  winMsgElement.innerText = `Match Draw`;
  disableBoxes();
};

// --- Player's Move ---

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    // Only allow click if:
    // 1. The game is not over
    // 2. It's the player's turn
    // 3. The box is empty
    if (!isGameOver && currentPlayer === PLAYER_X && box.innerText === "") {
      
      // 1. Handle the player's move
      handleMove(box, PLAYER_X);

      // 2. If game is not over, switch to AI's turn
      if (!isGameOver) {
        currentPlayer = PLAYER_O;
        // Call AI move after a short delay
        setTimeout(computerMove, 500); 
      }
    }
  });
});

// --- AI (Computer) Move Logic ---

/**
 * The main function for the AI's turn.
 */
const computerMove = () => {
  if (isGameOver) return;

  // 1. Find the best move
  let bestMoveIndex = findBestMove();
  
  // 2. Make the move
  if (bestMoveIndex !== -1) {
    handleMove(boxes[bestMoveIndex], PLAYER_O);
  }

  // 3. If game is not over, switch back to Player's turn
  if (!isGameOver) {
    currentPlayer = PLAYER_X;
  }
};

/**
 * The AI "Brain" - decides the best move.
 */
const findBestMove = () => {
  // Strategy 1: Check if AI can win
  let winMove = findWinningMove(PLAYER_O);
  if (winMove !== -1) return winMove;

  // Strategy 2: Check if Player can win (and block them)
  let blockMove = findWinningMove(PLAYER_X);
  if (blockMove !== -1) return blockMove;

  // Strategy 3: Take the center if it's free
  if (boxes[4].innerText === "") {
    return 4;
  }

  // Strategy 4: Pick a random empty square
  let randomMove = findRandomMove();
  return randomMove;
};

/**
 * Helper: Checks all patterns for a winning (or blocking) move.
 */
const findWinningMove = (player) => {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    const boxA = boxes[a].innerText;
    const boxB = boxes[b].innerText;
    const boxC = boxes[c].innerText;

    // Check for "Player, Player, Empty"
    if (boxA === player && boxB === player && boxC === "") return c;
    // Check for "Player, Empty, Player"
    if (boxA === player && boxC === player && boxB === "") return b;
    // Check for "Empty, Player, Player"
    if (boxB === player && boxC === player && boxA === "") return a;
  }
  return -1; // No winning move found
};

/**
 * Helper: Finds a random available square.
 */
const findRandomMove = () => {
  let emptyBoxes = [];
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].innerText === "") {
      emptyBoxes.push(i);
    }
  }
  
  if (emptyBoxes.length > 0) {
    let randomIndex = Math.floor(Math.random() * emptyBoxes.length);
    return emptyBoxes[randomIndex];
  }
  
  return -1; // Should not happen if not a draw
};

// --- Event Listeners ---
resetBtn.addEventListener("click", resetGame);