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

const EMPTY = 0;
const WALL = 255;

export type SandPalette = {
  dark: [number, number, number];
  mid: [number, number, number];
  light: [number, number, number];
};

export type SandScene = {
  width: number;
  height: number;
  scale: number;
  cols: number;
  rows: number;
  grid: Uint8Array;
  imageData: ImageData;
  renderCanvas: HTMLCanvasElement;
  renderCtx: CanvasRenderingContext2D;
  colorLut: Uint8ClampedArray;
  wakeRow: number;
  activity: number;
  frame: number;
};

function cellIndex(scene: SandScene, col: number, row: number) {
  if (col < 0 || row < 0 || col >= scene.cols || row >= scene.rows) return -1;
  return row * scene.cols + col;
}

function buildColorLut(palette: SandPalette) {
  const lut = new Uint8ClampedArray(5 * 4);
  for (let shade = 1; shade <= 4; shade++) {
    const t = (shade - 1) / 3;
    let color: [number, number, number];
    if (t < 0.5) color = lerpRgb(palette.dark, palette.mid, t * 2);
    else color = lerpRgb(palette.mid, palette.light, (t - 0.5) * 2);
    const i = shade * 4;
    lut[i] = color[0];
    lut[i + 1] = color[1];
    lut[i + 2] = color[2];
    lut[i + 3] = 250;
  }
  return lut;
}

function setWalls(scene: SandScene) {
  const { cols, rows, grid } = scene;
  for (let col = 0; col < cols; col++) {
    grid[(rows - 1) * cols + col] = WALL;
  }
  for (let row = 0; row < rows; row++) {
    grid[row * cols] = WALL;
    grid[row * cols + cols - 1] = WALL;
  }
}

function seedSand(scene: SandScene) {
  const { cols, rows, grid } = scene;
  const surface = Math.floor(rows * 0.38);

  for (let row = surface; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      const nx = col / cols;
      const ny = (row - surface) / (rows - surface);
      const dune =
        Math.sin(nx * Math.PI * 3.2 + ny * 1.4) * 0.12 +
        Math.sin(nx * Math.PI * 7.5 - ny * 2.1) * 0.06;
      const threshold = 0.18 + ny * 0.55 + dune;
      if (hash(col, row) < threshold) {
        grid[row * cols + col] = 1 + (Math.floor(hash(col, row + 1) * 4) % 4);
      }
    }
  }
}

function settleSand(scene: SandScene, steps: number) {
  scene.wakeRow = 0;
  scene.activity = steps + 8;
  for (let i = 0; i < steps; i++) {
    updateSandScene(scene);
  }
  scene.activity = 0;
  scene.wakeRow = scene.rows - 4;
}

export function createSandScene(width: number, height: number): SandScene {
  const scale = width > 1280 ? 4 : 3;
  const cols = Math.max(80, Math.ceil(width / scale) + 2);
  const rows = Math.max(80, Math.ceil(height / scale) + 2);
  const renderCanvas = document.createElement("canvas");
  renderCanvas.width = cols;
  renderCanvas.height = rows;
  const renderCtx = renderCanvas.getContext("2d");
  if (!renderCtx) throw new Error("Could not create sand render context");

  const scene: SandScene = {
    width,
    height,
    scale,
    cols,
    rows,
    grid: new Uint8Array(cols * rows),
    imageData: renderCtx.createImageData(cols, rows),
    renderCanvas,
    renderCtx,
    colorLut: new Uint8ClampedArray(5 * 4),
    wakeRow: 0,
    activity: 0,
    frame: 0,
  };

  setWalls(scene);
  seedSand(scene);
  settleSand(scene, 120);
  return scene;
}

export function resizeSandScene(_scene: SandScene, width: number, height: number): SandScene {
  return createSandScene(width, height);
}

function wakeAt(scene: SandScene, row: number) {
  scene.wakeRow = Math.max(0, Math.min(scene.wakeRow, row - 2));
  scene.activity = Math.min(120, scene.activity + 24);
}

function stepGrain(scene: SandScene, col: number, row: number, leftFirst: boolean) {
  const { cols, grid } = scene;
  const i = row * cols + col;
  const grain = grid[i];
  if (grain === EMPTY || grain === WALL) return false;

  const below = i + cols;
  if (grid[below] === EMPTY) {
    grid[below] = grain;
    grid[i] = EMPTY;
    wakeAt(scene, row);
    return true;
  }

  const downLeft = below - 1;
  const downRight = below + 1;

  if (leftFirst) {
    if (grid[downLeft] === EMPTY) {
      grid[downLeft] = grain;
      grid[i] = EMPTY;
      wakeAt(scene, row);
      return true;
    }
    if (grid[downRight] === EMPTY) {
      grid[downRight] = grain;
      grid[i] = EMPTY;
      wakeAt(scene, row);
      return true;
    }
  } else {
    if (grid[downRight] === EMPTY) {
      grid[downRight] = grain;
      grid[i] = EMPTY;
      wakeAt(scene, row);
      return true;
    }
    if (grid[downLeft] === EMPTY) {
      grid[downLeft] = grain;
      grid[i] = EMPTY;
      wakeAt(scene, row);
      return true;
    }
  }

  return false;
}

