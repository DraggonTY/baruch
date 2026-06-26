function hash(seed: number, n: number) {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

export type FirePalette = {
  core: [number, number, number];
  mid: [number, number, number];
  tip: [number, number, number];
  ember: [number, number, number];
  gas: [number, number, number];
  smoke: [number, number, number];
};

export type FlameSource = {
  x: number;
  baseY: number;
  width: number;
  phase: number;
  fuel: number;
  burst: number;
};

export type FireParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  heat: number;
  seed: number;
};

export type GasParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
};

export type FireScene = {
  width: number;
  height: number;
  fireLineY: number;
  sources: FlameSource[];
  particles: FireParticle[];
  gasParticles: GasParticle[];
};

const MAX_PARTICLES = 2800;

export function createFireScene(width: number, height: number): FireScene {
  const count = Math.max(9, Math.floor(width / 64));
  const spacing = width / count;
  const fireLineY = height - 8;

  const sources: FlameSource[] = Array.from({ length: count }, (_, i) => ({
    x: spacing * (i + 0.5) + (hash(i, 0) - 0.5) * spacing * 0.25,
    baseY: fireLineY,
    width: 34 + hash(i, 1) * 24,
    phase: hash(i, 2) * Math.PI * 2,
    fuel: 0,
    burst: 0,
  }));

  return {
    width,
    height,
    fireLineY,
    sources,
    particles: [],
    gasParticles: [],
  };
}

export function resizeFireScene(_scene: FireScene, width: number, height: number): FireScene {
  return createFireScene(width, height);
}

function nearestSource(scene: FireScene, x: number) {
  let best = scene.sources[0];
  let bestDist = Infinity;
  for (const source of scene.sources) {
    const d = Math.abs(source.x - x);
    if (d < bestDist) {
      bestDist = d;
      best = source;
    }
  }
  return best;
}

function spawnFireParticle(
  scene: FireScene,
  x: number,
  y: number,
  power: number,
  seed: number,
) {
  if (scene.particles.length >= MAX_PARTICLES) {
    scene.particles.shift();
  }

  const lift = (2.8 + power * 5.5 + hash(seed, 1) * 2.2) * -1;
  scene.particles.push({
    x: x + (hash(seed, 2) - 0.5) * 10 * (0.6 + power * 0.5),
    y,
    vx: (hash(seed, 3) - 0.5) * (1.2 + power * 1.8),
    vy: lift,
    life: 0,
    maxLife: 380 + hash(seed, 4) * 520 + power * 420,
    size: 5 + power * 14 + hash(seed, 5) * 6,
    heat: 0.82 + hash(seed, 6) * 0.18,
    seed,
  });
}

function igniteAt(scene: FireScene, x: number, amount: number) {
  const source = nearestSource(scene, x);
  source.fuel = Math.min(1, source.fuel + amount * 0.22);
  source.burst = Math.min(2.8, source.burst + amount * 0.55);

  const count = Math.floor(8 + amount * 22);
  const seed = performance.now() * 0.02 + x;
  for (let i = 0; i < count; i++) {
    spawnFireParticle(scene, x + (hash(seed, i) - 0.5) * 18, source.baseY - 2, 0.7 + amount * 0.5, seed + i);
  }
}

export function pourGas(
  scene: FireScene,
  x: number,
  y: number,
  _vx: number,
  vy: number,
  strength = 1,
) {
  const now = performance.now();
  const drops = 2 + Math.floor(strength * 2.5);

  for (let i = 0; i < drops; i++) {
    scene.gasParticles.push({
      x: x + (hash(now + i, 1) - 0.5) * 6,
      y: y + i * 5,
      vx: (hash(now + i, 2) - 0.5) * 0.6,
      vy: 2.2 + vy * 0.06 + hash(now + i, 3) * 1.2 + strength * 0.4,
      born: now,
      life: 520 + hash(now + i, 4) * 320,
    });
  }

  if (y >= scene.fireLineY - 48) {
    igniteAt(scene, x, strength * 0.85);
  }
}

function spawnFromSource(scene: FireScene, source: FlameSource, now: number, power: number) {
  const flicker = 0.55 + Math.sin(now * 0.005 + source.phase) * 0.2;
  const rate = Math.floor((3 + power * 14 + source.burst * 10) * flicker);
  const seed = now * 0.01 + source.x;

  for (let i = 0; i < rate; i++) {
    const spread = source.width * (0.35 + power * 0.25);
    const px = source.x + (hash(seed, i) - 0.5) * spread;
    spawnFireParticle(scene, px, source.baseY - hash(seed, i + 1) * 3, power, seed + i);
  }
}

export function updateFireScene(scene: FireScene, now: number) {
  const { sources, particles, gasParticles, fireLineY } = scene;

  for (const source of sources) {
    source.fuel *= 0.992;
    source.burst *= 0.965;
    if (source.fuel < 0.01) source.fuel = 0;
    if (source.burst < 0.02) source.burst = 0;

    const basePower = 0.42 + source.fuel * 0.35;
    const burstPower = source.burst * 1.1;
    spawnFromSource(scene, source, now, basePower + burstPower);
  }

  for (const particle of particles) {
    particle.life += 16;
    const t = particle.life / particle.maxLife;
    const turbulence = Math.sin(now * 0.008 + particle.seed * 3) * (0.08 + t * 0.12);

    particle.x += particle.vx + turbulence * 2.2;
    particle.y += particle.vy;
    particle.vy -= 0.018 * (1 - t * 0.5);
    particle.vx *= 0.985;
    particle.heat = Math.max(0, particle.heat - 0.0045 - t * 0.006);
    particle.size *= 0.9985;
  }

  scene.particles = particles.filter((p) => p.life < p.maxLife && p.heat > 0.02 && p.y > -80);

  scene.gasParticles = gasParticles.filter((gas) => {
    const age = now - gas.born;
    if (age > gas.life) return false;

    gas.x += gas.vx;
    gas.y += gas.vy;
    gas.vy += 0.22;
    gas.vx *= 0.99;

    if (gas.y >= fireLineY - 6) {
      igniteAt(scene, gas.x, 1.1 + gas.vy * 0.08);
      return false;
    }

    return gas.y < scene.height + 30;
  });
}

