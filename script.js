let timerInterval;
let secondsElapsed = 0;

function startTimer() {
  clearInterval(timerInterval); // Stop any old timer
  secondsElapsed = 0;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
  const seconds = String(secondsElapsed % 60).padStart(2, '0');
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    timerElement.innerText = `Time: ${minutes}:${seconds}`;
  }
}
function updateStats() {
  // Load from localStorage
  const totalSolved = localStorage.getItem("totalSolved") || 0;
  const fastestTime = localStorage.getItem("fastestTime");
document.getElementById("total-solved").innerText = totalSolved;
document.getElementById("fastest-time").innerText = fastestTime
  ? formatTime(fastestTime)
  : "--:--";
}

function formatTime(seconds) {
const min = String(Math.floor(seconds / 60)).padStart(2, '0');
const sec = String(seconds % 60).padStart(2, '0');
return `${min}:${sec}`;
}

function saveWinStats() {
let total = parseInt(localStorage.getItem("totalSolved") || 0);
total++;
localStorage.setItem("totalSolved", total);

const best = parseInt(localStorage.getItem("fastestTime") || Infinity);
if (secondsElapsed < best) {
  localStorage.setItem("fastestTime", secondsElapsed);
}

updateStats();
}

function resetStats() {
localStorage.removeItem("totalSolved");
localStorage.removeItem("fastestTime");
updateStats();
}
let board = [];
let solution = [];


function generatePuzzle(difficulty = "medium") {
  let clueCount;
  if (difficulty === "easy") clueCount = 40;
  else if (difficulty === "medium") clueCount = 30;
  else if (difficulty === "hard") clueCount = 22;

  board = generateFullBoard();
  solution = JSON.parse(JSON.stringify(board));
  removeNumbers(board, clueCount);
  renderBoard(board);
  document.getElementById("message").innerText = "";
  startTimer();
}
function generateFullBoard() {
  let board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveBoard(board);
  return board;
}
function solveBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let num of numbers) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}
function isSafe(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
  
function renderBoard(board) {
  const container = document.getElementById("sudoku-board");
  container.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("input");
      cell.type = "text";
      cell.maxLength = 1;
      cell.classList.add("cell");

      if (board[r][c] !== 0) {
        cell.value = board[r][c];
        cell.disabled = true;
        cell.classList.add("prefilled");
      } else {
        cell.value = '';
        cell.addEventListener("input", () => {
          const inputVal = parseInt(cell.value);
          board[r][c] = isNaN(inputVal) ? 0 : inputVal;
          validateCellInput(cell, r, c, board);
        });
}

      container.appendChild(cell);
    }
  }
}
function removeNumbers(board, clues = 30) {
  let attempts = 81 - clues;

  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (board[row][col] !== 0) {

      board[row][col] = 0;

      // Optional: Check if unique solution remains
      // For now, assume removing 50% keeps it playable
      attempts--;
    }
  }
}

function checkSolution() {
  const inputs = document.querySelectorAll("#sudoku-board input");
  let correct = true;

  for (let i = 0; i < inputs.length; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const inputValue = inputs[i].value;

    if (!inputs[i].disabled) {
      if (parseInt(inputValue) !== solution[row][col]) {
        inputs[i].style.backgroundColor = "#fdd";
        correct = false;
      } else {
        inputs[i].style.backgroundColor = "#fff";
      }
    }
  }

  const msg = document.getElementById("message");

  if (correct) {
    msg.innerText = "🎉 Correct! You've solved the puzzle!";
    msg.style.color = "green";
    clearInterval(timerInterval); // ✅ Stop timer
    saveWinStats();
  } else {
    msg.innerText = "❌ Some entries are incorrect.";
    msg.style.color = "red";
  }
}
function resetBoard() {
  const inputs = document.querySelectorAll("#sudoku-board input");

  inputs.forEach((input) => {
    if (!input.disabled) {
      input.value = "";
      input.style.backgroundColor = "#fff"; // Clear any error coloring
    }
  });

  document.getElementById("message").innerText = ""; // Clear message
}
function validateCellInput(cell, row, col, board) {
  const value = board[row][col];

  if (value < 1 || value > 9) {
    cell.classList.remove("valid");
    cell.classList.add("invalid");
    return;
  }

  let conflict = false;

  // Check row & column
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === value) conflict = true;
    if (i !== row && board[i][col] === value) conflict = true;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const checkRow = boxRow + r;
      const checkCol = boxCol + c;

      if (
        (checkRow !== row || checkCol !== col) &&
        board[checkRow][checkCol] === value
      ) {
        conflict = true;
      }
    }
  }

  cell.classList.remove("valid", "invalid");
  if (conflict) {
    cell.classList.add("invalid");
  } else {
    cell.classList.add("valid");
  }
}

function giveHint() {
  const container = document.getElementById("sudoku-board");
  const inputs = container.querySelectorAll("input");

  for (let i = 0; i < inputs.length; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;

    if (!inputs[i].disabled && inputs[i].value === "") {
      inputs[i].value = solution[r][c];
      inputs[i].disabled = true;
      inputs[i].classList.add("prefilled");
      return; // Only give one hint
    }
  }

  document.getElementById("message").innerText = "No more hints available!";
}
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
window.onload = () => {
  generatePuzzle();
  updateStats();
};