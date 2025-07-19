const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

const gravity = 0.5;
const floorY = 350;

class Player {
  constructor(x, y, clone = false, replay = []) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 20;
    this.height = 30;
    this.color = clone ? "cyan" : "lime";
    this.onGround = false;
    this.replay = replay;
    this.record = !clone;
    this.replayIndex = 0;
  }

  update(input) {
    if (this.record) {
      this.replay.push({ x: this.x, y: this.y });
    } else {
      if (this.replay.length > 0) {
        const index = this.replayIndex % this.replay.length;
        this.x = this.replay[index].x;
        this.y = this.replay[index].y;
        this.replayIndex++;
        return;
      }
    }

    if (input.left) this.vx = -2;
    else if (input.right) this.vx = 2;
    else this.vx = 0;

    if (input.jump && this.onGround) {
      this.vy = -10;
      this.onGround = false;
    }

    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    // Floor collision
    this.onGround = false;
    if (this.y + this.height >= floorY) {
      this.y = floorY - this.height;
      this.vy = 0;
      this.onGround = true;
    }

    // Platform collision
    for (let plat of platforms) {
      if (
        this.x < plat.x + plat.w &&
        this.x + this.width > plat.x &&
        this.y + this.height <= plat.y + 10 &&
        this.y + this.height + this.vy >= plat.y
      ) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

let players = [];
let clones = [];
let loopTime = 10 * 60; // 10 seconds at 60 FPS
let timer = loopTime;
let mainPlayer = null;

const platforms = window.customPlatforms || [
  { x: 200, y: 300, w: 100, h: 10 },
  { x: 400, y: 250, w: 100, h: 10 },
  { x: 600, y: 200, w: 100, h: 10 }
];

function newLoop() {
  if (mainPlayer) {
    clones.push(new Player(50, floorY - 30, true, [...mainPlayer.replay]));
  }
  mainPlayer = new Player(50, floorY - 30);
  players = [mainPlayer, ...clones];
  timer = loopTime;
}

newLoop();

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw floor
  ctx.fillStyle = "#555";
  ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

  // Draw platforms
  ctx.fillStyle = "#777";
  for (let plat of platforms) {
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
  }

  const input = {
    left: keys["ArrowLeft"] || keys["a"],
    right: keys["ArrowRight"] || keys["d"],
    jump: keys[" "] || keys["w"] || keys["ArrowUp"]
  };

  for (let player of players) {
    player.update(player.record ? input : {});
    player.draw();
  }

  // Draw timer
  ctx.fillStyle = "#fff";
  ctx.font = "16px sans-serif";
  ctx.fillText("Time Left: " + Math.ceil(timer / 60), 10, 20);

  timer--;
  if (timer <= 0) newLoop();

  requestAnimationFrame(gameLoop);
}
gameLoop();
