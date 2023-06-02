const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 600;
document.body.appendChild(canvas);

const loadImage = () => {
  ball = new Image();
  ball.src = "images/ball.png";
  cat = new Image();
  cat.src = "images/cat.png";
  dog = new Image();
  dog.src = "images/dog.png";
  background = new Image();
  background.src = "images/background.png";
};

let dogWidth = 100;
let dogHeight = 450;
let isStart = false;

let ballX = 120;
let ballY = 270;
let catX = 800;
let catY = 450;

let catSpeedX = 0;
let catSpeedY = 0;

let dogScore = 0;
let catScore = 0;
// HTML에 미리 재시작과 난이도 변경 버튼을 추가해놓고 필요할 때만 표시되도록 합니다.
let restartButton = document.getElementById("restart");
let difficultyButton = document.getElementById("difficulty");

// 캔버스에 그려질 난이도 표시와 게임 중단 버튼 관련 코드를 추가합니다.
let isPaused = false; // 게임 중단 상태인지를 확인하는 플래그입니다.
let difficulty = 1;
// 난이도를 캔버스 상단에 표시합니다.
const drawDifficulty = () => {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(
    "Difficulty: " + ["Easy", "Medium", "Hard"][difficulty - 1],
    10,
    60
  );
};

// 게임 중단 버튼을 캔버스 하단에 표시합니다.
const drawPauseButton = () => {
  if (!isPaused) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Click here to pause", 10, canvas.height - 10);
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Click here to start", 10, canvas.height - 10);
  }
};
const drawRestartButton = () => {
  // 초기에는 버튼들을 숨겨놓습니다.
  restartButton.style.display = "none";
  difficultyButton.style.display = "none";

  // 버튼의 위치를 캔버스 오른쪽 하단에 위치하도록 변경합니다.
  restartButton.style.position = "absolute";
  restartButton.style.bottom = "10px";
  restartButton.style.right = "10px";

  difficultyButton.style.position = "absolute";
  difficultyButton.style.bottom = "40px";
  difficultyButton.style.right = "10px";
};

const onClickEvent = () => {
  canvas.addEventListener("click", function (e) {
    // 마우스 포인터의 y 좌표를 가져옵니다.
    let mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // 사용자가 canvas의 하단을 클릭한 경우 게임을 일시 중지합니다.
    if (mouseY > canvas.height - 40) {
      isPaused = !isPaused;
      if (isPaused) {
        restartButton.style.display = "block";
        difficultyButton.style.display = "block";
      } else {
        restartButton.style.display = "none";
        difficultyButton.style.display = "none";
      }
    }
  });

  // 버튼을 클릭하면 게임을 재시작하거나 난이도를 변경하는 로직을 추가합니다.
  restartButton.addEventListener("click", function () {
    // 점수를 0으로 초기화합니다.
    dogScore = 0;
    catScore = 0;

    // 공과 플레이어의 위치를 초기화합니다.
    resetPositions();

    // 게임 일시 중지 상태를 해제합니다.
    isPaused = false;

    // 버튼들을 다시 숨깁니다.
    restartButton.style.display = "none";
    difficultyButton.style.display = "none";
  });

  difficultyButton.addEventListener("click", function () {
    // 난이도를 변경합니다. 이 경우에는 난이도가 3단계라고 가정하겠습니다.
    difficulty = (difficulty % 3) + 1;

    // 버튼의 텍스트를 업데이트하여 현재 난이도를 표시합니다.
    difficultyButton.textContent =
      "Difficulty: " + ["Easy", "Medium", "Hard"][difficulty - 1];
  });
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(ball, ballX, ballY, 40, 40);
  ctx.drawImage(dog, dogWidth, dogHeight, 100, 100);
  ctx.drawImage(cat, catX, catY, 100, 100);

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Dog: " + dogScore, 10, 30);
  ctx.fillText("Cat: " + catScore, canvas.width - 80, 30);
  drawDifficulty();
  drawPauseButton();
  drawRestartButton();
};

const keyDown = {};

const setupKeyboard = () => {
  document.addEventListener("keydown", function (e) {
    keyDown[e.keyCode] = true;
    if (
      !isStart &&
      (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)
    )
      isStart = true;
  });
  document.addEventListener("keyup", function (e) {
    delete keyDown[e.keyCode];
  });
};

let ballSpeedX = 0;
let ballSpeedY = 0;

const ballCollisionWithCat = () => {
  const catLeft = catX;
  const catRight = catX + 80;
  const catTop = catY;
  const catBottom = catY + 80;

  const ballLeft = ballX;
  const ballRight = ballX + 40;
  const ballTop = ballY;
  const ballBottom = ballY + 40;

  if (
    ballLeft < catRight &&
    ballRight > catLeft &&
    ballTop < catBottom &&
    ballBottom > catTop
  ) {
    return true; // 충돌 발생
  } else {
    return false; // 충돌 없음
  }
};

