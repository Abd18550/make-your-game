  // Game settings
  const gridSize = 20;
  const gameBoard = document.getElementById("game-board");
  const scoreDisplay = document.getElementById("score");
  const livesDisplay = document.getElementById("lives");
  let score = 0;
  let lives = 3;
  let gamePaused = false;
  let powerModeActive = false;
  let powerModeTimeout;
  const pacmanSpeed = 200; // Controls the speed. Increase this to slow down.
  const ghostSpeed = 300;
  let pacmanMOveContinue;
  const playerNameDisplay = document.getElementById("player-name");
  const pauseMenu = document.getElementById("pause-menu");
  const resumeButton = document.getElementById("resume-button");
  const restartButton = document.getElementById("restart-button");
  const homeButton = document.getElementById("home-button");
  const gameAudio = document.getElementById("game-audio");
  const pacmanDeathAudio = document.getElementById("pacman-death");
  const pacmanVictoryAudio = document.getElementById("pacman-victory");
  const fpsGame = document.getElementById("fps");
  

  // Retrieve player's name from localStorage
  const playerName = localStorage.getItem('playerName') || 'Guest'; // Default to 'Guest' if no name is found
  playerNameDisplay.textContent = `Player: ${playerName}`; // Display player's name

  // Initialize game grid
  const cells = [];
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gameBoard.appendChild(cell);
    cells.push(cell);
  }

  // Maze layout: 0 is empty space, 1 is wall
  const mazeLayout = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1,
    1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1,
    1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1,
    1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1,
    1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
  ];

  // Set up maze layout
  cells.forEach((cell, index) => {
    if (mazeLayout[index] === 1) {
      cell.classList.add("wall");
    }
  });

  // Pac-Man initial position
  let pacmanPosition = 21;
  cells[pacmanPosition].classList.add("pacman");

  // Ghost initial positions
  let ghostPositions = [188, 189, 190, 191];
  ghostPositions.forEach(position => cells[position].classList.add("ghost"));

  // Place dots and power pills
  function placeDotsAndPills() {
    cells.forEach((cell, index) => {
      if (!cell.classList.contains("wall") && !cell.classList.contains("ghost") && index !== pacmanPosition) {
        const element = document.createElement("div");
        if (index === 63 || index === 336 || index === 38 || index === 101 || index === 221 || index === 178 || index === 361 || index === 298) {
          // 5% chance to be a power pill
          element.classList.add("power-pill");
        } else {
          element.classList.add("dot");
        }
        cell.appendChild(element);
      }
    });
  }

  // Place initial dots and pills
  placeDotsAndPills();

  // Update score
  function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
  }
  function updateLives() {
    livesDisplay.textContent = `Lives: ${lives}`;
  }

  // Activate power mode
  function activatePowerMode() {
    powerModeActive = true;
    ghostPositions.forEach(pos => cells[pos].classList.add("frozen"));

    clearTimeout(powerModeTimeout);
    powerModeTimeout = setTimeout(() => {
      powerModeActive = false;
      ghostPositions.forEach(pos => cells[pos].classList.remove("frozen"));
    }, 3000); // 3 seconds
  }

  let pacmanDirection = null;
let pacmanMoveInterval = null;
let pacmanNextDirection = null;

function movePacman(event) {
  if (gamePaused) return;

  const directionKeys = { ArrowUp: -gridSize, ArrowDown: gridSize, ArrowLeft: -1, ArrowRight: 1 };
  const direction = directionKeys[event.key];

  if (direction !== undefined) {
    // If Pac-Man is stationary, start moving
    if (pacmanMoveInterval === null) {
      pacmanDirection = direction;
      pacmanMoveInterval = setInterval(movePacmanInDirection, pacmanSpeed);
    } else {
      // If Pac-Man is already moving, set the next direction
      pacmanNextDirection = direction;
    }
  }
}

