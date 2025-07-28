# Minimal Snake Game

A minimal implementation of Snake using HTML, CSS, JS, and Python (via Pyodide).

## How to Play
- Use **WASD** or **arrow keys** to control the snake.
- The snake can only move in 90° turns (no 180° turns).
- Eat the red food to grow longer. Food appears in random empty cells.
- The game speeds up as the snake grows.
- Press **P** or switch browser tabs to pause. Any key resumes.
- The game ends if the snake hits a wall or itself.

## Local Development Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the dev server:**
   ```bash
   npm run dev
   ```
3. Open the provided local URL (usually `http://localhost:5173/`) in your browser.

- All game logic is in `src/game.py` (Python, runs in browser via Pyodide).
- Rendering and input are handled in `src/main.js`.

---

For educational use: students can edit `src/game.py` to change the game logic using Python. 