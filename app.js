const MAX_MISSES = 6;
// Cache for keyboard buttons so we can update their states quickly.
const letterNodes = {};

// DOM references for the game UI.
const wordEl = document.getElementById("word");
const missesEl = document.getElementById("misses");
const guessedEl = document.getElementById("guessed");
const messageEl = document.getElementById("message");
const hintEl = document.getElementById("hint");
const keyboardEl = document.getElementById("keyboard");

// SVG pieces revealed as the player misses guesses.
const bodyParts = [
  document.getElementById("head"),
  document.getElementById("body"),
  document.getElementById("arm-left"),
  document.getElementById("arm-right"),
  document.getElementById("leg-left"),
  document.getElementById("leg-right")
];

// Round state.
let answer = "";
let hint = "";
let guessed = new Set();
let misses = 0;
let gameOver = false;

// Pick a random word and hint for the next round.
function pickWord() {
  const choice = WORDS[Math.floor(Math.random() * WORDS.length)];
  answer = choice.word.toUpperCase();
  hint = choice.hint;
}

// Reset the UI and state for a fresh game.
function resetBoard() {
  guessed = new Set();
  misses = 0;
  gameOver = false;
  missesEl.textContent = "0";
  guessedEl.textContent = "—";
  messageEl.textContent = "Ready when you are.";
  messageEl.className = "message";
  hintEl.textContent = `Hint: ${hint}`;

  // Build the blanks for the secret word.
  wordEl.innerHTML = "";
  for (const letter of answer) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = letter === " " ? " " : "";
    wordEl.appendChild(slot);
  }

  // Hide the hangman figure.
  bodyParts.forEach((part) => {
    part.style.opacity = "0";
  });

  // Rebuild the on-screen keyboard.
  keyboardEl.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key";
    button.textContent = letter;
    button.addEventListener("click", () => handleGuess(letter));
    keyboardEl.appendChild(button);
    letterNodes[letter] = button;
  });
}

// Reveal correctly guessed letters in the word display.
function updateWordDisplay() {
  const slots = wordEl.querySelectorAll(".slot");
  answer.split("").forEach((letter, index) => {
    if (guessed.has(letter)) {
      slots[index].textContent = letter;
    }
  });
}

// Update counters for misses and guessed letters.
function updateStatus() {
  missesEl.textContent = String(misses);
  guessedEl.textContent = guessed.size ? Array.from(guessed).join(", ") : "—";
}

// Show the next hangman body part for a wrong guess.
function revealPart() {
  if (misses > 0 && misses <= bodyParts.length) {
    bodyParts[misses - 1].style.opacity = "1";
  }
}

// Determine win/lose state and show the result.
function checkGameOver() {
  const allFound = answer.split("").every((letter) => guessed.has(letter));
  if (allFound) {
    messageEl.textContent = "You saved them. Nicely done!";
    messageEl.className = "message win";
    gameOver = true;
    return;
  }

  if (misses >= MAX_MISSES) {
    messageEl.textContent = `Out of guesses. The word was ${answer}.`;
    messageEl.className = "message lose";
    gameOver = true;
  }
}

// Handle a single letter guess from keyboard or click.
function handleGuess(letter) {
  if (gameOver || guessed.has(letter)) return;

  guessed.add(letter);
  const button = letterNodes[letter];
  if (answer.includes(letter)) {
    button.classList.add("correct");
    updateWordDisplay();
  } else {
    button.classList.add("wrong");
    misses += 1;
    revealPart();
  }
  button.disabled = true;
  updateStatus();
  checkGameOver();
}

// Reveal the answer and end the round.
function revealWord() {
  answer.split("").forEach((letter) => guessed.add(letter));
  updateWordDisplay();
  messageEl.textContent = `The word is ${answer}. Try a new one!`;
  messageEl.className = "message";
  gameOver = true;
}

// Wire up UI actions.
document.getElementById("new-game").addEventListener("click", () => {
  pickWord();
  resetBoard();
});

document.getElementById("reveal").addEventListener("click", revealWord);

// Allow physical keyboard input.
document.addEventListener("keydown", (event) => {
  const letter = event.key.toUpperCase();
  if (letter.length === 1 && letter >= "A" && letter <= "Z") {
    handleGuess(letter);
  }
});

// Initial game start.
pickWord();
resetBoard();