export function pushSandStick(
  scene: SandScene,
  x: number,
  y: number,
  vx: number,
  vy: number,
  strength = 1,
) {
  const { scale, grid } = scene;
  const gx = Math.floor(x / scale);
  const gy = Math.floor(y / scale);
  const radius = Math.min(16, 7 + strength * 2.5);
  const speed = Math.hypot(vx, vy);
  const dirX = speed > 0.4 ? Math.round(vx / speed) : 0;
  const dirY = speed > 0.4 ? Math.round(vy / speed) : 1;
  const push = Math.max(1, Math.round(1 + strength * 0.8 + speed * 0.08));

  wakeAt(scene, gy - radius);

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const col = gx + dx;
      const row = gy + dy;
      const idx = cellIndex(scene, col, row);
      if (idx < 0) continue;

      const dist = Math.hypot(dx, dy);
      if (dist > radius) continue;

      const grain = grid[idx];
      if (grain === EMPTY || grain === WALL) continue;

      grid[idx] = EMPTY;

      const falloff = 1 - dist / radius;
      const throwDist = push + Math.round(falloff * 2);
      const targets = [
        [col + dirX * throwDist, row + dirY * throwDist],
        [col + dirX * throwDist - dirY, row + dirY * throwDist + dirX],
        [col + dirX * throwDist + dirY, row + dirY * throwDist - dirX],
        [col + dirX, row + dirY + 1],
        [col - dirX, row - dirY],
        [col + (hash(idx, 1) > 0.5 ? 1 : -1), row + 1],
        [col, row + 1],
      ];

      let placed = false;
      for (const [tc, tr] of targets) {
        const tIdx = cellIndex(scene, tc, tr);
        if (tIdx < 0) continue;
        if (grid[tIdx] === EMPTY) {
          grid[tIdx] = grain;
          placed = true;
          wakeAt(scene, tr);
          break;
        }
      }

      if (!placed) {
        for (let oy = 0; oy <= 3; oy++) {
          const tIdx = cellIndex(scene, col, row + oy);
          if (tIdx >= 0 && grid[tIdx] === EMPTY) {
            grid[tIdx] = grain;
            wakeAt(scene, row + oy);
            break;
          }
        }
      }
    }
  }
}

export function updateSandScene(scene: SandScene) {
  const { cols, rows } = scene;
  scene.frame += 1;

  if (scene.activity === 0 && scene.wakeRow >= rows - 4) return;

  const startRow = Math.max(0, Math.min(scene.wakeRow, rows - 2));
  const leftFirst = scene.frame % 2 === 0;
  let moved = false;

  for (let row = rows - 2; row >= startRow; row--) {
    if (leftFirst) {
      for (let col = 1; col < cols - 1; col++) {
        if (stepGrain(scene, col, row, true)) moved = true;
      }
    } else {
      for (let col = cols - 2; col >= 1; col--) {
        if (stepGrain(scene, col, row, false)) moved = true;
      }
    }
  }

  if (scene.activity > 0) scene.activity -= 1;

  if (moved) {
    scene.wakeRow = Math.max(0, startRow - 3);
  } else if (scene.wakeRow < rows - 2) {
    scene.wakeRow = Math.min(rows - 2, scene.wakeRow + 2);
  }
}

export function renderSandScene(
  ctx: CanvasRenderingContext2D,
  scene: SandScene,
  palette: SandPalette,
) {
  const { width, height, cols, rows, grid, imageData, renderCtx, renderCanvas } = scene;
  const data = imageData.data;

  scene.colorLut.set(buildColorLut(palette));

  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, rgba(palette.light, 0.22));
  sky.addColorStop(0.45, rgba(palette.mid, 0.28));
  sky.addColorStop(1, rgba(palette.dark, 0.42));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const grain = grid[i];
      const pi = i * 4;

      if (grain >= 1 && grain <= 4) {
        const li = grain * 4;
        data[pi] = scene.colorLut[li];
        data[pi + 1] = scene.colorLut[li + 1];
        data[pi + 2] = scene.colorLut[li + 2];
        data[pi + 3] = scene.colorLut[li + 3];
        continue;
      }

      if (grain === WALL) {
        data[pi] = palette.dark[0] - 18;
        data[pi + 1] = palette.dark[1] - 14;
        data[pi + 2] = palette.dark[2] - 10;
        data[pi + 3] = 255;
        continue;
      }

      data[pi + 3] = 0;
    }
  }

  renderCtx.putImageData(imageData, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(renderCanvas, 0, 0, cols, rows, 0, 0, width, height);
  ctx.restore();
}