function movePacmanInDirection() {
  if (gamePaused || pacmanDirection === null || endGame) return;

  // Validate next direction if any
  if (
    pacmanNextDirection !== null &&
    isValidMove(pacmanPosition + pacmanNextDirection)
  ) {
    pacmanDirection = pacmanNextDirection; // Update direction
    pacmanNextDirection = null; // Reset next direction
  }

  const newPosition = pacmanPosition + pacmanDirection;

  if (isValidMove(newPosition)) {
    cells[pacmanPosition].classList.remove("pacman"); // Remove Pac-Man from the current position
    pacmanPosition = newPosition; // Update position
    cells[pacmanPosition].classList.add("pacman"); // Place Pac-Man in the new position
    checkGameOver();
    // Check for dot or power pill
    const dot = cells[pacmanPosition].querySelector(".dot");
    const powerPill = cells[pacmanPosition].querySelector(".power-pill");

    if (dot) {
      dot.remove();
      updateScore(3); // Each dot gives 3 points
    }

    if (powerPill) {
      powerPill.remove();
      activatePowerMode();
      updateScore(10); // Each power pill gives 10 points
    }

    // Check if all dots are eaten
    if (!document.querySelector(".dot")) {
      handleWin();
    }
  }
}

// Utility function to check if a move is valid
function isValidMove(position) {
  return (
    position >= 0 &&
    position < gridSize * gridSize &&
    !cells[position].classList.contains("wall")
  );
}



const ghostDirections = new Array(ghostPositions.length).fill(null);

// Pick a direction for each ghost
function ChoiceDirection() {
  if (gamePaused) return;
  checkGameOver();

  ghostPositions.forEach((_, index) => {
    const directions = [-1, 1, -gridSize, gridSize]; // Possible directions
    ghostDirections[index] = directions[Math.floor(Math.random() * directions.length)];
  });
}

// Move ghosts in their current direction
function moveGhosts() {
  if (gamePaused || powerModeActive || endGame) return;

  ghostPositions.forEach((position, index) => {
    const direction = ghostDirections[index];
    const newGhostPosition = position + direction;

    // Handle invalid direction
    if (cells[newGhostPosition]?.classList.contains("wall") || newGhostPosition < 0 || newGhostPosition >= gridSize * gridSize) {
      const directions = [-1, 1, -gridSize, gridSize];
      ghostDirections[index] = directions[Math.floor(Math.random() * directions.length)];
      return;
    }

    // Temporarily hide dot if ghost is moving onto it
    const currentCell = cells[position];
    const newCell = cells[newGhostPosition];

    const dot = newCell.querySelector(".dot");
    if (dot) dot.classList.add("hidden-dot");
    const powerPill = newCell.querySelector(".power-pill")
    if (powerPill) powerPill.classList.add("hidden-power-pill")

    // Restore dot in the current cell if it was hidden earlier
    if (currentCell.classList.contains("ghost") && currentCell.querySelector(".hidden-dot")) {
      const hiddenDot = currentCell.querySelector(".hidden-dot");
      hiddenDot.classList.remove("hidden-dot");
    }
    if (currentCell.classList.contains("ghost") && currentCell.querySelector(".hidden-power-pill")) {
      const hiddenPowerPill = currentCell.querySelector(".hidden-power-pill");
      hiddenPowerPill.classList.remove("hidden-power-pill");
    }

    // Move the ghost to the new cell
    currentCell.classList.remove("ghost");
    ghostPositions[index] = newGhostPosition;
    newCell.classList.add("ghost");

    // Check for collision with Pac-Man
    checkGameOver();
  });
}


  

  // Check if Pac-Man collides with ghost
  function checkGameOver() {
    if (!powerModeActive && cells[pacmanPosition].classList.contains("ghost")) {
      if (lives === 0) return
      if (lives === 1) {
        lives = 0;

        updateLives();
        handleGameOver(); // Show the lose menu
      } else {
        if (score >= 50) {
          updateScore(-50);
        }else{
          updateScore(-score);
        }
        lives--; 
        updateLives();
        pacmanDeathAudio.play();
        // Reset Pac-Man's position
        cells[pacmanPosition].classList.remove("pacman");
        pacmanPosition = 21;
        cells[pacmanPosition].classList.add("pacman");
        pacmanDirection = -1;
  
        // Reset Ghosts' positions
        ghostPositions.forEach(position => cells[position].classList.remove("ghost"));
        ghostPositions = [188, 189, 190, 191];
        ghostPositions.forEach(position => cells[position].classList.add("ghost"));
      }
    }
  }
  

  function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
      clearInterval(pacmanMoveInterval); // Stop Pac-Man's movement
      pacmanMoveInterval = null;
      pauseMenu.style.display = "block"; // Show the pause menu
    } else {
      
      pacmanMoveInterval = setInterval(movePacmanInDirection, pacmanSpeed); // Resume Pac-Man's movement
      pauseMenu.style.display = "none"; // Hide the pause menu
    }
    
  }

 // Set intervals for ghost direction changes and movement
