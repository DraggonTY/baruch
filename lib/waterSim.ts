function hash(seed: number, n: number) {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

export type WaterDroplet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
};

export type WaterSim = {
  cols: number;
  rows: number;
  scale: number;
  damping: number;
  buffer1: Float32Array;
  buffer2: Float32Array;
  renderCanvas: HTMLCanvasElement;
  renderCtx: CanvasRenderingContext2D;
  imageData: ImageData;
  rowDepth: Uint8Array;
  colAmbient: Float32Array;
  rowAmbient: Float32Array;
  droplets: WaterDroplet[];
  ambientPhase: number;
  activity: number;
  frame: number;
};

export function createWaterSim(width: number, height: number): WaterSim {
  const scale = width > 1280 ? 6 : width > 760 ? 5 : 4;
  const cols = Math.max(48, Math.ceil(width / scale) + 2);
  const rows = Math.max(48, Math.ceil(height / scale) + 2);
  const renderCanvas = document.createElement("canvas");
  renderCanvas.width = cols;
  renderCanvas.height = rows;
  const renderCtx = renderCanvas.getContext("2d");
  if (!renderCtx) throw new Error("Could not create water render context");

  const sim: WaterSim = {
    cols,
    rows,
    scale,
    damping: 0.982,
    buffer1: new Float32Array(cols * rows),
    buffer2: new Float32Array(cols * rows),
    renderCanvas,
    renderCtx,
    imageData: renderCtx.createImageData(cols, rows),
    rowDepth: new Uint8Array(rows * 3),
    colAmbient: new Float32Array(cols),
    rowAmbient: new Float32Array(rows),
    droplets: [],
    ambientPhase: 0,
    activity: 0,
    frame: 0,
  };

  seedAmbientRipples(sim);
  return sim;
}

export function resetWaterSim(sim: WaterSim) {
  sim.buffer1.fill(0);
  sim.buffer2.fill(0);
  sim.droplets = [];
  seedAmbientRipples(sim);
}

function seedAmbientRipples(sim: WaterSim) {
  const { cols, rows, buffer1 } = sim;
  const spots = [
    [cols * 0.2, rows * 0.3, 8],
    [cols * 0.75, rows * 0.25, 7],
    [cols * 0.5, rows * 0.7, 9],
    [cols * 0.85, rows * 0.65, 6],
  ];
  for (const [cx, cy, amp] of spots) {
    for (let dy = -12; dy <= 12; dy++) {
      for (let dx = -12; dx <= 12; dx++) {
        const px = Math.floor(cx + dx);
        const py = Math.floor(cy + dy);
        if (px <= 0 || py <= 0 || px >= cols - 1 || py >= rows - 1) continue;
        const d = Math.hypot(dx, dy);
        if (d > 12) continue;
        const i = py * cols + px;
        buffer1[i] += Math.cos(d * 0.45) * amp * 0.04 * (1 - d / 12);
      }
    }
  }
}

export function resizeWaterSim(_sim: WaterSim, width: number, height: number): WaterSim {
  return createWaterSim(width, height);
}

function spawnSplash(sim: WaterSim, x: number, y: number, vx: number, vy: number, strength: number) {
  const speed = Math.hypot(vx, vy);
  if (speed < 2 && strength < 2) return;

  const count = Math.min(10, Math.floor(3 + speed * 0.45 + strength * 1.5));
  const now = performance.now();

  for (let i = 0; i < count; i++) {
    const angle = Math.atan2(vy, vx) + (hash(now + i, 1) - 0.5) * 1.4;
    const spd = 1.5 + hash(now + i, 2) * (3 + speed * 0.25);
    sim.droplets.push({
      x: x + (hash(now + i, 3) - 0.5) * 12,
      y: y + (hash(now + i, 4) - 0.5) * 12,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 1.2 - hash(now + i, 5) * 2,
      born: now,
      life: 500 + hash(now + i, 6) * 700,
      size: 1.5 + hash(now + i, 7) * 3.5,
    });
  }

  if (sim.droplets.length > 48) {
    sim.droplets.splice(0, sim.droplets.length - 48);
  }
}

