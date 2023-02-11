const canvas = document.querySelector("canvas");
const scoreCardScore = document.querySelector(".score-card__score");
const gameOverContainer = document.querySelector(".game-over-container");
const instructionContainer = document.querySelector(".instruction-container");
const startButton = document.querySelector(".start-button");
const gameOverScore = document.querySelector(".game-over__score");
const shotsFiredScore = document.querySelector(".shots-fired__score");
const accruacyScore = document.querySelector(".accuracy__score");
const restartButton = document.querySelector(".restart-button");
canvas.height = innerHeight;
canvas.width = innerWidth;
const ctx = canvas.getContext("2d");

// Bullet Class
class Bullet {
  constructor(x, y, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.color = color;
    this.velMultiplier = 1 + (gameScore / 500) * 0.1;
    this.velocity = velocity;
    this.velocity.x = this.velocity.x * this.velMultiplier;
    this.velocity.y = this.velocity.y * this.velMultiplier;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x * 5;
    this.y = this.y + this.velocity.y * 5;
  }
}

// Enemy Class
class Enemy {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.radius = Math.floor(Math.random() * 15) + 10;
    this.color = `hsl(${Math.floor(Math.random() * 360)},70%,70%)`;
    this.velocity = velocity;
    this.velMultiplier = 1 + (gameScore / 500) * 0.2;
    this.velocity.x = this.velocity.x * this.velMultiplier;
    this.velocity.y = this.velocity.y * this.velMultiplier;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

// Particle Class
class Particle {
  constructor(x, y, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = Math.floor(Math.random() * 3);
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= 0.99;
    this.velocity.y *= 0.99;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

// Initial State
let bullets = [];
let enemies = [];
let particles = [];
let gameScore = 0;
let shotsFired = 0;
let successShots = 0;

// Initialize Player
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  color: "white",
  movement: {},
  velocity: 3,
  restart() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
  },
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  },
  move() {
    this.draw();
    if (
      this.x + this.radius + this.movement.x < canvas.width &&
      this.movement.x > 0
    ) {
      this.x += this.movement.x || 0;
    }
    if (
      this.x - this.radius - Math.abs(this.movement.x) > 0 &&
      this.movement.x < 0
    ) {
      this.x += this.movement.x || 0;
    }
    if (
      this.y + this.radius + this.movement.y < canvas.height &&
      this.movement.y > 0
    ) {
      this.y += this.movement.y || 0;
    }
    if (
      this.y - this.radius - Math.abs(this.movement.y) > 0 &&
      this.movement.y < 0
    ) {
      this.y += this.movement.y || 0;
    }
  },
};

// Spawn Enemy
let intervalId;
const spawnEnemy = () => {
  let randomX;
  let randomY;
  if (Math.random() < 0.5) {
    randomX = Math.floor(Math.random() * canvas.width) + 1;
    randomY = Math.random() < 0.5 ? 0 : canvas.height;
  } else {
    randomX = Math.random() < 0.5 ? 0 : canvas.width;
    randomY = Math.floor(Math.random() * canvas.height) + 1;
  }
  const base = player.x - randomX;
  const height = player.y - randomY;
  const angle = Math.atan2(height, base);
  const enemy = new Enemy(randomX, randomY, {
    x: Math.cos(angle),
    y: Math.sin(angle),
  });
  enemies.push(enemy);
};

const updateScore = (score) => {
  gameScore = score;
  scoreCardScore.innerHTML = gameScore;
  player.velocity = 3 * (1 + (gameScore / 500) * 0.1);
};
const gameOverHandler = () => {
  gameOverScore.innerHTML = gameScore;
  shotsFiredScore.innerHTML = shotsFired;
  accruacyScore.innerHTML = `${(
    (successShots / (shotsFired || 1)) *
    100
  ).toFixed(2)}%`;
  gameOverContainer.style.display = "flex";
  clearInterval(intervalId);
  bullets = [];
  enemies = [];
  particles = [];
};

const midY = innerHeight / 2;
const midX = innerWidth / 2;

const animate = () => {
  const animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.move();
  bullets.forEach((bullet, index) => {
    bullet.update();
    if (
      bullet.x + bullet.radius < 0 ||
      bullet.x > canvas.width + bullet.radius ||
      bullet.y + bullet.radius < 0 ||
      bullet.y > canvas.height + bullet.radius
    ) {
      setTimeout(() => {
        bullets.splice(index, 1);
      }, 0);
    }
  });
  particles.forEach((particle, index) => {
    if (particle.alpha > 0) {
      particle.update();
    } else {
      particles.splice(index, 1);
    }
  });
  enemies.forEach((enemy, Eindex) => {
    enemy.update();
    if (
      enemy.x + enemy.radius + 5 < 0 ||
      enemy.x - enemy.radius - 5 > canvas.width ||
      enemy.y + enemy.radius + 5 < 0 ||
      enemy.y - enemy.radius - 5 > canvas.height
    ) {
      setTimeout(() => {
        enemies.splice(Eindex, 1);
      }, 0);
    }
    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (dist - enemy.radius - player.radius < 1) {
      gameOverHandler();
      cancelAnimationFrame(animationId);
    }
    bullets.forEach((bullet, index) => {
      const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if (dist - (enemy.radius + bullet.radius) < 1) {
        for (let i = 0; i < enemy.radius * 2.5; i++) {
          particles.push(
            new Particle(enemy.x, enemy.y, enemy.color, {
              x: (Math.random() - 0.5) * (Math.floor(Math.random() * 8) + 1),
              y: (Math.random() - 0.5) * (Math.floor(Math.random() * 8) + 1),
            })
          );
        }
        successShots++;
        if (enemy.radius < 20) {
          updateScore(gameScore + 50);
          setTimeout(() => {
            bullets.splice(index, 1);
            enemies.splice(Eindex, 1);
          }, 0);
        } else {
          updateScore(gameScore + 100);
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            bullets.splice(index, 1);
          }, 0);
        }
      }
    });
  });
};

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyA") {
    player.movement.x = -player.velocity;
  }
  if (e.code === "KeyS") {
    player.movement.y = player.velocity;
  }
  if (e.code === "KeyD") {
    player.movement.x = player.velocity;
  }
  if (e.code === "KeyW") {
    player.movement.y = -player.velocity;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "KeyA" && player.movement.x < 0) {
    delete player.movement.x;
  }
  if (e.code === "KeyS" && player.movement.y > 0) {
    delete player.movement.y;
  }
  if (e.code === "KeyD" && player.movement.x > 0) {
    delete player.movement.x;
  }
  if (e.code === "KeyW" && player.movement.y < 0) {
    delete player.movement.y;
  }
});

canvas.addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  shotsFired++;
  const B = new Bullet(player.x, player.y, "white", velocity);
  bullets.push(B);
});

restartButton.addEventListener("click", () => {
  player.restart();
  updateScore(0);
  shotsFired = 0;
  successShots = 0;
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  gameOverContainer.style.display = "none";
  intervalId = setInterval(() => {
    spawnEnemy();
  }, 1000);
  animate();
});
startButton.addEventListener("click", () => {
  instructionContainer.style.display = "none";
  intervalId = setInterval(() => {
    spawnEnemy();
  }, 1000);
  animate();
});