function drawEmberBed(
  ctx: CanvasRenderingContext2D,
  scene: FireScene,
  palette: FirePalette,
  now: number,
) {
  const { width, fireLineY } = scene;
  const bed = ctx.createLinearGradient(0, fireLineY - 28, 0, fireLineY + 6);
  bed.addColorStop(0, rgba(palette.ember, 0));
  bed.addColorStop(0.45, rgba(palette.ember, 0.35));
  bed.addColorStop(1, rgba([40, 12, 4], 0.55));
  ctx.fillStyle = bed;
  ctx.fillRect(0, fireLineY - 24, width, 30);

  for (const source of scene.sources) {
    const glow = ctx.createRadialGradient(source.x, fireLineY, 0, source.x, fireLineY, source.width * 0.9);
    const pulse = 0.5 + Math.sin(now * 0.006 + source.phase) * 0.2 + source.burst * 0.25;
    glow.addColorStop(0, rgba(palette.core, 0.5 * pulse));
    glow.addColorStop(0.5, rgba(palette.mid, 0.22 * pulse));
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(source.x, fireLineY, source.width * 0.75, 10 + source.burst * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFireParticle(
  ctx: CanvasRenderingContext2D,
  particle: FireParticle,
  palette: FirePalette,
) {
  const t = particle.life / particle.maxLife;
  const heat = particle.heat * (1 - t * 0.35);
  if (heat <= 0.03) return;

  const hot: [number, number, number] = [255, 245, 200];
  let color: [number, number, number];
  if (heat > 0.72) color = lerpRgb(palette.core, hot, (heat - 0.72) / 0.28);
  else if (heat > 0.42) color = lerpRgb(palette.mid, palette.core, (heat - 0.42) / 0.3);
  else if (heat > 0.18) color = lerpRgb(palette.tip, palette.mid, (heat - 0.18) / 0.24);
  else color = lerpRgb(palette.smoke, palette.tip, heat / 0.18);

  const alpha = heat * (t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88) * 0.88;
  const stretch = 1.4 + Math.abs(particle.vy) * 0.12;
  const angle = Math.atan2(particle.vy, particle.vx) + Math.PI / 2;

  const g = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.45, rgba(color, alpha * 0.55));
  g.addColorStop(1, rgba(palette.smoke, 0));

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(
    particle.x,
    particle.y,
    particle.size * 0.55,
    particle.size * stretch,
    angle,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawGasStream(
  ctx: CanvasRenderingContext2D,
  scene: FireScene,
  palette: FirePalette,
  now: number,
) {
  for (const gas of scene.gasParticles) {
    const age = now - gas.born;
    const life = Math.max(0, 1 - age / gas.life);

    const trail = ctx.createLinearGradient(gas.x, gas.y - 14, gas.x, gas.y + 8);
    trail.addColorStop(0, rgba(palette.gas, 0));
    trail.addColorStop(0.35, rgba(palette.gas, life * 0.75));
    trail.addColorStop(1, rgba([255, 200, 60], life * 0.35));
    ctx.strokeStyle = trail;
    ctx.lineWidth = 2.2 + life;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(gas.x, gas.y - 12);
    ctx.lineTo(gas.x + gas.vx, gas.y);
    ctx.stroke();

    const drop = ctx.createRadialGradient(gas.x, gas.y, 0, gas.x, gas.y, 4);
    drop.addColorStop(0, rgba(palette.gas, life * 0.9));
    drop.addColorStop(1, rgba(palette.gas, 0));
    ctx.fillStyle = drop;
    ctx.beginPath();
    ctx.arc(gas.x, gas.y, 2.5 + life, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function renderFireScene(
  ctx: CanvasRenderingContext2D,
  scene: FireScene,
  now: number,
  palette: FirePalette,
) {
  const { width, height, particles } = scene;

  ctx.clearRect(0, 0, width, height);

  const ambient = ctx.createRadialGradient(width * 0.5, height * 0.92, 0, width * 0.5, height * 0.55, width * 0.65);
  ambient.addColorStop(0, rgba(palette.core, 0.1));
  ambient.addColorStop(0.5, rgba(palette.mid, 0.04));
  ambient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ambient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  drawEmberBed(ctx, scene, palette, now);
  drawGasStream(ctx, scene, palette, now);

  const sorted = [...particles].sort((a, b) => a.y - b.y);
  for (const particle of sorted) {
    drawFireParticle(ctx, particle, palette);
  }

  for (const source of scene.sources) {
    if (source.burst < 0.15) continue;
    const flash = ctx.createRadialGradient(
      source.x,
      source.baseY - 20 - source.burst * 40,
      0,
      source.x,
      source.baseY - 10,
      30 + source.burst * 55,
    );
    flash.addColorStop(0, rgba([255, 250, 220], source.burst * 0.35));
    flash.addColorStop(0.4, rgba(palette.core, source.burst * 0.22));
    flash.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = flash;
    ctx.beginPath();
    ctx.ellipse(
      source.x,
      source.baseY - 24 - source.burst * 35,
      12 + source.burst * 22,
      40 + source.burst * 90,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
}