export function disturbWater(
  sim: WaterSim,
  x: number,
  y: number,
  vx: number,
  vy: number,
  strength: number,
) {
  const gx = Math.floor(x / sim.scale);
  const gy = Math.floor(y / sim.scale);
  const speed = Math.hypot(vx, vy);
  const radius = Math.min(20, 7 + speed * 0.32 + strength * 1.6);
  const cols = sim.cols;
  const rows = sim.rows;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const px = gx + dx;
      const py = gy + dy;
      if (px <= 0 || py <= 0 || px >= cols - 1 || py >= rows - 1) continue;

      const dist = Math.hypot(dx, dy);
      if (dist > radius) continue;

      const falloff = 1 - dist / radius;
      let push = strength * falloff * falloff;

      if (speed > 1) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        const dir = (vx * nx + vy * ny) / (speed || 1);
        const wake = Math.max(0, dir) * falloff * strength * 0.35;
        push += wake;
        const perpX = -ny;
        const perpY = nx;
        const i = py * cols + px;
        sim.buffer1[i] += (perpX * vx + perpY * vy) * 0.015 * falloff;
      }

      const i = py * cols + px;
      sim.buffer1[i] += push;
    }
  }

  sim.activity = Math.min(90, sim.activity + Math.ceil(strength * 4 + speed * 0.5));

  if (strength > 1.2 || speed > 5) {
    spawnSplash(sim, x, y, vx, vy, strength);
  }
}

export function stepWater(sim: WaterSim, now: number) {
  const { cols, rows, damping } = sim;
  const w = cols;

  sim.ambientPhase = now * 0.00035;
  if (sim.activity > 0) sim.activity -= 1;

  const stepCount = 1;
  let src = sim.buffer1;
  let dst = sim.buffer2;

  for (let step = 0; step < stepCount; step++) {
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const i = y * w + x;
        dst[i] = (src[i - 1] + src[i + 1] + src[i - w] + src[i + w]) / 2 - dst[i];
        dst[i] *= damping;
      }
    }

    for (let x = 0; x < cols; x++) {
      dst[x] = 0;
      dst[(rows - 1) * w + x] = 0;
    }
    for (let y = 0; y < rows; y++) {
      dst[y * w] = 0;
      dst[y * w + cols - 1] = 0;
    }

    const next = src;
    src = dst;
    dst = next;
  }

  sim.buffer1 = src;
  sim.buffer2 = dst;

  sim.droplets = sim.droplets.filter((d) => {
    const age = now - d.born;
    if (age > d.life) return false;
    d.vy += 0.12;
    d.x += d.vx;
    d.y += d.vy;
    d.vx *= 0.98;
    return d.y < rows * sim.scale + 40;
  });
}

export type WaterPalette = {
  deep: [number, number, number];
  mid: [number, number, number];
  highlight: [number, number, number];
};

