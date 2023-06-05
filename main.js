const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let ballX = canvas.width * 0.3;
let ballY = canvas.height * 0.5;
let catX = 0.7 * canvas.width;
let catY = 0.8 * canvas.height - 8;
let ballSize = 25;
let animalSize = 0.1 * canvas.width + 10;
let dogWidth = 0.2 * canvas.width;
let dogHeight = 0.8 * canvas.height - 8;
let dogScore = 0;
let catScore = 0;
let isStart = false;
let ball, cat, dog, background;

let ballSpeedX = 0;
let ballSpeedY = 0;

let backUpBallSpeedX = 0;
let backUpBallSpeedY = 0;

let isMovingUp = false;
let isMovingDown = false;
let isMovingLeft = false;
let isMovingRight = false;
let isCollisionCooldown = false;
let difficulty = 1;
let lastCollisionTime = 0;
const collisionCooldownDuration = 800;

const upBtn = document.querySelector(".up-button");
const leftBtn = document.querySelector(".left-button");
const rightBtn = document.querySelector(".right-button");
const downBtn = document.querySelector(".down-button");
const resetBtn = document.querySelector(".reset-btn");
const stopBtn = document.querySelector(".stop-btn");
const difficultyBtn = document.querySelector(".difficulty-btn");
const musicBtn = document.querySelector(".music-btn");
const keyDown = {};
const audio = new Audio("music/bgm.mp3");
let isMusicPlaying = false;

const playMusic = () => {
  audio.play();
  isMusicPlaying = true;
}
const stopMusic = () => {
  audio.pause();
  audio.currentTime = 0;
  isMusicPlaying = false;
}
/**
 * Image Load
 */
const loadImage = () => {
  ball = new Image();
  ball.src = "images/ball.png";
  cat = new Image();
  cat.src = "images/cat.png";
  dog = new Image();
  dog.src = "images/dog.png";
  background = new Image();
  background.src = "images/background.png";

  // 이미지 로드가 완료되면 게임 시작
  ball.onload = main;
};

const ballCollision = (objectX, objectY, objectSize) => {
  const objectLeft = objectX;
  const objectRight = objectX + objectSize;
  const objectTop = objectY;
  const objectBottom = objectY + objectSize;

  const ballLeft = ballX;
  const ballRight = ballX + ballSize;
  const ballTop = ballY;
  const ballBottom = ballY + ballSize;

  const distanceThreshold = 5;
  if (
    ballLeft < objectRight - distanceThreshold &&
    ballRight > objectLeft + distanceThreshold &&
    ballTop < objectBottom - distanceThreshold &&
    ballBottom > objectTop + distanceThreshold
  ) {
    const objectCenterX = objectX + objectSize / 2;
    const objectCenterY = objectY + objectSize / 2;

    const ballCenterX = ballX + ballSize / 2;
    const ballCenterY = ballY + ballSize / 2;

    const deltaX = ballCenterX - objectCenterX;
    const deltaY = ballCenterY - objectCenterY;

    ballSpeedX = Math.sign(deltaX) * Math.abs(ballSpeedX);
    ballSpeedY = Math.sign(deltaY) * Math.abs(ballSpeedY);

    const randomFactor = 0.2;
    ballSpeedX += Math.random() * randomFactor - randomFactor / 2;
    ballSpeedY += Math.random() * randomFactor - randomFactor / 2;

    return true; // 충돌 발생
  } else {
    return false; // 충돌 없음
  }
};

const handleCollision = (centerX, centerY) => {
  const ballCenterX = ballX + 20;
  const ballCenterY = ballY + 20;

  const deltaX = centerX - ballCenterX;
  const deltaY = centerY - ballCenterY;

  ballSpeedX = Math.sign(deltaX) * (Math.random() < 0.5 ? 2 : -2);
  ballSpeedY = Math.sign(deltaY) * (Math.random() < 0.5 ? 2 : -2);
};

const handleAnimalCollision = (centerX, centerY) => {
  const animalCenterX = centerX + 30;
  const animalCenterY = centerY + 30;

  handleCollision(animalCenterX, animalCenterY);
};

