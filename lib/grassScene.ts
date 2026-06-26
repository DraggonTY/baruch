function hash(seed: number, n: number) {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

function normalizeAngle(angle: number) {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export type GrassPalette = {
  dark: [number, number, number];
  mid: [number, number, number];
  light: [number, number, number];
  tip: [number, number, number];
};

export type GrassScene = {
  width: number;
  height: number;
  count: number;
  groundY: number;
  cellSize: number;
  gridCols: number;
  gridRows: number;
  buckets: number[][];
  baseX: Float32Array;
  baseY: Float32Array;
  restAngle: Float32Array;
  angle: Float32Array;
  angVel: Float32Array;
  length: Float32Array;
  width_: Float32Array;
  shade: Float32Array;
  activity: number;
};

const MAX_BLADES = 5200;
const CELL = 44;

function bladeColor(palette: GrassPalette, shade: number): [number, number, number] {
  if (shade > 0.62) return palette.light;
  if (shade > 0.32) return palette.mid;
  return palette.dark;
}

function bucketIndex(scene: GrassScene, x: number, y: number) {
  const col = Math.floor(x / scene.cellSize);
  const row = Math.floor(y / scene.cellSize);
  if (col < 0 || row < 0 || col >= scene.gridCols || row >= scene.gridRows) return -1;
  return row * scene.gridCols + col;
}

function addToBucket(scene: GrassScene, index: number) {
  const key = bucketIndex(scene, scene.baseX[index], scene.baseY[index]);
  if (key < 0) return;
  scene.buckets[key].push(index);
}

export function createGrassScene(width: number, height: number): GrassScene {
  const groundY = height * 0.9;
  const lawnTop = height * 0.08;
  const area = width * (groundY - lawnTop);
  const spacing = Math.max(9, Math.sqrt(area / MAX_BLADES));
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil((groundY - lawnTop) / spacing);
  const count = Math.min(MAX_BLADES, cols * rows);

  const scene: GrassScene = {
    width,
    height,
    count: 0,
    groundY,
    cellSize: CELL,
    gridCols: Math.ceil(width / CELL),
    gridRows: Math.ceil(height / CELL),
    buckets: [],
    baseX: new Float32Array(count),
    baseY: new Float32Array(count),
    restAngle: new Float32Array(count),
    angle: new Float32Array(count),
    angVel: new Float32Array(count),
    length: new Float32Array(count),
    width_: new Float32Array(count),
    shade: new Float32Array(count),
    activity: 0,
  };

  scene.buckets = Array.from({ length: scene.gridCols * scene.gridRows }, () => []);

  let n = 0;
  for (let row = 0; row < rows && n < count; row++) {
    for (let col = 0; col < cols && n < count; col++) {
      const i = row * cols + col;
      const jitterX = (hash(i, 1) - 0.5) * spacing * 0.9;
      const jitterY = (hash(i, 2) - 0.5) * spacing * 0.35;
      const x = col * spacing + spacing * 0.5 + jitterX;
      const terrain = (hash(i, 3) - 0.5) * spacing * 0.4;
      const y = groundY - row * spacing * 0.92 + jitterY + terrain;

      if (x < 2 || x > width - 2 || y < lawnTop || y > groundY + 2) continue;

      const lean = (hash(i, 4) - 0.5) * 0.75;
      const rest = -Math.PI / 2 + lean;

      scene.baseX[n] = x;
      scene.baseY[n] = y;
      scene.restAngle[n] = rest;
      scene.angle[n] = rest;
      scene.angVel[n] = 0;
      scene.length[n] = 11 + hash(i, 5) * 16;
      scene.width_[n] = 1.1 + hash(i, 6) * 1.4;
      scene.shade[n] = hash(i, 7);
      addToBucket(scene, n);
      n += 1;
    }
  }

  scene.count = n;
  return scene;
}

export function resizeGrassScene(_scene: GrassScene, width: number, height: number): GrassScene {
  return createGrassScene(width, height);
}

export function pushGrassStick(
  scene: GrassScene,
  x: number,
  y: number,
  vx: number,
  vy: number,
  strength = 1,
) {
  const radius = 46;
  const speed = Math.hypot(vx, vy);
  const rake = speed > 0.35 ? Math.atan2(vy, vx) : null;
  const minCol = Math.max(0, Math.floor((x - radius) / scene.cellSize));
  const maxCol = Math.min(scene.gridCols - 1, Math.floor((x + radius) / scene.cellSize));
  const minRow = Math.max(0, Math.floor((y - radius) / scene.cellSize));
  const maxRow = Math.min(scene.gridRows - 1, Math.floor((y + radius) / scene.cellSize));

  scene.activity = Math.min(90, scene.activity + 14);

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const bucket = scene.buckets[row * scene.gridCols + col];
      for (let b = 0; b < bucket.length; b++) {
        const i = bucket[b];
        const dx = scene.baseX[i] - x;
        const dy = scene.baseY[i] - y;
        const d = Math.hypot(dx, dy);
        if (d >= radius) continue;

        const falloff = 1 - d / radius;
        const push = strength * falloff;

        if (rake !== null) {
          const layFlat = rake + Math.PI * 0.5;
          const delta = normalizeAngle(layFlat - scene.angle[i]);
          scene.angVel[i] += delta * push * (0.16 + Math.min(speed * 0.02, 0.35));
        } else if (d > 0.5) {
          const away = Math.atan2(dy, dx);
          const delta = normalizeAngle(away - scene.angle[i]);
          scene.angVel[i] += delta * push * 0.12;
        }
      }
    }
  }
}

