// Constants
const GRID_SIZE = 16;
const CELL_SIZE = 20; // 16x16 grid, 320x320 canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Directions
const DIRS = {
  ArrowUp:    { x: 0, y: -1 },
  ArrowDown:  { x: 0, y: 1 },
  ArrowLeft:  { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

let pyodide = null;
let pyGame = null;
let pyStep = null;
let pyPlaceFood = null;

// Initial game state
let state = {
  grid_size: GRID_SIZE,
  snake: [ { x: 8, y: 8 }, { x: 8, y: 9 } ],
  dir: { x: 0, y: -1 },
  food: null,
  game_over: false
};

const loadingOverlay = document.getElementById('loadingOverlay');
const canvasElem = document.getElementById('gameCanvas');

async function initPyodideAndGame() {
  pyodide = await window.loadPyodide();
  await pyodide.runPythonAsync(await (await fetch('game.py')).text());
  pyStep = pyodide.globals.get('step');
  pyPlaceFood = pyodide.globals.get('place_food');
  // Place initial food
  state = JSON.parse(pyPlaceFood(JSON.stringify(state)));
  draw();
  // Hide loading, show game
  loadingOverlay.style.display = 'none';
  canvasElem.style.display = '';
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#333';
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
    ctx.stroke();
  }
  ctx.fillStyle = '#0f0';
  for (let seg of state.snake) {
    ctx.fillRect(seg.x * CELL_SIZE, seg.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  if (state.food) {
    ctx.fillStyle = '#f00';
    ctx.fillRect(state.food.x * CELL_SIZE, state.food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}

function getSpeed() {
  const base = 200;
  const k = 10;
  const min = 100;
  return Math.max(base - k * (state.snake.length - 1), min);
}

let started = false;

const pauseOverlay = document.getElementById('pauseOverlay');
let paused = false;
let loopTimeout = null;

function setPaused(val) {
  paused = val;
  pauseOverlay.style.display = paused ? 'flex' : 'none';
}

function gameLoop() {
  if (paused) return;
  state = JSON.parse(pyStep(JSON.stringify(state)));
  draw();
  if (!state.game_over) {
    loopTimeout = setTimeout(gameLoop, getSpeed());
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2);
  }
}

document.addEventListener('keydown', e => {
  // Pause/resume logic
  if (paused) {
    setPaused(false);
    if (!state.game_over) gameLoop();
    return;
  }
  
  if (e.key === 'p' || e.key === 'P') {
    setPaused(true);
    if (loopTimeout) clearTimeout(loopTimeout);
    return;
  }
  const d = DIRS[e.key];
  if (d) {
    e.preventDefault();
    if (!started) {
      state.dir = d;
      started = true;
      gameLoop();
      return;
    }
    if (state.dir.x === -d.x && state.dir.y === -d.y) return;
    state.dir = d;
  }
});

window.addEventListener('blur', () => {
  if (!paused && started && !state.game_over) {
    setPaused(true);
    if (loopTimeout) clearTimeout(loopTimeout);
  }
});

initPyodideAndGame(); 