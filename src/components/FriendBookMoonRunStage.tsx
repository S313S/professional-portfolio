import { useEffect, useRef, useState } from 'react';

type GamePhase = 'PLAYING' | 'GAMEOVER' | 'VICTORY';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player extends Rect {
  vx: number;
  vy: number;
  isGrounded: boolean;
  facingRight: boolean;
  state: 'idle' | 'running' | 'jumping' | 'eating';
  animTimer: number;
  eatingTimer: number;
  foodCount: number;
  safeX: number;
  safeY: number;
}

interface Platform extends Rect {
  ox?: number;
  oy?: number;
  mx?: number;
  my?: number;
  sp?: number;
  dx?: number;
  dy?: number;
}

interface Enemy extends Rect {
  vx: number;
  originalX: number;
  range: number;
  type: 'blob' | 'paper';
}

interface Food extends Rect {
  collected: boolean;
  type: 'dango' | 'squid';
}

interface Bouncer extends Rect {
  force: number;
  bounceAnim: number;
}

interface House {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 1 | 2;
}

interface Camera {
  x: number;
  y: number;
}

interface MoonRunStageProps {
  onComplete?: (result: { score: number }) => void;
}

const MOON_RUN_PREVENT_DEFAULT_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ' ',
]);

export function shouldPreventMoonRunKeyboardDefault(key: string) {
  return MOON_RUN_PREVENT_DEFAULT_KEYS.has(key);
}

const GRAVITY = 0.55;
const FRICTION = 0.8;
const JUMP_FORCE = -12;
const MOVE_SPEED = 4.5;
const MAX_FALL_SPEED = 12;

