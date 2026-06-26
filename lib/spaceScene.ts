function hash(seed: number, n: number) {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

export type SpacePalette = {
  star: [number, number, number];
  accent: [number, number, number];
  glow: [number, number, number];
  nebula: [number, number, number];
};

export type BackgroundStar = {
  x: number;
  y: number;
  z: number;
  twinkle: number;
};

export type ShootingStar = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tailLen: number;
  seed: number;
  alive: boolean;
};

export type ExplosionParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  tint: number;
};

export type Explosion = {
  x: number;
  y: number;
  born: number;
  life: number;
  particles: ExplosionParticle[];
};

export type SpaceScene = {
  width: number;
  height: number;
  stars: BackgroundStar[];
  shootingStars: ShootingStar[];
  explosions: Explosion[];
  nextShooterId: number;
  nextSpawnAt: number;
};

export function createSpaceScene(width: number, height: number): SpaceScene {
  const stars: BackgroundStar[] = Array.from({ length: 160 }, (_, i) => ({
    x: hash(i, 1) * width,
    y: hash(i, 2) * height,
    z: 0.15 + hash(i, 3) * 0.85,
    twinkle: hash(i, 4) * Math.PI * 2,
  }));

  return {
    width,
    height,
    stars,
    shootingStars: [],
    explosions: [],
    nextShooterId: 1,
    nextSpawnAt: performance.now() + 1200,
  };
}

export function resizeSpaceScene(_scene: SpaceScene, width: number, height: number): SpaceScene {
  return createSpaceScene(width, height);
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function findShootingStarAt(scene: SpaceScene, px: number, py: number): number {
  for (let i = scene.shootingStars.length - 1; i >= 0; i--) {
    const star = scene.shootingStars[i];
    if (!star.alive) continue;

    const tailX = star.x - star.vx * star.tailLen * 0.12;
    const tailY = star.y - star.vy * star.tailLen * 0.12;
    const onTail = distToSegment(px, py, tailX, tailY, star.x, star.y) < 20;
    const onHead = Math.hypot(px - star.x, py - star.y) < 16;

    if (onTail || onHead) return i;
  }
  return -1;
}

export function explodeShootingStar(scene: SpaceScene, index: number, now: number): boolean {
  const star = scene.shootingStars[index];
  if (!star || !star.alive) return false;

  star.alive = false;
  const particles: ExplosionParticle[] = [];

  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2 + hash(star.seed, i) * 0.6;
    const speed = 1.8 + hash(star.seed, i + 1) * 7;
    particles.push({
      x: star.x,
      y: star.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      born: now,
      life: 700 + hash(star.seed, i + 2) * 900,
      size: 1.5 + hash(star.seed, i + 3) * 4,
      tint: hash(star.seed, i + 4),
    });
  }

  scene.explosions.push({
    x: star.x,
    y: star.y,
    born: now,
    life: 1100,
    particles,
  });

  return true;
}

function spawnShootingStar(scene: SpaceScene, now: number) {
  const side = hash(now, 1) > 0.5 ? "left" : "top";
  let x: number;
  let y: number;

  if (side === "left") {
    x = -40;
    y = scene.height * (0.08 + hash(now, 2) * 0.45);
  } else {
    x = scene.width * (0.1 + hash(now, 3) * 0.7);
    y = -30;
  }

  const angle = Math.PI * 0.2 + hash(now, 4) * 0.35;
  const speed = 7 + hash(now, 5) * 5;

  scene.shootingStars.push({
    id: scene.nextShooterId++,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    tailLen: 70 + hash(now, 6) * 90,
    seed: now * 0.017 + hash(now, 7) * 100,
    alive: true,
  });

  scene.nextSpawnAt = now + 1800 + hash(now, 8) * 3200;
}

