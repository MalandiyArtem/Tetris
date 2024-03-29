document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  let squares = Array.from(document.querySelectorAll('.grid div'));
  const scoreDisplay = document.querySelector('#score');
  const startBtn = document.querySelector('#start-button');
  const resetBtn = document.querySelector('#reset-button');
  const width = 10;
  let nextRandom = 0;
  let savedRandom;
  let timerId;asdsadasd
  let score = 0;
  let isPlaying = false;
  const colors = [
    '#ffa762', //orange
    '#ec643e', // red
    '#c33eec', // purple
    '#8dff9b', // green
    '#3eafec' // blue
  ];

  const speedLevel = document.querySelector('#speed');

  const audio = document.querySelector('#music');

  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ];

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ];

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ];

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ];

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ];

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

  let currentPosition = 4;
  let currentRotation = 0;

  // randomly select a Tetromino and its first rotation
  let random = Math.floor(Math.random()*theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];

  // draw the tetromino
  function draw(){
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino');
      squares[currentPosition + index].style.backgroundColor = colors[random];
    });
  }

  // undraw the Tetromino
  function undraw(){
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino');
      squares[currentPosition + index].style.backgroundColor = '';
    });
  }

  // assign functions to keyCodes
  function control(e){
    e.preventDefault();
    if(isPlaying){
      if(e.which === 37){
        moveLeft();
      }else if(e.which === 38){
        rotate();
      }else if(e.which === 39){
        moveRight();
      }else if(e.which === 40){
        moveDown();
      }
    }
  }
  document.addEventListener('keydown', event => {
    control(event);
    saveControl(event);
  });

  // move down function
  function moveDown(){
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  // freeze function
  function freeze(){
    if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){
      current.forEach(index => squares[currentPosition + index].classList.add('taken'));
      random = nextRandom;

      // start a new tetromino falling
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }

  // move the tetromino left, unless is at the edge or there is a blockage
  function moveLeft(){
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

    if(!isAtLeftEdge) currentPosition -= 1

    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      currentPosition += 1;
    }

    draw();
  }

  // move the tetromino right, unless is at the edge or there is a blockage
  function moveRight(){
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

    if(!isAtRightEdge) currentPosition += 1

    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      currentPosition -= 1;
    }

    draw();
  }

   function isAtRight() {
     return current.some(index=> (currentPosition + index + 1) % width === 0);
   }

   function isAtLeft() {
     return current.some(index=> (currentPosition + index) % width === 0);
   }

   function checkRotatedPosition(P){
     P = P || currentPosition;       //get current position.  Then, check if the piece is near the left side.
     if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).
       if (isAtRight()){            //use actual position to check if it's flipped over to right side
         currentPosition += 1;    //if so, add one to wrap it back around
         checkRotatedPosition(P); //check again.  Pass position from start, since long block might need to move more.
         }
     }
     else if (P % width > 5) {
       if (isAtLeft()){
         currentPosition -= 1;
       checkRotatedPosition(P);
       }
     }
   }

   //rotate the tetromino
   function rotate() {
     undraw();
     currentRotation ++;
     if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
       currentRotation = 0;
     }
     current = theTetrominoes[random][currentRotation]
     checkRotatedPosition();
     draw();
   }

  // show up-next tetromino in mini-grid scoreDisplay
  const displaySquares = document.querySelectorAll('.mini-grid div');
  const displayWidth = 4;
  let displayIndex = 0;

  // the Tetrominos without rotation
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ];

  // display the shape in the mini-grid display
  function displayShape(){
    // remove any trace of a tetrominp from the entire grid
    clearDisplayNextTetromino();

    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add('tetromino');
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
    });
  }

  // add functionality to the button
  startBtn.addEventListener('click', () => {
    play();
  });

  function play(){
    audio.volume = 0.1;
    audio.setAttribute("loop", "loop");
    audio.play();
    isPlaying = true;

    let isAvaliable = speedLevel.getAttribute('disabled');
    speedLevel.setAttribute("disabled", !isAvaliable);

    if(timerId){
      audio.pause();
      clearInterval(timerId);
      timerId = null;
    }else{
      audio.play();
      draw();
      timerId = setInterval(moveDown, speedLevel.value);
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
    }
  }

 // add score
 function addScore(){
   for (var i = 0; i < 199; i += width) {
     const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

     if(row.every(index => squares[index].classList.contains('taken'))){
       score += 10;
       scoreDisplay.innerHTML = score;
       row.forEach(index => {
         squares[index].classList.remove('taken');
         squares[index].classList.remove('tetromino');
         squares[index].style.backgroundColor = '';
       });

       const squaresRemoved = squares.splice(i, width);
       squares = squaresRemoved.concat(squares);
       squares.forEach(cell => grid.appendChild(cell));
     }
   }
 }

  // game over
  function gameOver(){
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      stopGame();
      startBtn.setAttribute('disabled', true);
    }
  }

  function stopGame(){
    speedLevel.removeAttribute("disabled");
    scoreDisplay.innerHTML = 'end';
    clearInterval(timerId);
    audio.pause();
    audio.currentTime = 0;
    currentPosition = 4;
    timerId = null;
    isPlaying = false;
    clearSaveZone();
    clearDisplayNextTetromino();
  }

  // reset gameOver
  resetBtn.addEventListener('click', () => {
    stopGame();
    scoreDisplay.innerHTML = '0';
    score = 0;
    startBtn.removeAttribute('disabled');
    squares.forEach((square, index) => {
      if(index < 200){
        square.style.backgroundColor = "";
        square.classList.remove('taken');
        square.classList.remove('tetromino');
      }
    });
    displaySquares.forEach(miniSquare => {
      miniSquare.style.backgroundColor = "";
      miniSquare.classList.remove('taken');
      miniSquare.classList.remove('tetromino');
    });
  });

  // Save or apply tetromino
  function saveControl(e){
    if(e.which === 83){ // S
      saveTetromino();
    }else if(e.which === 68){ // D
      useSavedTetromino();
    }
  }

  const displaySavedSquares = document.querySelectorAll('.save-grid div');
  let isSaved = false;

  function saveTetromino(){
    savedRandom = nextRandom;
    if(!isSaved){
      isSaved = true;
      upNextTetrominoes[nextRandom].forEach(index => {
        displaySavedSquares[displayIndex + index].classList.add('tetromino');
        displaySavedSquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
      });

      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
    }
  }

  function useSavedTetromino(){
    if(isSaved){
      isSaved = false;
      nextRandom = savedRandom;

      // change next tetromino to Saved
      clearDisplayNextTetromino();

      displaySavedSquares.forEach((item, index) => {
        if(item.classList.contains('tetromino')){
          displaySquares[displayIndex + index].classList.add('tetromino');
          displaySquares[displayIndex + index].style.backgroundColor = item.style.backgroundColor;
        }
      })
      clearSaveZone();
    }
  }

  function clearSaveZone(){
    displaySavedSquares.forEach(square => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
    });
  }

  function clearDisplayNextTetromino(){
    displaySquares.forEach(square => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
    });
  }
});