export function updateGrassScene(scene: GrassScene, now: number) {
  const { count, baseX, baseY, restAngle, angle, angVel, activity } = scene;
  const windy = activity > 0 || now % 2400 < 1200;

  for (let i = 0; i < count; i++) {
    const av = angVel[i];
    const idle = windy
      ? Math.sin(now * 0.0011 + baseX[i] * 0.028 + baseY[i] * 0.02) * 0.08
      : 0;
    const rest = restAngle[i] + idle;

    if (activity === 0 && Math.abs(av) < 0.004) {
      const delta = normalizeAngle(rest - angle[i]);
      if (Math.abs(delta) < 0.02) continue;
    }

    angle[i] += av;
    angVel[i] += normalizeAngle(rest - angle[i]) * 0.085;
    angVel[i] *= 0.82;
  }

  if (activity > 0) scene.activity -= 1;
}

export function renderGrassScene(
  ctx: CanvasRenderingContext2D,
  scene: GrassScene,
  palette: GrassPalette,
  blend: GlobalCompositeOperation,
) {
  const { width, height, count, groundY, baseX, baseY, angle, length, width_, shade } = scene;

  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, rgba(palette.light, 0.14));
  sky.addColorStop(0.55, rgba(palette.mid, 0.22));
  sky.addColorStop(1, rgba(palette.dark, 0.38));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const soil = ctx.createLinearGradient(0, groundY - height * 0.08, 0, height);
  soil.addColorStop(0, rgba(palette.dark, 0.08));
  soil.addColorStop(1, rgba(palette.dark, 0.28));
  ctx.fillStyle = soil;
  ctx.fillRect(0, groundY - height * 0.06, width, height - groundY + height * 0.06);

  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";

  for (let i = 0; i < count; i++) {
    const bx = baseX[i];
    const by = baseY[i];
    const a = angle[i];
    const len = length[i];
    const w = width_[i];
    const sh = shade[i];

    const tipX = bx + Math.cos(a) * len;
    const tipY = by + Math.sin(a) * len;
    const ctrlX = bx + Math.cos(a + 0.22) * len * 0.55;
    const ctrlY = by + Math.sin(a + 0.22) * len * 0.55;

    const body = bladeColor(palette, sh);
    ctx.strokeStyle = rgba(body, 0.82 + sh * 0.12);
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
    ctx.stroke();

    ctx.strokeStyle = rgba(palette.tip, 0.38 + sh * 0.2);
    ctx.lineWidth = w * 0.45;
    ctx.beginPath();
    ctx.moveTo(ctrlX, ctrlY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
  }

  ctx.restore();
}
