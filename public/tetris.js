//https://www.youtube.com/watch?v=HEsAr2Yt2do

const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = 10;
const SQ = (squareSize = 20);
const emptySquareColor = "white";

const startButton = document.getElementById("start_btn");
const reloadButton = document.getElementById("re_btn");
const gameEnd = document.querySelector(".displayEnd");
const previousScore = document.querySelector(".previousScore");

let savedScore = 0;
let score = 0;
let gameOver = false;

//confetti
/*const confettiSettings = { target: "my-canvas" };
const confetti = new ConfettiGenerator(confettiSettings);*/

//draw a square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
  ctx.strokeStyle = "white";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}
//create the board
let board = [];
for (let i = 0; i < ROW; i++) {
  board[i] = [];
  for (let j = 0; j < COL; j++) {
    board[i][j] = emptySquareColor;
  }
}
//draw the board
function drawBoard() {
  for (let i = 0; i < ROW; i++) {
    for (let j = 0; j < COL; j++) {
      drawSquare(j, i, board[i][j]);
    }
  }
}
drawBoard();

//pieces and colors
const pieces = [
  [Z, changeColorRandomly()],
  [S, changeColorRandomly()],
  [T, changeColorRandomly()],
  [O, changeColorRandomly()],
  [L, changeColorRandomly()],
  [I, changeColorRandomly()],
  [J, changeColorRandomly()]
];

//utility function
function changeColorRandomly() {
  return (
    "hsl(" +
    360 * Math.random() +
    "," +
    (25 + 80 * Math.random()) +
    "%," +
    (75 + 10 * Math.random()) +
    "%)"
  );
}

startButton.addEventListener("click", drop);
reloadButton.addEventListener("click", function() {
  document.location.reload(true);
});

//the object Piece
class Piece {
  constructor(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.tetrominoNumber = 0; //start with 0
    this.activeTetromino = this.tetromino[this.tetrominoNumber];
    //control pieces
    this.x = 3;
    this.y = 0;
  }
  //fill(color){}
  draw() {
    for (let i = 0; i < this.activeTetromino.length; i++) {
      for (let j = 0; j < this.activeTetromino.length; j++) {
        if (this.activeTetromino[i][j]) {
          //draw occupied squares
          drawSquare(this.x + j, this.y + i, this.color);
        }
      }
    }
  }
  unDraw() {
    for (let i = 0; i < this.activeTetromino.length; i++) {
      for (let j = 0; j < this.activeTetromino.length; j++) {
        if (this.activeTetromino[i][j]) {
          //draw occupied squares
          drawSquare(this.x + j, this.y + i, emptySquareColor);
        }
      }
    }
  }
  moveDown() {
    if (gameOver === true) {
      this.lock();
    } else if (!this.collision(0, 1, this.activeTetromino)) {
      this.unDraw();
      this.y++;
      this.draw();
    } else {
      //we lock the piece and generate a new one
      this.lock();
      newPiece = randomPiece();
    }
  }
  moveRight() {
    if (!this.collision(1, 0, this.activeTetromino)) {
      this.unDraw();
      this.x++;
      this.draw();
    }
  }
  moveLeft() {
    if (!this.collision(-1, 0, this.activeTetromino)) {
      this.unDraw();
      this.x--;
      this.draw();
    }
  }
  rotate() {
    const nextPattern = this.tetromino[
      (this.tetrominoNumber + 1) % this.tetromino.length
    ];
    let kick = 0;
    if (this.collision(0, 0, nextPattern)) {
      if (this.x > COL / 2) {
        kick = -1; //right wall
      } else {
        kick = 1; //left wall
      }
    }
    if (!this.collision(kick, 0, nextPattern)) {
      this.unDraw();
      this.x += kick;
      this.tetrominoNumber = (this.tetrominoNumber + 1) % this.tetromino.length; //(0+1)%4=1
      this.activeTetromino = this.tetromino[this.tetrominoNumber];
      this.draw();
    }
  }
  collision(x, y, piece) {
    for (let i = 0; i < piece.length; i++) {
      for (let j = 0; j < piece.length; j++) {
        // if the square is empty skip it
        if (!piece[i][j]) {
          continue;
        }
        //coordinates after the movement
        let newX = this.x + j + x;
        let newY = this.y + i + y;
        //conditions
        if (newX < 0 || newX >= COL || newY >= ROW) {
          return true;
        }
        if (newY < 0) {
          continue;
        }
        //check if there is a locked piece already in place
        if (board[newY][newX] != emptySquareColor) {
          return true;
        }
      }
    }
    return false;
  }

  lock() {
    for (let i = 0; i < this.activeTetromino.length; i++) {
      for (let j = 0; j < this.activeTetromino.length; j++) {
        //we skip vacant squares
        if (!this.activeTetromino[i][j]) {
          continue;
        }
        //piece to lock on top = game over
        if (this.y + i <= 0) {
          // alert("Game Over");
          //stop request animation frame
          gameOver = true;
          confetti.render();

          if(score > savedScore) {
            const arrayToStoreInLocalStorage = JSON.stringify(score);
            localStorage.setItem("score", arrayToStoreInLocalStorage);
            console.log("new score:" + score);
          }
          
          break;
        }
        //we lock the piece
        board[this.y + i][this.x + j] = this.color;
      }
    }
    //remove full rows
    for (let i = 0; i < ROW; i++) {
      let isRowFull = true;
      for (let j = 0; j < COL; j++) {
        isRowFull = isRowFull && board[i][j] != emptySquareColor;
      }
      if (isRowFull) {
        //if the row is full
        //move down rows above it
        for (let y = i; y > 1; y--) {
          for (let j = 0; j < COL; j++) {
            board[y][j] = board[y - 1][j];
          }
        }
        for (let j = 0; j < COL; j++) {
          board[0][j] = emptySquareColor;
        }
        score += 10;
      }
    }
    //update the board
    drawBoard();
    //update the score
    scoreElement.innerHTML = score;
  }
}

//initiate a piece randomly
function randomPiece() {
  let randomNumber = Math.floor(Math.random() * pieces.length); //0-6
  return new Piece(pieces[randomNumber][0], pieces[randomNumber][1]);
}
let newPiece = randomPiece();
newPiece.draw();

//control the piece
document.addEventListener("keydown", control);

function control(event) {
  if (event.keyCode === 37) {
    newPiece.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode === 38) {
    newPiece.rotate();
    dropStart = Date.now();
  } else if (event.keyCode === 39) {
    newPiece.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode === 40) {
    newPiece.moveDown();
  }
}

//drop the piece every second
let dropStart = Date.now();
function drop() {
  let now = Date.now();
  let timeDifference = now - dropStart;
  if (timeDifference > 1000) {
    newPiece.moveDown();
    dropStart = Date.now();
  }
  if (gameOver === false) {
    requestAnimationFrame(drop);
  }
}
//drop();

//localStorage
window.addEventListener("load", getSavedScore);
function getSavedScore() {
  savedScore = JSON.parse(localStorage.getItem("score"));
  previousScore.innerHTML = "Your maximum score: " + savedScore;
}
