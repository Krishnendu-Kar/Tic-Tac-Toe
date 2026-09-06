let boxes = document.querySelectorAll(".box");
let reset= document.querySelector("#reset");
let winmsg= document.querySelector("#win-msg");
let turn1 = true;
let winmsgcon = document.querySelector(".msg-container");
let boxCount = 0;

const restGame = () => {
  winmsgcon.style.display="none";
  boxCount = 0;
  move.innerText= `0`;
  turn1= true;
  enableBoxes();
   winmsg.innerText="";
   console.clear();
}
const enableBoxes = () => {
  for (let box of boxes) {
    box.disabled= false;
    box.innerText = "";
    box.style.opacity = "1";
  }
 
}
const winPatterns = [
[0, 1, 2],
[0, 3, 6],
[0, 4, 8],
[1, 4, 7],
[2, 5, 8],
[2, 4, 6],
[3, 4, 5],
[6, 7, 8],
];

let move = document.querySelector("#box-count");

boxes.forEach((box) => {
    box.addEventListener("click", () => {
      box.style.opacity= "0.7";
      boxCount++;
      console.log("box count=",boxCount);
      move.innerText= `${boxCount}`;
        console. log ("box was clicked");
        if(turn1){
          box.innerText= "X";  
          turn1 = false;
        }
        else{
           box.innerText= "O";  
          turn1 = true; 
        }
        if(box.innerText=== "O"){
          box.style.color="#ffc76cff";
        }
        box.disabled= true;
        let hasWinner = checkWinner();

        if(!hasWinner && boxCount === 9){
  console.log("Match draw");
  winmsgcon.style.display="grid";
  winmsg.innerText=`Match Draw`;
}
    })
 });



const disableBoxes = () => {
  for ( let box of boxes){
    box.disabled= true;
  }
};


let scoreX = document.querySelector("#score-x");
let scoreO = document.querySelector("#score-o");

let countX= 0; 
let countO = 0;
const checkWinner= () => {
  for (let pattern of winPatterns)  {
    // console.log(boxes[pattern[0]].innerText,boxes[pattern[1]].innerText,boxes[pattern[2]].innerText);

    let posVal1 = boxes[pattern[0]].innerText;
    let posVal2 = boxes[pattern[1]].innerText;
    let posVal3 = boxes[pattern[2]].innerText;

    if(posVal1 != "" && posVal2 != "" && posVal3 != ""){
      if (posVal1 === posVal2 && posVal2 === posVal3){
        console.log("Winner",posVal1 );
        if(posVal1 === "X"){
          countX++;
        }
        if(posVal1 === "O"){
          countO++;
        }
        winmsgcon.style.display="grid";
        winmsg.innerText=`Congratulations, Winner is ${posVal1}`;
        console.log(countX);
        console.log(countO);

        scoreX.innerText= `${countX}`;
        scoreO.innerText= `${countO}`;
        disableBoxes();
        return true;
      }
    }
  }
  return false;
}


reset.addEventListener("click", restGame)












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
