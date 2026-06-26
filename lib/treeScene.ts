function hash(seed: number, n: number) {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export type Tree = {
  x: number;
  baseY: number;
  height: number;
  trunkW: number;
  phase: number;
  seed: number;
  shakeAmp: number;
  shakePhase: number;
};

export type FallingLeaf = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  born: number;
  life: number;
  tint: number;
  size: number;
};

export type TreePalette = {
  trunk: [number, number, number];
  foliage: [number, number, number];
  foliageLight: [number, number, number];
  leaf: [number, number, number];
};

export type TreeScene = {
  width: number;
  height: number;
  trees: Tree[];
  leaves: FallingLeaf[];
};

export function createTreeScene(width: number, height: number): TreeScene {
  const count = Math.max(5, Math.min(11, Math.floor(width / 160)));
  const trees: Tree[] = [];

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    trees.push({
      x: width * (0.05 + t * 0.9) + (hash(i, 1) - 0.5) * width * 0.04,
      baseY: height * (0.9 + hash(i, 2) * 0.06),
      height: height * (0.32 + hash(i, 3) * 0.38),
      trunkW: 10 + hash(i, 4) * 14,
      phase: hash(i, 5) * Math.PI * 2,
      seed: i * 19.7 + 3,
      shakeAmp: 0,
      shakePhase: 0,
    });
  }

  return { width, height, trees, leaves: [] };
}

