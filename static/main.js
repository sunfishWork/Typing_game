let wordList = [];
let activeWords = [];
let score = 0;
let fallSpeed = 2;
let spawnSpeed = 2000;
let dropInterval;
let spawnInterval;
let gameRunning = false;

const gameArea = document.getElementById('game-area');
const input = document.getElementById('input');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    alert("txt 파일을 선택하세요.");
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        wordList = data.words;
        startGame();
      } else {
        alert("파일 업로드 실패: " + data.error);
      }
    });
}

function spawnWord() {
  const text = wordList[Math.floor(Math.random() * wordList.length)];
  const wordEl = document.createElement('div');
  wordEl.className = 'falling-word';
  wordEl.textContent = text;

  const x = Math.random() * (gameArea.clientWidth - 100);
  const y = 0;

  wordEl.style.left = `${x}px`;
  wordEl.style.top = `${y}px`;

  gameArea.appendChild(wordEl);

  activeWords.push({
    text: text,
    x: x,
    y: y,
    el: wordEl
  });
}

function moveWords() {
  activeWords.forEach((word, index) => {
    word.y += fallSpeed;
    word.el.style.top = `${word.y}px`;

    if (word.y > gameArea.clientHeight - 30) {
      endGame();
    }
  });
}

function checkInput() {
  const typed = input.value.trim();
  for (let i = 0; i < activeWords.length; i++) {
    if (typed === activeWords[i].text) {
      spawnStar(activeWords[i].x + 20, activeWords[i].y);
      gameArea.removeChild(activeWords[i].el);
      activeWords.splice(i, 1);
      score++;
      scoreDisplay.textContent = `점수: ${score}`;
      input.value = '';
      adjustDifficulty();
      break;
    }
  }
}

function adjustDifficulty() {
  if (!gameRunning) return;

  if (score > 20) {
    fallSpeed = 6;
    spawnSpeed = 700;
  } else if (score > 15) {
    fallSpeed = 5;
    spawnSpeed = 1000;
  } else if (score > 10) {
    fallSpeed = 4;
    spawnSpeed = 1200;
  } else if (score > 5) {
    fallSpeed = 3;
    spawnSpeed = 1500;
  }

  clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnWord, spawnSpeed);
}

function startGame() {
  activeWords = [];
  score = 0;
  fallSpeed = 2;
  spawnSpeed = 2000;
  gameRunning = true;
  input.disabled = false;
  input.value = '';
  message.textContent = '';
  scoreDisplay.textContent = '점수: 0';
  gameArea.innerHTML = '';

  dropInterval = setInterval(moveWords, 50);
  spawnInterval = setInterval(spawnWord, spawnSpeed);
}

function endGame() {
  clearInterval(dropInterval);
  clearInterval(spawnInterval);
  input.disabled = true;
  gameRunning = false;
  message.textContent = `게임 종료! 최종 점수: ${score}`;
  activeWords.forEach(word => {
    if (word.el && word.el.parentNode) {
      word.el.remove();
    }
  });
  activeWords = [];
}

input.addEventListener('input', checkInput);

function spawnStar(x, y) {
  const star = document.createElement('div');
  star.classList.add('star');
  star.textContent = '★';
  star.style.left = `${x}px`;
  star.style.top = `${y}px`;
  gameArea.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, 600);
}