function drawWaterBody(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: WaterPalette,
  now: number,
) {
  const body = ctx.createLinearGradient(0, 0, 0, height);
  body.addColorStop(0, rgba(palette.mid, 0.42));
  body.addColorStop(0.4, rgba(palette.mid, 0.5));
  body.addColorStop(0.72, rgba(palette.deep, 0.62));
  body.addColorStop(1, rgba(palette.deep, 0.74));
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  const causticCount = 2;
  for (let c = 0; c < causticCount; c++) {
    const phase = now * 0.0004 + c * 1.7;
    const cx = width * (0.22 + c * 0.26) + Math.sin(phase) * 34;
    const cy = height * (0.35 + (c % 3) * 0.18) + Math.cos(phase * 1.3) * 30;
    const r = 96 + c * 44;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(palette.mid, 0.05));
    g.addColorStop(0.45, rgba(palette.deep, 0.03));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.2, r * 0.7, phase * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.strokeStyle = rgba(palette.deep, 0.05);
  ctx.lineWidth = 1;
  for (let y = height * 0.15; y < height; y += 72) {
    const wave = Math.sin(y * 0.02 + now * 0.001) * 6;
    ctx.beginPath();
    ctx.moveTo(0, y + wave);
    for (let x = 0; x <= width; x += 64) {
      ctx.lineTo(x, y + Math.sin(x * 0.008 + now * 0.0012 + y * 0.01) * 5 + wave);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawDroplets(
  ctx: CanvasRenderingContext2D,
  sim: WaterSim,
  now: number,
  palette: WaterPalette,
) {
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = rgba(palette.highlight, 0.35);

  for (const d of sim.droplets) {
    const age = now - d.born;
    const life = Math.max(0, 1 - age / d.life);
    if (life <= 0) continue;

    ctx.globalAlpha = life * 0.55;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size * life, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function renderWater(
  sim: WaterSim,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: WaterPalette,
  now: number,
) {
  const { cols, rows, renderCtx, renderCanvas, imageData } = sim;
  const data = imageData.data;
  const buf = sim.buffer1;
  const w = cols;
  const phase = sim.ambientPhase;
  const mid = palette.mid;
  const deep = palette.deep;
  sim.frame += 1;

  ctx.clearRect(0, 0, width, height);
  drawWaterBody(ctx, width, height, palette, now);

  for (let x = 0; x < cols; x++) {
    sim.colAmbient[x] = Math.sin(x * 0.08 + phase);
  }
  for (let y = 0; y < rows; y++) {
    sim.rowAmbient[y] = Math.cos(y * 0.07 + phase * 1.2) * 0.03;
    const depth = Math.min(1, (y / rows) * 0.88 + 0.12);
    const row = y * 3;
    sim.rowDepth[row] = Math.round(mid[0] + (deep[0] - mid[0]) * depth);
    sim.rowDepth[row + 1] = Math.round(mid[1] + (deep[1] - mid[1]) * depth);
    sim.rowDepth[row + 2] = Math.round(mid[2] + (deep[2] - mid[2]) * depth);
  }

  for (let y = 0; y < rows; y++) {
    const row = y * 3;
    const baseR = sim.rowDepth[row];
    const baseG = sim.rowDepth[row + 1];
    const baseB = sim.rowDepth[row + 2];
    const ambientY = sim.rowAmbient[y];
    const rowOffset = y * w;

    for (let x = 0; x < cols; x++) {
      const i = rowOffset + x;
      const h = buf[i];
      const ambient = sim.colAmbient[x] * ambientY;

      let nx = 0;
      let ny = 0;
      if (x > 0 && x < cols - 1 && y > 0 && y < rows - 1) {
        nx = buf[i + 1] - buf[i - 1];
        ny = buf[i + w] - buf[i - w];
      }

      const slope = nx * nx + ny * ny;
      const spec = Math.max(0, (h + ambient) * 2.4 - slope * 0.42);

      const refract = 0.12;
      const r = baseR + nx * 22 * refract + spec * 18;
      const g = baseG + ny * 18 * refract + spec * 16;
      const b = baseB + (nx + ny) * 10 * refract + spec * 14;

      const foam = slope > 0.38 && h > 0.08 ? Math.min(0.55, slope * 0.75) : 0;

      const pi = i * 4;
      data[pi] = r + foam * 22 > 255 ? 255 : r + foam * 22;
      data[pi + 1] = g + foam * 28 > 255 ? 255 : g + foam * 28;
      data[pi + 2] = b + foam * 35 > 255 ? 255 : b + foam * 35;
      const alpha = 48 + Math.abs(h + ambient) * 72 + spec * 32 + foam * 18;
      data[pi + 3] = alpha > 210 ? 210 : alpha;
    }
  }

  renderCtx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(renderCanvas, 0, 0, cols, rows, 0, 0, width, height);
  ctx.restore();

  if (sim.activity > 0 || sim.frame % 2 === 0) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = rgba(palette.highlight, 0.2);
    let highlights = 0;
    const highlightCap = 48;

    for (let y = 2; y < rows - 2; y += 4) {
      for (let x = 2; x < cols - 2; x += 4) {
        if (highlights >= highlightCap) break;
        const i = y * w + x;
        const h = buf[i];
        if (Math.abs(h) < 0.12) continue;

        const nx = buf[i + 1] - buf[i - 1];
        const ny = buf[i + w] - buf[i - w];
        const spec = Math.abs(h) * 2.2 + (nx * nx + ny * ny) * 0.35;
        if (spec <= 0.55) continue;

        const px = (x + 0.5) * sim.scale;
        const py = (y + 0.5) * sim.scale;
        const size = 2 + Math.min(spec, 1) * 8;
        ctx.globalAlpha = Math.min(0.28, spec * 0.18);
        ctx.fillRect(px - size * 0.5, py - size * 0.35, size, size * 0.7);
        highlights += 1;
      }
      if (highlights >= highlightCap) break;
    }
    ctx.restore();
  }

  drawDroplets(ctx, sim, now, palette);
}