const getAnimalCenter = (x, y) => {
  const centerX = x + 30;
  const centerY = y + 30;
  return { centerX, centerY };
};

// 터치패드 화살표 관련 변수
let touchArrow = {
  up: false,
  down: false,
  left: false,
  right: false,
};

let isGamePaused = false; // 게임 일시정지 상태를 나타내는 변수

const stopGameLoop =() =>{
  cancelAnimationFrame(gameLoopId);
}
const setupKeyboard = () => {
  document.addEventListener("keydown", function (e) {
    keyDown[e.keyCode] = true;
    if (
      !isStart &&
      (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)
    )
    isGamePaused = true;
      isStart = false;
  });
  document.addEventListener("keyup", function (e) {
    delete keyDown[e.keyCode];
  });

  stopBtn.addEventListener("click", function () {
    if (!isGamePaused) {
      // 게임이 진행 중인 상태에서 버튼을 터치하면 일시정지
      backUpBallSpeedX = ballSpeedX;
      backUpBallSpeedY = ballSpeedY;
      ballSpeedX = 0;
      ballSpeedY = 0;
      isGamePaused = true;
      isStart = false; 
    } 
  });

  stopBtn.addEventListener("touchend", function () {
    if (!isGamePaused) {
      // 게임이 진행 중인 상태에서 버튼을 터치하면 일시정지
      backUpBallSpeedX = ballSpeedX;
      backUpBallSpeedY = ballSpeedY;
      ballSpeedX = 0;
      ballSpeedY = 0;
      isGamePaused = true;
      isStart = false; 
    } 
  });

  difficultyBtn.addEventListener("mouseup", function () {
    difficulty++;
  if (difficulty > 3) {
    difficulty = 1;
  }
  });
  difficultyBtn.addEventListener("touchend", function () {
    difficulty++;
  if (difficulty > 3) {
    difficulty = 1;
  }
  });

  resetBtn.addEventListener("mousedown", function () {
    dogScore = 0;
    catScore = 0;
    resetPositions();
    isStart = false;
  });
    // 버튼을 클릭하면 게임을 재시작하거나 난이도를 변경
    resetBtn.addEventListener("touchstart", function () {
      dogScore = 0;
      catScore = 0;
      resetPositions();
      isStart = false;
    });

  // 버튼 누르는 이벤트 처리
  upBtn.addEventListener("mousedown", () => {
    isMovingUp = true;
    isStart = true;
    isGamePaused = false;
  });

  downBtn.addEventListener("mousedown", () => {
    isMovingDown = true;
    isStart = true;
    isGamePaused = false;
  });

  leftBtn.addEventListener("mousedown", () => {
    isMovingLeft = true;
    isStart = true;
    isGamePaused = false;
  });

  rightBtn.addEventListener("mousedown", () => {
    isMovingRight = true;
    isStart = true;
    isGamePaused = false;
  });

  // 버튼 떼는 이벤트 처리
  upBtn.addEventListener("mouseup", () => {
    isMovingUp = false;
  });

  downBtn.addEventListener("mouseup", () => {
    isMovingDown = false;
  });

  leftBtn.addEventListener("mouseup", () => {
    isMovingLeft = false;
  });

  rightBtn.addEventListener("mouseup", () => {
    isMovingRight = false;
  });

  upBtn.addEventListener("touchstart", () => {
    isMovingUp = true;
    isStart = true;
    isGamePaused = false;
  });

  downBtn.addEventListener("touchstart", () => {
    isMovingDown = true;
    isStart = true;
    isGamePaused = false;
  });

  leftBtn.addEventListener("touchstart", () => {
    isMovingLeft = true;
    isStart = true;
    isGamePaused = false;
  });

  rightBtn.addEventListener("touchstart", () => {
    isMovingRight = true;
    isStart = true;
    isGamePaused = false;
  });

  upBtn.addEventListener("touchend", () => {
    isMovingUp = false;
  });

  downBtn.addEventListener("touchend", () => {
    isMovingDown = false;
  });

  leftBtn.addEventListener("touchend", () => {
    isMovingLeft = false;
  });

  rightBtn.addEventListener("touchend", () => {
    isMovingRight = false;
  });
  musicBtn.addEventListener("click", function () {
    if (isMusicPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  });
  musicBtn.addEventListener("touchend", function () {
    if (isMusicPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  });
};
const update = () => {
  if (39 in keyDown) dogWidth += 5; // 오른쪽 방향키
  if (37 in keyDown) dogWidth -= 5; // 왼쪽 방향키
  if (38 in keyDown) dogHeight -= 5; // 위쪽 방향키
  if (40 in keyDown) dogHeight += 5; // 아래쪽 방향키
  if (isMovingUp && dogHeight > 0) {
    dogHeight -= 2;
  }

  if (isMovingDown && dogHeight + animalSize < canvas.height) {
    dogHeight += 2;
  }

  if (isMovingLeft && dogWidth > 0) {
    dogWidth -= 2;
  }

  if (isMovingRight && dogWidth + animalSize < canvas.width / 2) {
    dogWidth += 2;
  }
  if (isCollisionCooldown) {
    const currentTime = Date.now();
    const elapsed = currentTime - lastCollisionTime;

    if (elapsed >= collisionCooldownDuration) {
      isCollisionCooldown = false;
    }
  } else {
    if (ballCollision(dogWidth, dogHeight, animalSize)) {
      const { centerX, centerY } = getAnimalCenter(dogWidth, dogHeight);
      handleAnimalCollision(centerX, centerY);
      isCollisionCooldown = true;
      lastCollisionTime = Date.now();
    } else if (ballCollision(catX, catY, animalSize)) {
      const { centerX, centerY } = getAnimalCenter(catX, catY);
      handleAnimalCollision(centerX, centerY);
      isCollisionCooldown = true;
      lastCollisionTime = Date.now();
    }
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
  const speed = Math.min(distance, difficulty+1);

  const vx = (speed * dx) / distance;
  const vy = (speed * dy) / distance;

  let newCatX = catX + vx;
  let newCatY = catY + vy;

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

  catX = newCatX;
  catY = newCatY;
};

const drawDifficulty = () => {
  ctx.fillStyle = "black";
  ctx.font = "15px Arial";
  ctx.fillText(
    "Difficulty: " + ["Easy", "Medium", "Hard"][difficulty - 1],
    10,
    40
  );
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(ball, ballX, ballY, ballSize, ballSize);
  ctx.drawImage(dog, dogWidth, dogHeight, animalSize, animalSize);
  ctx.drawImage(cat, catX, catY, animalSize, animalSize);
  drawDifficulty();
  ctx.fillStyle = "black";
  ctx.font = "15px Arial";
  ctx.fillText("Dog: " + dogScore, 10, 20);
  ctx.fillText("Cat: " + catScore, canvas.width - 80, 20);
};

const randomizeBallSpeed = () => {
  // 랜덤한 속도 벡터를 생
  const speed = 5;
  const angle = Math.random() * Math.PI * 2;
  ballSpeedX = Math.cos(angle) * speed;
  ballSpeedY = Math.sin(angle) * speed;
};

const resetPositions = () => {
  dogWidth = canvas.width * 0.1;
  dogHeight = canvas.height * 0.8;
  isStart = false;

  ballX = canvas.width * 0.4;
  ballY = canvas.height * 0.5;
  catX = canvas.width * 0.8;
  catY = canvas.height * 0.8;

  catSpeedX = 0;
  catSpeedY = 0;
  isStart = false;
  ballSpeedX = 0;
  ballSpeedY = 0;
};

const main = () => {
  loadImage(); // 이미지 로드
  const gameLoop = () => {
    if(!isGamePaused)
      render();
    requestAnimationFrame(gameLoop);
  };

  update();
  gameLoop(); // 게임 루프 시작
};

main();
setupKeyboard();