const LEVEL: {
  platforms: Platform[];
  enemies: Enemy[];
  foods: Food[];
  houses: House[];
  bouncers: Bouncer[];
  goal: Rect;
} = {
  platforms: [
    { x: 0, y: 350, width: 450, height: 150 },
    { x: 500, y: 280, width: 120, height: 30 },
    { x: 700, y: 350, width: 400, height: 150 },
    { x: 1200, y: 250, width: 100, height: 30 },
    { x: 1400, y: 150, width: 80, height: 20 },
    { x: 1550, y: 250, width: 90, height: 20, ox: 1550, oy: 250, mx: 150, my: 0, sp: 800 },
    { x: 1850, y: 200, width: 90, height: 20, ox: 1850, oy: 200, mx: 0, my: 100, sp: 1000 },
    { x: 2000, y: 350, width: 500, height: 150 },
    { x: 2600, y: 300, width: 120, height: 30 },
    { x: 2800, y: 400, width: 300, height: 100 },
    { x: 3200, y: 200, width: 150, height: 30 },
    { x: 3450, y: 300, width: 120, height: 30, ox: 3450, oy: 300, mx: 100, my: 0, sp: 700 },
    { x: 3750, y: 350, width: 400, height: 150 },
    { x: 155, y: 250, width: 170, height: 25 },
    { x: 805, y: 260, width: 130, height: 25 },
    { x: 2105, y: 250, width: 190, height: 25 },
    { x: 3805, y: 250, width: 190, height: 25 },
    { x: 4250, y: 300, width: 120, height: 20 },
    { x: 4450, y: 200, width: 100, height: 20, ox: 4450, oy: 200, mx: 0, my: 180, sp: 1400 },
    { x: 4600, y: 100, width: 300, height: 400 },
    { x: 5000, y: 420, width: 140, height: 80 },
    { x: 5300, y: 380, width: 140, height: 120 },
    { x: 5600, y: 300, width: 160, height: 200 },
    { x: 5850, y: 250, width: 90, height: 20, ox: 5850, oy: 250, mx: 180, my: 0, sp: 1200 },
    { x: 6200, y: 200, width: 90, height: 20, ox: 6200, oy: 200, mx: 0, my: 120, sp: 1100 },
    { x: 6450, y: 250, width: 100, height: 20, ox: 6450, oy: 250, mx: 100, my: -60, sp: 1600 },
    { x: 6700, y: 350, width: 800, height: 150 },
    { x: 6755, y: 250, width: 170, height: 25 },
    { x: 7105, y: 250, width: 170, height: 25 },
    { x: 7600, y: 250, width: 120, height: 30 },
    { x: 7900, y: 350, width: 600, height: 150 },
    { x: 7955, y: 250, width: 210, height: 25 },
  ],
  bouncers: [
    { x: 3020, y: 380, width: 40, height: 20, force: -16, bounceAnim: 0 },
    { x: 5030, y: 400, width: 60, height: 20, force: -16, bounceAnim: 0 },
    { x: 5330, y: 360, width: 60, height: 20, force: -18, bounceAnim: 0 },
    { x: 5630, y: 280, width: 80, height: 20, force: -20, bounceAnim: 0 },
  ],
  houses: [
    { x: 150, y: 250, width: 180, height: 100, type: 1 },
    { x: 800, y: 260, width: 140, height: 90, type: 2 },
    { x: 2100, y: 250, width: 200, height: 100, type: 1 },
    { x: 3800, y: 250, width: 200, height: 100, type: 1 },
    { x: 6750, y: 250, width: 180, height: 100, type: 2 },
    { x: 7100, y: 250, width: 180, height: 100, type: 1 },
    { x: 7950, y: 250, width: 220, height: 100, type: 1 },
  ],
  enemies: [
    { x: 200, y: 310, width: 35, height: 40, vx: 0.8, originalX: 200, range: 60, type: 'blob' },
    { x: 880, y: 310, width: 35, height: 40, vx: 1, originalX: 880, range: 80, type: 'blob' },
    { x: 2250, y: 310, width: 35, height: 40, vx: -1.5, originalX: 2250, range: 120, type: 'blob' },
    { x: 2000, y: 180, width: 25, height: 35, vx: 1.2, originalX: 2000, range: 60, type: 'paper' },
    { x: 3950, y: 310, width: 35, height: 40, vx: -2, originalX: 3950, range: 130, type: 'blob' },
    { x: 4700, y: 60, width: 35, height: 40, vx: 1.2, originalX: 4700, range: 110, type: 'blob' },
    { x: 5150, y: 150, width: 25, height: 35, vx: 1.0, originalX: 5150, range: 90, type: 'paper' },
    { x: 5450, y: 100, width: 25, height: 35, vx: -1.0, originalX: 5450, range: 90, type: 'paper' },
    { x: 6900, y: 310, width: 35, height: 40, vx: 1.5, originalX: 6900, range: 180, type: 'blob' },
    { x: 7000, y: 120, width: 25, height: 35, vx: 1.5, originalX: 7000, range: 160, type: 'paper' },
    { x: 7400, y: 180, width: 25, height: 35, vx: -1.5, originalX: 7400, range: 160, type: 'paper' },
    { x: 7700, y: 80, width: 25, height: 35, vx: 1.2, originalX: 7700, range: 80, type: 'paper' },
  ],
  foods: [
    { x: 230, y: 210, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 540, y: 240, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 860, y: 220, width: 30, height: 30, collected: false, type: 'squid' },
    { x: 1420, y: 100, width: 30, height: 30, collected: false, type: 'squid' },
    { x: 1600, y: 200, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 2200, y: 210, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 2400, y: 310, width: 30, height: 30, collected: false, type: 'squid' },
    { x: 3260, y: 150, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 3900, y: 210, width: 30, height: 30, collected: false, type: 'squid' },
    { x: 4465, y: -20, width: 30, height: 30, collected: false, type: 'squid' },
    { x: 4800, y: 60, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 5160, y: 200, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 5460, y: 150, width: 30, height: 30, collected: false, type: 'squid' },
    { x: 6210, y: 40, width: 30, height: 30, collected: false, type: 'squid' },
    { x: 6820, y: 210, width: 30, height: 30, collected: false, type: 'dango' },
    { x: 7400, y: 250, width: 30, height: 30, collected: false, type: 'dango' },
  ],
  goal: { x: 8250, y: 230, width: 150, height: 120 },
};

function cloneLevelState() {
  return {
    platforms: structuredClone(LEVEL.platforms),
    enemies: structuredClone(LEVEL.enemies),
    foods: structuredClone(LEVEL.foods),
    bouncers: structuredClone(LEVEL.bouncers),
  };
}

function createPlayer(): Player {
  return {
    x: 50,
    y: 250,
    width: 45,
    height: 35,
    vx: 0,
    vy: 0,
    isGrounded: false,
    facingRight: true,
    state: 'idle',
    animTimer: 0,
    eatingTimer: 0,
    foodCount: 0,
    safeX: 50,
    safeY: 250,
  };
}