export function resizeTreeScene(_scene: TreeScene, width: number, height: number): TreeScene {
  return createTreeScene(width, height);
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function findTreeAt(scene: TreeScene, px: number, py: number): number {
  let best = -1;
  let bestDist = Infinity;

  for (let i = 0; i < scene.trees.length; i++) {
    const tree = scene.trees[i];
    const crownY = tree.baseY - tree.height * 0.58;
    const crownRx = tree.height * 0.38;
    const crownRy = tree.height * 0.28;
    const trunkTop = tree.baseY - tree.height * 0.72;

    const inTrunk =
      px >= tree.x - tree.trunkW * 0.7 &&
      px <= tree.x + tree.trunkW * 0.7 &&
      py >= trunkTop &&
      py <= tree.baseY + 8;

    const dx = (px - tree.x) / crownRx;
    const dy = (py - crownY) / crownRy;
    const inCrown = dx * dx + dy * dy <= 1.15;

    if (inTrunk || inCrown) {
      const d = Math.hypot(px - tree.x, py - crownY);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
  }

  return best;
}

export function shakeTree(scene: TreeScene, index: number, strength = 1) {
  const tree = scene.trees[index];
  if (!tree) return;

  tree.shakeAmp = Math.min(32, tree.shakeAmp + 14 * strength);
  tree.shakePhase = performance.now() * 0.018;

  const crownY = tree.baseY - tree.height * 0.58;
  const leafCount = Math.floor(10 + strength * 14);

  for (let i = 0; i < leafCount; i++) {
    const s = tree.seed + scene.leaves.length + i;
    scene.leaves.push({
      x: tree.x + (hash(s, 1) - 0.5) * tree.height * 0.55,
      y: crownY + (hash(s, 2) - 0.5) * tree.height * 0.35,
      vx: (hash(s, 3) - 0.5) * 2.8 + tree.shakeAmp * 0.06,
      vy: 0.4 + hash(s, 4) * 1.2,
      rot: hash(s, 5) * Math.PI * 2,
      rotSpeed: (hash(s, 6) - 0.5) * 0.1,
      born: performance.now(),
      life: 3200 + hash(s, 7) * 2800,
      tint: hash(s, 8),
      size: 3.5 + hash(s, 9) * 5,
    });
  }
}

function treeSway(tree: Tree, now: number) {
  const idle = Math.sin(now * 0.0009 + tree.phase) * 4;
  const shake =
    tree.shakeAmp > 0.2 ? Math.sin(now * 0.028 + tree.shakePhase) * tree.shakeAmp : 0;
  return idle + shake;
}

export function updateTreeScene(scene: TreeScene, now: number) {
  for (const tree of scene.trees) {
    tree.shakeAmp *= 0.94;
    if (tree.shakeAmp < 0.15) tree.shakeAmp = 0;
  }

  scene.leaves = scene.leaves.filter((leaf) => {
    const age = now - leaf.born;
    if (age > leaf.life || leaf.y > scene.height + 40) return false;

    leaf.vy += 0.035;
    leaf.vx += Math.sin(age * 0.004 + leaf.rot) * 0.025;
    leaf.x += leaf.vx;
    leaf.y += leaf.vy;
    leaf.rot += leaf.rotSpeed;
    return true;
  });

  if (scene.leaves.length > 180) {
    scene.leaves.splice(0, scene.leaves.length - 180);
  }
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  tree: Tree,
  now: number,
  palette: TreePalette,
  blend: GlobalCompositeOperation,
  dissolve = 0,
) {
  const sway = treeSway(tree, now);
  const lift = dissolve * (36 + tree.height * 0.08);
  const x = tree.x + sway;
  const baseY = tree.baseY - lift;
  const trunkTop = baseY - tree.height * 0.72;
  const treeFade = 1 - dissolve * (0.25 + (1 - tree.baseY / (ctx.canvas.height || 1)) * 0.75);

  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.globalAlpha *= Math.max(0, treeFade);

  const trunkGrad = ctx.createLinearGradient(x - tree.trunkW, baseY, x + tree.trunkW, trunkTop);
  trunkGrad.addColorStop(0, rgba(palette.trunk, 0.95));
  trunkGrad.addColorStop(0.55, rgba(lerpRgb(palette.trunk, palette.foliage, 0.15), 0.85));
  trunkGrad.addColorStop(1, rgba(lerpRgb(palette.trunk, palette.foliage, 0.25), 0.7));

  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - tree.trunkW * 0.45, baseY);
  ctx.lineTo(x - tree.trunkW * 0.28 + sway * 0.15, trunkTop);
  ctx.lineTo(x + tree.trunkW * 0.28 + sway * 0.15, trunkTop);
  ctx.lineTo(x + tree.trunkW * 0.45, baseY);
  ctx.closePath();
  ctx.fill();

  const layers = 5;
  for (let b = 0; b < layers; b++) {
    const t = b / (layers - 1);
    const ly = baseY - tree.height * (0.32 + t * 0.42);
    const lw = tree.height * (0.2 + t * 0.12);
    const lh = lw * 0.62;
    const layerSway = sway * (0.35 + t * 0.45);
    const color = lerpRgb(palette.foliage, palette.foliageLight, t * 0.65 + 0.15);

    ctx.beginPath();
    ctx.ellipse(x + layerSway, ly, lw, lh, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, 0.72 - t * 0.1);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + layerSway - lw * 0.2, ly - lh * 0.15, lw * 0.55, lh * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(palette.foliageLight, 0.18);
    ctx.fill();
  }

  ctx.restore();
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  leaf: FallingLeaf,
  now: number,
  palette: TreePalette,
  blend: GlobalCompositeOperation,
  dissolve = 0,
) {
  const age = now - leaf.born;
  const life = Math.max(0, 1 - age / leaf.life);
  const fade = (1 - Math.pow(1 - life, 1.4)) * (1 - dissolve * 1.15);
  if (fade <= 0.01) return;

  const color = lerpRgb(palette.leaf, palette.foliageLight, leaf.tint);
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.translate(leaf.x, leaf.y);
  ctx.rotate(leaf.rot);
  ctx.fillStyle = rgba(color, fade * 0.85);
  ctx.beginPath();
  ctx.ellipse(0, 0, leaf.size, leaf.size * 0.55, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(lerpRgb(palette.trunk, palette.leaf, 0.3), fade * 0.4);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -leaf.size * 0.5);
  ctx.lineTo(0, leaf.size * 0.5);
  ctx.stroke();
  ctx.restore();
}

export function renderTreeScene(
  ctx: CanvasRenderingContext2D,
  scene: TreeScene,
  now: number,
  palette: TreePalette,
  blend: GlobalCompositeOperation,
  dissolve = 0,
) {
  ctx.clearRect(0, 0, scene.width, scene.height);

  const sorted = scene.trees
    .map((tree, index) => ({ tree, index }))
    .sort((a, b) => a.tree.x - b.tree.x);

  for (const { tree } of sorted) {
    drawTree(ctx, tree, now, palette, blend, dissolve);
  }

  for (const leaf of scene.leaves) {
    drawLeaf(ctx, leaf, now, palette, blend, dissolve);
  }
}

export function shakeNearestTree(scene: TreeScene, px: number, py: number, strength = 1): boolean {
  const index = findTreeAt(scene, px, py);
  if (index >= 0) {
    shakeTree(scene, index, strength);
    return true;
  }

  let nearest = -1;
  let nearestDist = Infinity;
  for (let i = 0; i < scene.trees.length; i++) {
    const tree = scene.trees[i];
    const crownY = tree.baseY - tree.height * 0.58;
    const d = Math.hypot(px - tree.x, py - crownY);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = i;
    }
  }

  if (nearest >= 0 && nearestDist < scene.height * 0.35) {
    shakeTree(scene, nearest, strength * 0.75);
    return true;
  }

  return false;
}