export function updateSpaceScene(scene: SpaceScene, now: number) {
  if (now >= scene.nextSpawnAt && scene.shootingStars.filter((s) => s.alive).length < 4) {
    spawnShootingStar(scene, now);
  }

  for (const star of scene.shootingStars) {
    if (!star.alive) continue;
    star.x += star.vx;
    star.y += star.vy;
    if (star.x > scene.width + 120 || star.y > scene.height + 120) {
      star.alive = false;
    }
  }

  scene.shootingStars = scene.shootingStars.filter((s) => s.alive || s.x < scene.width + 200);

  scene.explosions = scene.explosions.filter((explosion) => {
    const age = now - explosion.born;
    if (age > explosion.life) return false;

    for (const p of explosion.particles) {
      const pAge = now - p.born;
      if (pAge > p.life) continue;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.vy += 0.02;
      p.x += p.vx;
      p.y += p.vy;
    }
    return true;
  });

  if (scene.explosions.length > 12) {
    scene.explosions.splice(0, scene.explosions.length - 12);
  }
}

function drawExplosion(
  ctx: CanvasRenderingContext2D,
  explosion: Explosion,
  now: number,
  palette: SpacePalette,
) {
  const age = now - explosion.born;
  const life = Math.max(0, 1 - age / explosion.life);
  if (life <= 0) return;

  const flash = Math.pow(life, 0.35);
  const burst = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, 40 + flash * 80);
  burst.addColorStop(0, `rgba(255, 255, 255, ${flash * 0.85})`);
  burst.addColorStop(0.2, rgba(palette.glow, flash * 0.55));
  burst.addColorStop(0.55, rgba(palette.accent, flash * 0.25));
  burst.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = burst;
  ctx.beginPath();
  ctx.arc(explosion.x, explosion.y, 40 + flash * 90, 0, Math.PI * 2);
  ctx.fill();

  for (const p of explosion.particles) {
    const pAge = now - p.born;
    const pLife = Math.max(0, 1 - pAge / p.life);
    if (pLife <= 0) continue;

    const fade = 1 - Math.pow(1 - pLife, 1.5);
    const color = p.tint > 0.5 ? palette.glow : palette.accent;
    ctx.fillStyle = rgba(color, fade * 0.9);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * fade, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rgba(palette.star, fade * 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
    ctx.stroke();
  }
}

export function renderSpaceScene(
  ctx: CanvasRenderingContext2D,
  scene: SpaceScene,
  now: number,
  palette: SpacePalette,
) {
  const { width, height } = scene;
  ctx.clearRect(0, 0, width, height);

  const nebula = ctx.createRadialGradient(
    width * 0.5,
    height * 0.35,
    0,
    width * 0.5,
    height * 0.35,
    width * 0.55,
  );
  nebula.addColorStop(0, rgba(palette.nebula, 0.12));
  nebula.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, width, height);

  for (const star of scene.stars) {
    const drift = Math.sin(now * 0.00015 * star.z + star.twinkle) * 1.5;
    const size = 0.4 + star.z * 1.8;
    const a = (0.15 + star.z * 0.45) * (0.7 + Math.sin(now * 0.002 + star.twinkle) * 0.3);
    ctx.beginPath();
    ctx.arc(star.x + drift, star.y, size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(palette.star, a);
    ctx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (const star of scene.shootingStars) {
    if (!star.alive) continue;

    const tailX = star.x - star.vx * star.tailLen * 0.12;
    const tailY = star.y - star.vy * star.tailLen * 0.12;
    const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
    grad.addColorStop(0, rgba(palette.accent, 0));
    grad.addColorStop(0.55, rgba(palette.glow, 0.35));
    grad.addColorStop(1, rgba(palette.star, 0.95));

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(star.x, star.y);
    ctx.stroke();

    const head = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 8);
    head.addColorStop(0, "rgba(255,255,255,0.95)");
    head.addColorStop(0.4, rgba(palette.glow, 0.6));
    head.addColorStop(1, rgba(palette.accent, 0));
    ctx.fillStyle = head;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const explosion of scene.explosions) {
    drawExplosion(ctx, explosion, now, palette);
  }

  ctx.restore();
}

export function clickSpaceScene(scene: SpaceScene, px: number, py: number, now: number): boolean {
  const index = findShootingStarAt(scene, px, py);
  if (index < 0) return false;
  return explodeShootingStar(scene, index, now);
}