function drawCat(ctx: CanvasRenderingContext2D, player: Player, time: number) {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height);
  if (!player.facingRight) {
    ctx.scale(-1, 1);
  }

  let bodyY =
    player.state === 'running' ? Math.abs(Math.sin(player.animTimer / 60)) * 2 : 0;
  if (player.state === 'eating') {
    bodyY = Math.sin(player.animTimer / 30) * 3;
  }

  const swing = player.state === 'running' ? Math.sin(player.animTimer / 80) * 8 : 0;
  const tailSwing =
    player.state === 'running'
      ? Math.sin(time / 80) * 0.2
      : Math.sin(time / 250) * 0.4;
  const legSpread = player.state === 'running' ? swing : player.state === 'idle' ? 0 : 5;

  const drawBodyClip = () => {
    ctx.beginPath();
    ctx.ellipse(-2, -14 + bodyY, 22, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(14, -18 + bodyY, 11, 9, -0.2, 0, Math.PI * 2);
  };

  ctx.fillStyle = '#e6e6e6';
  ctx.beginPath();
  ctx.ellipse(-14 + legSpread, -4 + bodyY, 6, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10 - legSpread, -4 + bodyY, 6, 3.5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(-22, -14 + bodyY);
  ctx.rotate(tailSwing);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-15, -10, -30, -5);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#9e9996';
  ctx.beginPath();
  ctx.moveTo(9, -26 + bodyY);
  ctx.lineTo(3, -38 + bodyY);
  ctx.lineTo(-1, -24 + bodyY);
  ctx.fill();
  ctx.fillStyle = '#e8a5a5';
  ctx.beginPath();
  ctx.moveTo(7, -27 + bodyY);
  ctx.lineTo(3, -35 + bodyY);
  ctx.lineTo(1, -25 + bodyY);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  drawBodyClip();
  ctx.fill();

  ctx.save();
  drawBodyClip();
  ctx.clip();
  ctx.fillStyle = '#e88941';
  ctx.beginPath();
  ctx.ellipse(12, -26 + bodyY, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9e9996';
  ctx.beginPath();
  ctx.ellipse(-12, -20 + bodyY, 14, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#e88941';
  ctx.beginPath();
  ctx.moveTo(15, -26 + bodyY);
  ctx.lineTo(9, -40 + bodyY);
  ctx.lineTo(5, -26 + bodyY);
  ctx.fill();
  ctx.fillStyle = '#e8a5a5';
  ctx.beginPath();
  ctx.moveTo(13, -27 + bodyY);
  ctx.lineTo(9, -36 + bodyY);
  ctx.lineTo(7, -26 + bodyY);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-14 - legSpread, -2 + bodyY, 6, 3.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12 + legSpread, -2 + bodyY, 6, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#c43333';
  ctx.beginPath();
  ctx.moveTo(6, -11 + bodyY);
  ctx.quadraticCurveTo(14, -5 + bodyY, 21, -11 + bodyY);
  ctx.stroke();

  ctx.fillStyle = '#e5b937';
  ctx.beginPath();
  ctx.arc(15, -7 + bodyY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a661c';
  ctx.fillRect(13, -8 + bodyY, 4, 1);
  ctx.beginPath();
  ctx.arc(15, -6 + bodyY, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff9e9e';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(10, -12 + bodyY, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(21, -12 + bodyY, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = '#d66868';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(9, -13 + bodyY);
  ctx.lineTo(11, -11 + bodyY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, -11 + bodyY);
  ctx.lineTo(22, -13 + bodyY);
  ctx.stroke();

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';

  if (player.state === 'eating') {
    ctx.beginPath();
    ctx.moveTo(11, -18 + bodyY);
    ctx.quadraticCurveTo(13, -21 + bodyY, 15, -18 + bodyY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -18 + bodyY);
    ctx.quadraticCurveTo(20, -21 + bodyY, 22, -18 + bodyY);
    ctx.stroke();
    ctx.fillStyle = '#db5a6b';
    ctx.beginPath();
    ctx.arc(16.5, -14 + bodyY, 2.5, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#e86a7d';
    ctx.font = '20px Arial';
    ctx.fillText('♪', 24, -30 + bodyY - (500 - player.eatingTimer) / 15);
  } else {
    ctx.beginPath();
    ctx.moveTo(11.5, -17.5 + bodyY);
    ctx.quadraticCurveTo(13.5, -17 + bodyY, 15.5, -17.5 + bodyY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18.5, -17.5 + bodyY);
    ctx.quadraticCurveTo(20.5, -17 + bodyY, 22.5, -17.5 + bodyY);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(15, -14 + bodyY);
    ctx.quadraticCurveTo(16, -12 + bodyY, 17, -14 + bodyY);
    ctx.quadraticCurveTo(18, -12 + bodyY, 19, -14 + bodyY);
    ctx.stroke();
  }

  ctx.restore();
}

function resetBooleanKey(keys: Record<string, boolean>, key: string) {
  keys[key] = false;
}

export default function FriendBookMoonRunStage({ onComplete }: MoonRunStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const playerRef = useRef<Player>(createPlayer());
  const cameraRef = useRef<Camera>({ x: 0, y: 0 });
  const platformsRef = useRef<Platform[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const foodsRef = useRef<Food[]>([]);
  const bouncersRef = useRef<Bouncer[]>([]);
  const scoreRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const [phase, setPhase] = useState<GamePhase>('PLAYING');
  const [score, setScore] = useState(0);

  onCompleteRef.current = onComplete;

  const resetRun = () => {
    const nextLevel = cloneLevelState();
    playerRef.current = createPlayer();
    cameraRef.current = { x: 0, y: 0 };
    platformsRef.current = nextLevel.platforms;
    enemiesRef.current = nextLevel.enemies;
    foodsRef.current = nextLevel.foods;
    bouncersRef.current = nextLevel.bouncers;
    scoreRef.current = 0;
    setScore(0);
    setPhase('PLAYING');
    keysRef.current = {};
  };

  useEffect(() => {
    resetRun();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldPreventMoonRunKeyboardDefault(event.key)) {
        event.preventDefault();
      }
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (shouldPreventMoonRunKeyboardDefault(event.key)) {
        event.preventDefault();
      }
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'PLAYING') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    let animationFrameId = 0;
    let lastTime = performance.now();

    const checkCollisionX = (rect1: Rect, rect2: Rect, nextX: number) =>
      nextX < rect2.x + rect2.width &&
      nextX + rect1.width > rect2.x &&
      rect1.y + 12 < rect2.y + rect2.height &&
      rect1.y + rect1.height - 12 > rect2.y;

    const checkCollisionY = (rect1: Rect, rect2: Rect, nextY: number) =>
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      nextY < rect2.y + rect2.height &&
      nextY + rect1.height > rect2.y;

    const renderFrame = (time: number) => {
      const cssWidth = Math.max(1, Math.floor(canvas.clientWidth));
      const cssHeight = Math.max(1, Math.floor(canvas.clientHeight));
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scaledWidth = Math.floor(cssWidth * devicePixelRatio);
      const scaledHeight = Math.floor(cssHeight * devicePixelRatio);

      if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
      }

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const dt = time - lastTime;
      lastTime = time;

      const player = playerRef.current;
      if (player.foodCount !== scoreRef.current) {
        scoreRef.current = player.foodCount;
        setScore(player.foodCount);
      }

      platformsRef.current.forEach((platform) => {
        if (platform.mx !== undefined && platform.sp) {
          const lastX = platform.x;
          const lastY = platform.y;
          platform.x = (platform.ox || 0) + Math.sin(time / platform.sp) * platform.mx;
          platform.y = (platform.oy || 0) + Math.sin(time / platform.sp) * (platform.my || 0);
          platform.dx = platform.x - lastX;
          platform.dy = platform.y - lastY;
        } else {
          platform.dx = 0;
          platform.dy = 0;
        }
      });

      if (player.eatingTimer > 0) {
        player.eatingTimer -= dt;
        player.state = 'eating';
        player.vx *= 0.5;
        if (player.eatingTimer <= 0) {
          player.state = player.isGrounded ? 'idle' : 'jumping';
        }
      } else {
        if (keysRef.current.ArrowLeft || keysRef.current.KeyA) {
          player.vx -= 1.5 * (dt / 16);
          player.facingRight = false;
          player.state = 'running';
        } else if (keysRef.current.ArrowRight || keysRef.current.KeyD) {
          player.vx += 1.5 * (dt / 16);
          player.facingRight = true;
          player.state = 'running';
        } else {
          player.state = player.isGrounded ? 'idle' : player.state;
        }

        if (
          (keysRef.current.ArrowUp || keysRef.current.KeyW || keysRef.current.Space) &&
          player.isGrounded
        ) {
          player.vy = JUMP_FORCE;
          player.isGrounded = false;
          player.state = 'jumping';
        }
      }

      player.vy += GRAVITY * (dt / 16);
      if (player.vy > MAX_FALL_SPEED) {
        player.vy = MAX_FALL_SPEED;
      }
      player.vx *= Math.pow(FRICTION, dt / 16);
      if (Math.abs(player.vx) < 0.1) {
        player.vx = 0;
      }
      player.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, player.vx));
      player.animTimer += dt;

      let nextX = player.x + player.vx * (dt / 16);
      for (const platform of platformsRef.current) {
        if (checkCollisionX(player, platform, nextX)) {
          if (player.vx > 0) {
            nextX = platform.x - player.width;
            player.vx = 0;
          } else if (player.vx < 0) {
            nextX = platform.x + platform.width;
            player.vx = 0;
          }
        }
      }
      player.x = nextX;

      let nextY = player.y + player.vy * (dt / 16);
      let ridingPlatform: Platform | null = null;
      player.isGrounded = false;

      for (const platform of platformsRef.current) {
        if (checkCollisionY(player, platform, nextY)) {
          if (player.vy > 0) {
            nextY = platform.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
            ridingPlatform = platform;
          } else if (player.vy < 0) {
            nextY = platform.y + platform.height;
            player.vy = 0;
          }
        }
      }
      player.y = nextY;

      if (ridingPlatform?.dx) {
        player.x += ridingPlatform.dx;
      }

      if (player.isGrounded && !ridingPlatform) {
        player.safeX = player.x;
        player.safeY = player.y;
      }

      if (!player.isGrounded && player.eatingTimer <= 0) {
        player.state = 'jumping';
      }
      if (Math.abs(player.vx) < 0.1 && player.isGrounded && player.eatingTimer <= 0) {
        player.state = 'idle';
      }

      bouncersRef.current.forEach((bouncer) => {
        if (bouncer.bounceAnim > 0) {
          bouncer.bounceAnim -= dt;
        }
        if (
          player.x < bouncer.x + bouncer.width &&
          player.x + player.width > bouncer.x &&
          player.y + player.height >= bouncer.y &&
          player.y + player.height <= bouncer.y + 15 &&
          player.vy > 0
        ) {
          player.vy = bouncer.force;
          player.isGrounded = false;
          player.state = 'jumping';
          bouncer.bounceAnim = 200;
        }
      });

      foodsRef.current.forEach((food) => {
        if (
          !food.collected &&
          player.x < food.x + food.width &&
          player.x + player.width > food.x &&
          player.y < food.y + food.height &&
          player.y + player.height > food.y
        ) {
          food.collected = true;
          player.eatingTimer = 500;
          player.foodCount += 1;
          player.vy = Math.min(player.vy, -3);
        }
      });

      let phaseChanged = false;

      enemiesRef.current.forEach((enemy) => {
        enemy.x += enemy.vx * (dt / 16);
        if (enemy.x > enemy.originalX + enemy.range) {
          enemy.x = enemy.originalX + enemy.range;
          enemy.vx = -Math.abs(enemy.vx);
        } else if (enemy.x < enemy.originalX - enemy.range) {
          enemy.x = enemy.originalX - enemy.range;
          enemy.vx = Math.abs(enemy.vx);
        }

        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          if (player.vy > 0 && player.y + player.height < enemy.y + enemy.height / 2 + 10) {
            player.vy = JUMP_FORCE * 0.7;
            enemy.y += 2000;
          } else if (!phaseChanged) {
            phaseChanged = true;
            setPhase('GAMEOVER');
          }
        }
      });

      if (
        !phaseChanged &&
        player.x < LEVEL.goal.x + LEVEL.goal.width &&
        player.x + player.width > LEVEL.goal.x &&
        player.y < LEVEL.goal.y + LEVEL.goal.height &&
        player.y + player.height > LEVEL.goal.y
      ) {
        phaseChanged = true;
        scoreRef.current = player.foodCount;
        setScore(player.foodCount);
        setPhase('VICTORY');
      }

      if (!phaseChanged && player.y > cssHeight + 200) {
        phaseChanged = true;
        setPhase('GAMEOVER');
      }

      const targetCameraX = player.x - cssWidth / 3 + player.width / 2;
      cameraRef.current.x += (targetCameraX - cameraRef.current.x) * 0.08;
      if (cameraRef.current.x < 0) {
        cameraRef.current.x = 0;
      }

      const gradient = context.createLinearGradient(0, 0, 0, cssHeight);
      gradient.addColorStop(0, '#0b1021');
      gradient.addColorStop(1, '#1b2b4c');
      context.fillStyle = gradient;
      context.fillRect(0, 0, cssWidth, cssHeight);

      context.save();
      context.fillStyle = '#ffffff';
      for (let index = 0; index < 30; index += 1) {
        const starX = (index * 123) % cssWidth;
        const starY = (index * 321) % (cssHeight / 2);
        const twinkle = Math.max(0.2, Math.sin(time / 500 + index));
        context.globalAlpha = twinkle;
        context.beginPath();
        context.arc(starX, starY, 1.5, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();

      context.fillStyle = '#fff8d6';
      context.beginPath();
      context.arc(cssWidth - 150, 100, 60, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 30;
      context.shadowColor = '#fff8d6';
      context.beginPath();
      context.arc(cssWidth - 150, 100, 60, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;

      context.save();
      context.translate(-cameraRef.current.x, 0);

      context.fillStyle = '#0f1f33';
      context.beginPath();
      const parallaxOffset = cameraRef.current.x * 0.8;
      const startIndex = Math.floor((cameraRef.current.x * 0.2) / 200) * 200 - 200;
      for (let hillX = startIndex; hillX < startIndex + cssWidth + 800; hillX += 200) {
        const x = hillX + parallaxOffset;
        const seed = hillX / 200;
        context.moveTo(x, cssHeight);
        context.bezierCurveTo(
          x + 100,
          cssHeight - 150 - Math.sin(seed) * 50,
          x + 200,
          cssHeight - 150 + Math.cos(seed) * 30,
          x + 300,
          cssHeight,
        );
      }
      context.fill();

      LEVEL.houses.forEach((house) => {
        const posX = house.x;
        if (posX < cameraRef.current.x - 300 || posX > cameraRef.current.x + cssWidth + 300) {
          return;
        }

        context.save();
        context.translate(posX, house.y);
        if (house.type === 1) {
          context.fillStyle = '#6b7a99';
          context.fillRect(0, 0, house.width, house.height);
          context.fillStyle = '#3c4a63';
          context.fillRect(5, 0, 8, house.height);
          context.fillRect(house.width - 13, 0, 8, house.height);
          context.fillStyle = '#26334a';
          context.beginPath();
          context.moveTo(-15, 0);
          context.lineTo(house.width / 2, -40);
          context.lineTo(house.width + 15, 0);
          context.fill();
          context.fillStyle = '#ffea99';
          context.fillRect(20, house.height - 40, 30, 40);
          context.fillRect(house.width - 50, house.height - 40, 30, 40);
        } else {
          context.fillStyle = '#5c6c87';
          context.fillRect(0, 0, house.width, house.height);
          context.fillStyle = '#2d3b52';
          context.fillRect(10, 20, house.width - 20, 5);
          context.fillRect(10, 40, house.width - 20, 5);
          context.fillStyle = '#1c283d';
          context.beginPath();
          context.moveTo(-10, 5);
          context.lineTo(10, -30);
          context.lineTo(house.width - 10, -30);
          context.lineTo(house.width + 10, 5);
          context.fill();
          context.fillStyle = '#ffea99';
          context.fillRect(house.width / 2 - 15, house.height - 40, 30, 40);
        }
        context.restore();
      });

      for (const platform of platformsRef.current) {
        context.fillStyle = '#3f4f66';
        context.beginPath();
        context.roundRect(platform.x + 2, platform.y + 10, platform.width - 4, platform.height - 10, 4);
        context.fill();
        context.fillStyle = '#4c6b5b';
        context.beginPath();
        context.roundRect(platform.x, platform.y, platform.width, 25, 8);
        context.fill();
        context.fillStyle = '#3d5c4b';
        for (let x = platform.x + 10; x < platform.x + platform.width - 10; x += 20) {
          const tuftHeight = 8 + (x % 6);
          context.beginPath();
          context.moveTo(x, platform.y + 5);
          context.lineTo(x + 8, platform.y - tuftHeight);
          context.lineTo(x + 16, platform.y + 5);
          context.fill();
        }
      }

      bouncersRef.current.forEach((bouncer) => {
        const squat = bouncer.bounceAnim > 0 ? 5 : 0;
        context.save();
        context.translate(bouncer.x + bouncer.width / 2, bouncer.y + bouncer.height);
        context.fillStyle = '#e8d2b7';
        context.fillRect(-10, -bouncer.height, 20, bouncer.height);
        context.fillStyle = '#d65a5a';
        context.beginPath();
        context.ellipse(0, -bouncer.height + squat, bouncer.width / 2 + 5, 12, 0, Math.PI, 0);
        context.fill();
        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(-10, -bouncer.height - 4 + squat, 3, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(10, -bouncer.height - 2 + squat, 4, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      context.save();
      context.translate(LEVEL.goal.x, LEVEL.goal.y);
      context.fillStyle = '#b74439';
      context.fillRect(20, 50, LEVEL.goal.width - 40, LEVEL.goal.height - 50);
      context.fillStyle = '#3a332d';
      context.beginPath();
      context.moveTo(0, 50);
      context.lineTo(LEVEL.goal.width / 2, 0);
      context.lineTo(LEVEL.goal.width, 50);
      context.fill();
      context.fillStyle = '#f4e8d4';
      context.beginPath();
      context.arc(LEVEL.goal.width / 2, LEVEL.goal.height - 20, 20, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#ffb3c6';
      context.beginPath();
      context.arc(LEVEL.goal.width / 2 - 10, LEVEL.goal.height - 30, 10, 0, Math.PI * 2);
      context.fill();
      context.restore();

      foodsRef.current.forEach((food) => {
        if (food.collected) {
          return;
        }

        const bounce = Math.sin(time / 400 + food.x) * 4;
        context.save();
        context.translate(food.x + food.width / 2, food.y + food.height / 2 + bounce);
        if (food.type === 'dango') {
          context.fillStyle = '#c7aa87';
          context.fillRect(-2, -5, 4, 30);
          context.fillStyle = '#ffb3c6';
          context.beginPath();
          context.arc(0, -10, 8, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = '#fcfcfc';
          context.beginPath();
          context.arc(0, 2, 8, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = '#9bd4a0';
          context.beginPath();
          context.arc(0, 14, 8, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillStyle = '#d47153';
          context.beginPath();
          context.moveTo(0, -15);
          context.lineTo(-10, 0);
          context.lineTo(10, 0);
          context.fill();
          context.fillRect(-8, 0, 16, 15);
          context.fillRect(-2, -5, 4, 30);
          context.strokeStyle = '#c45131';
          context.beginPath();
          context.moveTo(-6, 4);
          context.lineTo(6, 4);
          context.stroke();
        }
        context.restore();
      });

      enemiesRef.current.forEach((enemy) => {
        const bouncePhase = time / 600 + enemy.originalX;
        const bounce =
          enemy.type === 'blob'
            ? Math.abs(Math.sin(bouncePhase)) * 1.5
            : Math.sin(bouncePhase / 1.5) * 6;

        context.save();
        context.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height - bounce);
        if (enemy.type === 'blob') {
          context.fillStyle = '#91bf5e';
          context.beginPath();
          context.arc(0, -enemy.height / 2 + 5, enemy.width / 2, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = '#fff';
          context.beginPath();
          context.arc(0, -enemy.height / 2 + 2, 8, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = '#333';
          context.beginPath();
          context.arc(enemy.vx > 0 ? 2 : -2, -enemy.height / 2 + 2, 3, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = '#619630';
          context.beginPath();
          context.moveTo(0, -enemy.height / 2 - 10);
          context.quadraticCurveTo(10, -enemy.height - 5, 12, -enemy.height / 2 - 5);
          context.fill();
        } else {
          const flap = Math.sin(time / 600 + enemy.originalX) * 8;
          context.fillStyle = '#fdfaf5';
          context.strokeStyle = '#e64e43';
          context.lineWidth = 1.5;
          context.beginPath();
          context.moveTo(-enemy.width / 2, -enemy.height);
          context.lineTo(enemy.width / 2, -enemy.height);
          context.lineTo(enemy.width / 2 - 5, -flap);
          context.lineTo(-enemy.width / 2 + 5, -flap);
          context.closePath();
          context.fill();
          context.stroke();
          context.beginPath();
          context.arc(0, -enemy.height + 6, 4, 0, Math.PI * 2);
          context.fillStyle = '#e64e43';
          context.fill();
        }
        context.restore();
      });

      drawCat(context, player, time);
      context.restore();

      if (!phaseChanged) {
        animationFrameId = window.requestAnimationFrame(renderFrame);
      }
    };

    animationFrameId = window.requestAnimationFrame(renderFrame);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [phase]);

  const setDirectionalKey = (
    key: 'ArrowLeft' | 'ArrowRight' | 'Space',
    value: boolean,
  ) => {
    keysRef.current[key] = value;
  };

  const actionButtonClassName =
    'inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#3b4b73]/70 bg-[#1a264a]/80 text-3xl text-[#a1b1cc] shadow-[0_0_18px_rgba(0,0,0,0.45)] backdrop-blur-sm transition active:scale-95';

  return (
    <div
      data-moon-run-canvas-shell="true"
      className="relative overflow-hidden rounded-[1.55rem] border border-[#293a61] bg-[#0b1021] shadow-[0_24px_60px_rgba(15,21,38,0.36)]"
    >
      <div className="relative h-[460px] sm:h-[520px] lg:h-[620px]">
        <canvas
          ref={canvasRef}
          data-moon-run-canvas="true"
          className="absolute inset-0 block h-full w-full"
        />

        <div
          data-moon-run-hud="true"
          className="pointer-events-none absolute left-5 top-5 text-[#a1b1cc] drop-shadow-[0_2px_8px_rgba(11,16,33,0.5)]"
        >
          <p className="font-serif text-[1.9rem] font-bold text-[#ffd166]">🍡 x {score}</p>
          <p className="mt-2 font-serif text-[1rem] sm:text-[1.1rem]">← → Move</p>
          <p className="font-serif text-[1rem] sm:text-[1.1rem]">Space / ↑ Jump</p>
        </div>

        <div
          data-moon-run-touch-controls="true"
          className="absolute inset-x-0 bottom-5 flex items-end justify-between px-5 md:hidden"
        >
          <div className="flex gap-4">
            <button
              type="button"
              aria-label="Move left"
              className={actionButtonClassName}
              onPointerDown={() => setDirectionalKey('ArrowLeft', true)}
              onPointerUp={() => setDirectionalKey('ArrowLeft', false)}
              onPointerLeave={() => setDirectionalKey('ArrowLeft', false)}
              onPointerCancel={() => setDirectionalKey('ArrowLeft', false)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Move right"
              className={actionButtonClassName}
              onPointerDown={() => setDirectionalKey('ArrowRight', true)}
              onPointerUp={() => setDirectionalKey('ArrowRight', false)}
              onPointerLeave={() => setDirectionalKey('ArrowRight', false)}
              onPointerCancel={() => setDirectionalKey('ArrowRight', false)}
            >
              →
            </button>
          </div>

          <button
            type="button"
            aria-label="Jump"
            className={actionButtonClassName}
            onPointerDown={() => setDirectionalKey('Space', true)}
            onPointerUp={() => setDirectionalKey('Space', false)}
            onPointerLeave={() => setDirectionalKey('Space', false)}
            onPointerCancel={() => setDirectionalKey('Space', false)}
          >
            ↑
          </button>
        </div>

        {phase !== 'PLAYING' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,21,38,0.88)] px-6 backdrop-blur-md">
            <div className="w-full max-w-[500px] rounded-[1.6rem] border-2 border-[#3c5280] bg-[#1f2f4f] px-8 py-10 text-center shadow-[0_0_60px_rgba(0,0,0,0.55)]">
              {phase === 'VICTORY' ? (
                <>
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#425a8f] bg-[#2a3c63] text-5xl">
                    🍡
                  </div>
                  <h4 className="mt-6 font-serif text-[2.2rem] font-bold text-[#e6eaf3]">
                    What a Feast!
                  </h4>
                  <p className="mt-3 text-base leading-7 text-[#a1b1cc]">
                    Nyanko-sensei reached the village gate after collecting{' '}
                    <span className="font-semibold text-[#ffd166]">{score}</span> midnight
                    snacks.
                  </p>
                  <button
                    type="button"
                    onClick={() => onCompleteRef.current?.({ score })}
                    className="mt-8 inline-flex items-center justify-center rounded-full border border-[#425a8f] bg-[#2a3c63] px-6 py-3 font-serif text-lg font-semibold text-[#ffd166] shadow-[2px_4px_0_#16203d]"
                  >
                    Continue to note
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#6e3e44] bg-[#3b2a2e] text-5xl">
                    💢
                  </div>
                  <h4 className="mt-6 font-serif text-[2.2rem] font-bold text-[#e8818b]">
                    Oops!
                  </h4>
                  <p className="mt-3 text-base leading-7 text-[#a87a80]">
                    You missed a jump or bumped into a Yokai.
                  </p>
                  <button
                    type="button"
                    onClick={resetRun}
                    className="mt-8 inline-flex items-center justify-center rounded-full border border-[#425a8f] bg-[#2a3c63] px-6 py-3 font-serif text-lg font-semibold text-[#e6eaf3] shadow-[2px_4px_0_#16203d]"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