const update = () => {
  if (39 in keyDown) dogWidth += 5; // 오른쪽 방향키
  if (37 in keyDown) dogWidth -= 5; // 왼쪽 방향키
  if (38 in keyDown) dogHeight -= 5; // 위쪽 방향키
  if (40 in keyDown) dogHeight += 5; // 아래쪽 방향키

  if (dogWidth <= 0) dogWidth = 0;
  if (dogWidth >= canvas.width / 2 - 50) dogWidth = canvas.width / 2 - 50;
  if (dogHeight <= 0) dogHeight = 0;
  if (dogHeight <= canvas.height / 2 - 50) dogHeight = canvas.height / 2 - 50;
  if (ballCollisionWithDog()) {
    ballSpeedX = Math.random() < 0.5 ? -2 : 2;
    ballSpeedY = Math.random() < 0.5 ? -2 : 2;

    const dogCenterX = dogWidth + 40;
    const dogCenterY = dogHeight + 40;

    const ballCenterX = ballX + 20;
    const ballCenterY = ballY + 20;

    const deltaX = dogCenterX - ballCenterX;
    const deltaY = dogCenterY - ballCenterY;

    ballSpeedX = Math.sign(deltaX) * Math.abs(ballSpeedX);
    ballSpeedY = Math.sign(deltaY) * Math.abs(ballSpeedY);
  }

  if (ballCollisionWithCat()) {
    ballSpeedX = Math.random() < 0.5 ? 2 : -2;
    ballSpeedY = Math.random() < 0.5 ? 2 : -2;

    const catCenterX = catX + 40;
    const catCenterY = catY + 40;

    const ballCenterX = ballX + 20;
    const ballCenterY = ballY + 20;

    const deltaX = catCenterX - ballCenterX;
    const deltaY = catCenterY - ballCenterY;

    ballSpeedX = Math.sign(deltaX) * Math.abs(ballSpeedX);
    ballSpeedY = Math.sign(deltaY) * Math.abs(ballSpeedY);
  }
  catMovement();

  ballX -= ballSpeedX;
  ballY += ballSpeedY;

  if (ballY <= 0 || ballY >= canvas.height - 40) {
    ballSpeedY = -ballSpeedY;
  }

  if (ballX <= 0) {
    catScore += 5;
    resetPositions();
  } else if (ballX >= canvas.width - 40) {
    dogScore += 5;
    resetPositions();
  }
};

const catMovement = () => {
  if (!isStart) {
    return;
  }

  const targetX = ballX;
  const targetY = ballY;

  const dx = targetX - catX;
  const dy = targetY - catY;

  const distance = Math.sqrt(dx * dx + dy * dy);
  // 고양이의 속도를 약간 줄여서 공을 덜 잘 칠 수 있게 합니다.
  const speed = Math.min(distance, difficulty+1);

  const vx = (speed * dx) / distance;
  const vy = (speed * dy) / distance;

  // 고양이의 새로운 위치를 계산합니다.
  let newCatX = catX + vx;
  let newCatY = catY + vy;

  // 고양이가 화면의 오른쪽 절반을 벗어나지 않도록 합니다.
  if (newCatX <= canvas.width / 2) {
    newCatX = canvas.width / 2;
  } else if (newCatX >= canvas.width - 80) {
    newCatX = canvas.width - 80;
  }

  if (newCatY <= 0) {
    newCatY = 0;
  } else if (newCatY >= canvas.height - 80) {
    newCatY = canvas.height - 80;
  }

  // 고양이의 위치를 업데이트합니다.
  catX = newCatX;
  catY = newCatY;
};

const ballCollisionWithDog = () => {
  const dogLeft = dogWidth;
  const dogRight = dogWidth + 80;
  const dogTop = dogHeight;
  const dogBottom = dogHeight + 80;

  const ballLeft = ballX;
  const ballRight = ballX + 40;
  const ballTop = ballY;
  const ballBottom = ballY + 40;

  if (
    ballLeft < dogRight &&
    ballRight > dogLeft &&
    ballTop < dogBottom &&
    ballBottom > dogTop
  ) {
    return true; // 충돌 발생
  } else {
    return false; // 충돌 없음
  }
};

const resetPositions = () => {
  ballX = 120;
  ballY = 270;
  dogWidth = 100;
  dogHeight = 500;
  catX = 700;
  catY = 500;
  catSpeedX = 0;
  catSpeedY = 0;
  isStart = false;
  ballSpeedX = 0;
  ballSpeedY = 0;
};

const main = () => {
  if (!isPaused) {
    update();
    render();
  }
  requestAnimationFrame(main);
};

loadImage();
setupKeyboard();
onClickEvent();
main();