ChoiceDirection(); // Initialize directions at the start
//setInterval(ChoiceDirection, 5000); // Change directions every 5 seconds
setInterval(moveGhosts, ghostSpeed); // Move ghosts continuously

  // Listen for Pac-Man movement and pause/resume
  window.addEventListener("keydown", (event) => {
    if (!endGame) {
    if (event.key === "Escape") {
      gamePaused = !gamePaused;
    if (gamePaused) {
      pauseGame();
    } else {
      gamePaused = !gamePaused;
      resumeGame();
    }
  
    } else {
       movePacman(event);
    }
  }
  });

  function pauseGame() {
    pauseMenu.style.display = 'flex'; // Show the menu as a flexbox
    // Add any game-specific pause logic here (e.g., stop game loop)
    clearInterval(timerInterval);
  }
  
  function resumeGame() {
    pauseMenu.style.display = 'none';
    resumeTimer();
    togglePause(); // Hide the menu
    // Add any game-specific resume logic here (e.g., resume game loop)
  }
  
  // Add event listeners for buttons
  resumeButton.addEventListener('click', resumeGame);
  
  restartButton.addEventListener('click', () => {
    // Restart the game (reload the page or reset state)
    startGameAudio();
    window.location.reload();
  });
  
  homeButton.addEventListener('click', () => {
    // Redirect to the home screen
    window.location.href = 'index.html';
  });


  // Timer settings
const timerDisplay = document.getElementById("timer");
let gameTime = 180; // Game duration in seconds
let timerInterval = null;

// Update the timer display
function updateTimer() {
  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  timerDisplay.textContent = `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Start the timer
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval); // Clear any existing interval
  }

  updateTimer(); // Initial update
  timerInterval = setInterval(() => {
    if (!gamePaused && !endGame) {
      gameTime--;
      updateTimer();
      if (gameTime <= 0) {
        clearInterval(timerInterval);
        handleGameOver();
      }
    }
  }, 1000);
}

// Resume the timer
function resumeTimer() {

  startTimer();
}

// Call this to initialize the game timer when the game starts

startTimer();

// Update the pause menu for win/lose
function showEndGameMenu(message) {
  // Update the resume button to display the win/lose message
  resumeButton.textContent = message;
  resumeButton.style.pointerEvents = "none"; // Disable click functionality
  resumeButton.style.backgroundColor = "transparent"; // Style it like text

  // Show the pause menu
  pauseGame();
}
let endGame = false;
function handleWin() {
  endGame = true;
  stopGameAudio();
  pacmanVictoryAudio.play();
  showEndGameMenu("You Win!");
}

// Call this function when the player loses
function handleGameOver() {
  endGame = true;
  stopGameAudio();
  pacmanDeathAudio.play();
  showEndGameMenu("Game Over!");
}

// Function to start or restart audio
function startGameAudio() {
  gameAudio.currentTime = 0; // Reset to the start
  gameAudio.play(); // Start playing
}

// Function to stop audio
function stopGameAudio() {
  gameAudio.pause(); // Pause the audio
  gameAudio.currentTime = 0; // Reset to the beginning
}

const times = [];
let fps;

function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    fpsGame.textContent = `FPS: ${fps}`
  });
}

let lastFrameTime = 0;
let accumulatedTime = 0; // Tracks leftover time not used in updates
//const pacmanSpeed = 100; // Movement interval in milliseconds

function gameLoop(timestamp) {
  
  refreshLoop();

  // Request the next frame
  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);


  
  