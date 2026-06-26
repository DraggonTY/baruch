export type ThemeMotif =
  | "fire"
  | "water"
  | "trees"
  | "wind"
  | "paper"
  | "space"
  | "sand"
  | "bones"
  | "grass"
  | "circuits"
  | "sun"
  | "abstract";

export type InkPoint = { x: number; y: number; pressure: number };

export type InkStroke = {
  points: InkPoint[];
  born: number;
  seed: number;
  motif: ThemeMotif;
};

export type InkEffect =
  | { kind: "ripple"; x: number; y: number; born: number; maxR: number }
  | { kind: "ember"; x: number; y: number; vx: number; vy: number; born: number; life: number; seed: number }
  | { kind: "spark"; x: number; y: number; vx: number; vy: number; born: number; life: number }
  | { kind: "leaf"; x: number; y: number; angle: number; born: number; life: number; seed: number }
  | { kind: "grain"; x: number; y: number; born: number; life: number; seed: number }
  | { kind: "star"; x: number; y: number; born: number; life: number; size: number }
  | { kind: "ray"; x: number; y: number; angle: number; born: number; life: number; length: number }
  | { kind: "node"; x: number; y: number; born: number; pulse: number };

export function isThemeMotif(value: string): value is ThemeMotif {
  return (
    value === "fire" ||
    value === "water" ||
    value === "trees" ||
    value === "wind" ||
    value === "paper" ||
    value === "space" ||
    value === "sand" ||
    value === "bones" ||
    value === "grass" ||
    value === "circuits" ||
    value === "sun" ||
    value === "abstract"
  );
}

function hash(seed: number, n: number) {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rgba(rgb: string, a: number) {
  return `rgba(${rgb}, ${a})`;
}

function lifeOpacity(age: number, lifetime: number, fade = 1.6) {
  const life = Math.max(0, 1 - age / lifetime);
  return 1 - Math.pow(1 - life, fade);
}

export function spawnThemeInteraction(
  motif: ThemeMotif,
  point: InkPoint,
  speed: number,
  effects: InkEffect[],
  seed: number,
  drawing: boolean,
) {
  const intensity = drawing ? 1 : 0.35;
  if (!drawing && speed < 4 && hash(seed, 0) > 0.15) return;

  switch (motif) {
    case "fire":
      if (hash(seed, 1) < 0.55 * intensity) {
        effects.push({
          kind: "ember",
          x: point.x + (hash(seed, 2) - 0.5) * 10,
          y: point.y + (hash(seed, 3) - 0.5) * 10,
          vx: (hash(seed, 4) - 0.5) * 1.2,
          vy: -1.4 - hash(seed, 5) * 2.2,
          born: performance.now(),
          life: 1800 + hash(seed, 6) * 1400,
          seed,
        });
      }
      if (drawing && speed > 12 && hash(seed, 7) < 0.4) {
        effects.push({
          kind: "spark",
          x: point.x,
          y: point.y,
          vx: (hash(seed, 8) - 0.5) * 6,
          vy: -2 - hash(seed, 9) * 4,
          born: performance.now(),
          life: 600 + hash(seed, 10) * 400,
        });
      }
      break;

    case "water":
      if (hash(seed, 1) < 0.45 * intensity) {
        effects.push({
          kind: "ripple",
          x: point.x,
          y: point.y,
          born: performance.now(),
          maxR: 28 + hash(seed, 2) * 40,
        });
      }
      break;

    case "trees":
      if (drawing && hash(seed, 1) < 0.35) {
        effects.push({
          kind: "leaf",
          x: point.x + (hash(seed, 2) - 0.5) * 16,
          y: point.y + (hash(seed, 3) - 0.5) * 16,
          angle: (hash(seed, 4) - 0.5) * Math.PI,
          born: performance.now(),
          life: 2200 + hash(seed, 5) * 1800,
          seed: seed + 1,
        });
      }
      break;

    case "wind":
      if (speed > 2.5) {
        effects.push({
          kind: "grain",
          x: point.x,
          y: point.y + (hash(seed, 1) - 0.5) * 8,
          born: performance.now(),
          life: 500 + hash(seed, 2) * 400,
          seed,
        });
      }
      break;

    case "paper":
      if (drawing && hash(seed, 1) < 0.25) {
        effects.push({
          kind: "grain",
          x: point.x + (hash(seed, 2) - 0.5) * 6,
          y: point.y + (hash(seed, 3) - 0.5) * 6,
          born: performance.now(),
          life: 3000,
          seed: seed + 2,
        });
      }
      break;

    case "space":
      if (hash(seed, 1) < 0.4 * intensity) {
        effects.push({
          kind: "star",
          x: point.x,
          y: point.y,
          born: performance.now(),
          life: 1400 + hash(seed, 2) * 1200,
          size: 1 + hash(seed, 3) * 2.5,
        });
      }
      if (drawing && speed > 18 && hash(seed, 4) < 0.5) {
        effects.push({
          kind: "spark",
          x: point.x,
          y: point.y,
          vx: Math.cos(hash(seed, 5) * Math.PI * 2) * 8,
          vy: Math.sin(hash(seed, 5) * Math.PI * 2) * 8,
          born: performance.now(),
          life: 700,
        });
      }
      break;

    case "sand":
      for (let i = 0; i < (drawing ? 3 : 1); i++) {
        if (hash(seed, i) < 0.6 * intensity) {
          effects.push({
            kind: "grain",
            x: point.x + (hash(seed, i + 1) - 0.5) * 14,
            y: point.y + (hash(seed, i + 2) - 0.5) * 14,
            born: performance.now(),
            life: 1600 + hash(seed, i + 3) * 800,
            seed: seed + i,
          });
        }
      }
      break;

    case "bones":
      break;

    case "grass":
      if (drawing && hash(seed, 1) < 0.5) {
        effects.push({
          kind: "ray",
          x: point.x,
          y: point.y,
          angle: -Math.PI / 2 + (hash(seed, 2) - 0.5) * 0.6,
          born: performance.now(),
          life: 2000,
          length: 10 + hash(seed, 3) * 18,
        });
      }
      break;

    case "circuits":
      if (drawing && hash(seed, 1) < 0.3) {
        effects.push({
          kind: "node",
          x: Math.round(point.x / 22) * 22,
          y: Math.round(point.y / 22) * 22,
          born: performance.now(),
          pulse: hash(seed, 2),
        });
      }
      break;

    case "sun":
      if (hash(seed, 1) < 0.35 * intensity) {
        effects.push({
          kind: "ray",
          x: point.x,
          y: point.y,
          angle: hash(seed, 2) * Math.PI * 2,
          born: performance.now(),
          life: 900 + hash(seed, 3) * 600,
          length: 16 + hash(seed, 4) * 24,
        });
      }
      break;

    case "abstract":
      if (hash(seed, 1) < 0.35 * intensity) {
        effects.push({
          kind: "node",
          x: point.x,
          y: point.y,
          born: performance.now(),
          pulse: hash(seed, 2),
        });
      }
      break;
  }
}

function drawInkBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  seed: number,
  inkRgb: string,
  bleed = false,
) {
  const jitterX = (hash(seed, 1) - 0.5) * radius * 0.35;
  const jitterY = (hash(seed, 2) - 0.5) * radius * 0.35;
  const rx = radius * (0.82 + hash(seed, 3) * 0.38);
  const ry = radius * (0.72 + hash(seed, 4) * 0.42);
  const rotation = hash(seed, 5) * Math.PI;
  const cx = x + jitterX;
  const cy = y + jitterY;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry) * (bleed ? 1.35 : 1));

  if (bleed) {
    gradient.addColorStop(0, rgba(inkRgb, alpha * 0.12));
    gradient.addColorStop(0.45, rgba(inkRgb, alpha * 0.06));
    gradient.addColorStop(1, rgba(inkRgb, 0));
  } else {
    gradient.addColorStop(0, rgba(inkRgb, alpha * 0.92));
    gradient.addColorStop(0.28, rgba(inkRgb, alpha * 0.72));
    gradient.addColorStop(0.58, rgba(inkRgb, alpha * 0.28));
    gradient.addColorStop(1, rgba(inkRgb, 0));
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
}

function drawFireStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  accentRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  if (points.length < 2) {
    const [p] = points;
    if (!p) return;
    ctx.save();
    ctx.globalCompositeOperation = blend;
    ctx.shadowBlur = 14;
    ctx.shadowColor = rgba(accentRgb, opacity * 0.6);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 + p.pressure * 4, 0, Math.PI * 2);
    ctx.fillStyle = rgba(inkRgb, opacity * 0.9);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 10;
  ctx.shadowColor = rgba(accentRgb, opacity * 0.5);

  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const wobble = (hash(seed + i, pass) - 0.5) * 3;
      ctx.lineTo(p.x + wobble, p.y + wobble * 0.5);
    }
    ctx.strokeStyle = rgba(pass === 0 ? accentRgb : inkRgb, opacity * (pass === 0 ? 0.35 : 0.85));
    ctx.lineWidth = pass === 0 ? 8 : 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawWaterStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points } = stroke;
  if (points.length < 2) {
    const [p] = points;
    if (p) drawInkBlob(ctx, p.x, p.y, 12, opacity * 0.7, stroke.seed, inkRgb, true);
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const pressure = (p0.pressure + p1.pressure) * 0.5;
    const width = 4 + pressure * 14;
    const gradient = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
    gradient.addColorStop(0, rgba(inkRgb, opacity * 0.15));
    gradient.addColorStop(0.5, rgba(inkRgb, opacity * 0.45));
    gradient.addColorStop(1, rgba(inkRgb, opacity * 0.1));
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTreesStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(inkRgb, opacity * 0.85);
  ctx.lineWidth = 2.2;

  if (points.length < 2) {
    const [p] = points;
    if (p) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y - 16);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();

  for (let i = 2; i < points.length; i += 4) {
    const p = points[i];
    const side = hash(seed + i, 1) > 0.5 ? 1 : -1;
    const len = 8 + hash(seed + i, 2) * 14;
    const angle = side * (0.4 + hash(seed + i, 3) * 0.5);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len);
    ctx.strokeStyle = rgba(inkRgb, opacity * 0.55);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();
}

function drawWindStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const angle = Math.atan2(dy, dx);
    const len = Math.hypot(dx, dy);
    const streak = Math.min(len * 1.4, 80);
    const cx = p1.x;
    const cy = p1.y;

    const gradient = ctx.createLinearGradient(
      cx - Math.cos(angle) * streak,
      cy - Math.sin(angle) * streak,
      cx + Math.cos(angle) * streak * 0.2,
      cy + Math.sin(angle) * streak * 0.2,
    );
    gradient.addColorStop(0, rgba(inkRgb, 0));
    gradient.addColorStop(0.35, rgba(inkRgb, opacity * 0.2));
    gradient.addColorStop(1, rgba(inkRgb, opacity * 0.7));

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5 + p1.pressure * 2;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(angle) * streak, cy - Math.sin(angle) * streak);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPaperStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let pass = 0; pass < 3; pass++) {
    ctx.beginPath();
    if (points.length === 1) {
      const [p] = points;
      if (p) ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    } else {
      ctx.moveTo(points[0].x + (hash(seed, pass) - 0.5) * 2, points[0].y + (hash(seed, pass + 1) - 0.5) * 2);
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        ctx.lineTo(p.x + (hash(seed + i, pass) - 0.5) * 2.5, p.y + (hash(seed + i, pass + 2) - 0.5) * 2.5);
      }
    }
    ctx.strokeStyle = rgba(inkRgb, opacity * (0.25 + pass * 0.2));
    ctx.lineWidth = 0.8 + pass * 0.3;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpaceStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  accentRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
    glow.addColorStop(0, rgba(accentRgb, opacity * 0.95));
    glow.addColorStop(0.4, rgba(inkRgb, opacity * 0.5));
    glow.addColorStop(1, rgba(inkRgb, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 + p.pressure * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (points.length > 1) {
    ctx.strokeStyle = rgba(accentRgb, opacity * 0.35);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSandStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    for (let g = 0; g < 6; g++) {
      const gx = p.x + (hash(seed + i, g) - 0.5) * 16;
      const gy = p.y + (hash(seed + i, g + 4) - 0.5) * 10;
      ctx.fillStyle = rgba(inkRgb, opacity * (0.15 + hash(seed + i, g + 8) * 0.35));
      ctx.fillRect(gx, gy, 1.2 + hash(seed + i, g + 9), 1);
    }
  }
  ctx.restore();
}

function drawBonesStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(inkRgb, opacity * 0.8);
  ctx.lineWidth = 2.5;

  for (let i = 0; i < points.length - 1; i += 2) {
    const p0 = points[i];
    const p1 = points[Math.min(i + 2, points.length - 1)];
    const mx = (p0.x + p1.x) / 2 + (hash(seed + i, 1) - 0.5) * 30;
    const my = (p0.y + p1.y) / 2 + (hash(seed + i, 2) - 0.5) * 30;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.quadraticCurveTo(mx, my, p1.x, p1.y);
    ctx.stroke();

    const bulge = 4 + hash(seed + i, 3) * 5;
    ctx.beginPath();
    ctx.ellipse(mx, my, bulge, bulge * 0.6, hash(seed + i, 4) * Math.PI, 0, Math.PI * 2);
    ctx.fillStyle = rgba(inkRgb, opacity * 0.35);
    ctx.fill();
  }
  ctx.restore();
}

function drawGrassStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "round";

  for (const p of points) {
    for (let b = 0; b < 4; b++) {
      const angle = -Math.PI / 2 + (hash(seed + b, 1) - 0.5) * 0.8;
      const len = 10 + hash(seed + b, 2) * 20;
      const bx = p.x + (hash(seed + b, 3) - 0.5) * 10;
      const by = p.y;
      ctx.strokeStyle = rgba(inkRgb, opacity * (0.4 + hash(seed + b, 4) * 0.4));
      ctx.lineWidth = 1 + hash(seed + b, 5);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(
        bx + Math.cos(angle) * len * 0.5 + (hash(seed + b, 6) - 0.5) * 6,
        by + Math.sin(angle) * len * 0.5,
        bx + Math.cos(angle) * len,
        by + Math.sin(angle) * len,
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCircuitsStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  accentRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points } = stroke;
  if (points.length < 2) return;

  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.strokeStyle = rgba(accentRgb, opacity * 0.85);
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6;
  ctx.shadowColor = rgba(accentRgb, opacity * 0.4);

  const grid = 22;
  const snapped = points.map((p) => ({
    x: Math.round(p.x / grid) * grid,
    y: Math.round(p.y / grid) * grid,
  }));

  ctx.beginPath();
  ctx.moveTo(snapped[0].x, snapped[0].y);
  for (let i = 1; i < snapped.length; i++) {
    const prev = snapped[i - 1];
    const curr = snapped[i];
    if (prev.x !== curr.x && prev.y !== curr.y) {
      if (i % 2 === 0) {
        ctx.lineTo(curr.x, prev.y);
      } else {
        ctx.lineTo(prev.x, curr.y);
      }
    }
    ctx.lineTo(curr.x, curr.y);
  }
  ctx.stroke();

  for (const p of snapped) {
    ctx.fillStyle = rgba(inkRgb, opacity * 0.9);
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    ctx.strokeStyle = rgba(accentRgb, opacity * 0.5);
    ctx.strokeRect(p.x - 5, p.y - 5, 10, 10);
  }
  ctx.restore();
}

function drawSunStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  accentRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;

  for (const p of points) {
    const rays = 10;
    for (let r = 0; r < rays; r++) {
      const angle = (r / rays) * Math.PI * 2 + hash(seed + r, 1) * 0.2;
      const len = 8 + p.pressure * 16 + hash(seed + r, 2) * 12;
      const gradient = ctx.createLinearGradient(
        p.x,
        p.y,
        p.x + Math.cos(angle) * len,
        p.y + Math.sin(angle) * len,
      );
      gradient.addColorStop(0, rgba(accentRgb, opacity * 0.7));
      gradient.addColorStop(1, rgba(inkRgb, 0));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len);
      ctx.stroke();
    }

    const corona = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
    corona.addColorStop(0, rgba(accentRgb, opacity * 0.35));
    corona.addColorStop(1, rgba(inkRgb, 0));
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAbstractStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  opacity: number,
  inkRgb: string,
  accentRgb: string,
  blend: GlobalCompositeOperation,
) {
  const { points, seed } = stroke;
  ctx.save();
  ctx.globalCompositeOperation = blend;

  if (points.length < 2) {
    const [p] = points;
    if (p) drawInkBlob(ctx, p.x, p.y, 14, opacity * 0.6, seed, inkRgb);
    ctx.restore();
    return;
  }

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    drawInkBlob(ctx, p.x, p.y, 8 + p.pressure * 6, opacity * 0.5, seed + i, inkRgb, true);
    ctx.fillStyle = rgba(accentRgb, opacity * 0.25);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 + p.pressure * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = rgba(inkRgb, opacity * 0.3);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
  }
  const last = points.at(-1)!;
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

export function drawThemeStroke(
  ctx: CanvasRenderingContext2D,
  stroke: InkStroke,
  life: number,
  inkRgb: string,
  accentRgb: string,
  blend: GlobalCompositeOperation,
) {
  const opacity = 0.94 * life;
  if (opacity <= 0.01) return;

  switch (stroke.motif) {
    case "fire":
      drawFireStroke(ctx, stroke, opacity, inkRgb, accentRgb, blend);
      break;
    case "water":
      drawWaterStroke(ctx, stroke, opacity, inkRgb, blend);
      break;
    case "trees":
      drawTreesStroke(ctx, stroke, opacity, inkRgb, blend);
      break;
    case "wind":
      drawWindStroke(ctx, stroke, opacity, inkRgb, blend);
      break;
    case "paper":
      drawPaperStroke(ctx, stroke, opacity, inkRgb, blend);
      break;
    case "space":
      drawSpaceStroke(ctx, stroke, opacity, inkRgb, accentRgb, blend);
      break;
    case "sand":
      drawSandStroke(ctx, stroke, opacity, inkRgb, blend);
      break;
    case "bones":
      drawBonesStroke(ctx, stroke, opacity, inkRgb, blend);
      break;
    case "grass":
      drawGrassStroke(ctx, stroke, opacity, inkRgb, blend);
      break;
    case "circuits":
      drawCircuitsStroke(ctx, stroke, opacity, inkRgb, accentRgb, blend);
      break;
    case "sun":
      drawSunStroke(ctx, stroke, opacity, inkRgb, accentRgb, blend);
      break;
    default:
      drawAbstractStroke(ctx, stroke, opacity, inkRgb, accentRgb, blend);
      break;
  }
}

export function drawThemeEffects(
  ctx: CanvasRenderingContext2D,
  effects: InkEffect[],
  now: number,
  inkRgb: string,
  accentRgb: string,
  blend: GlobalCompositeOperation,
): InkEffect[] {
  const alive: InkEffect[] = [];

  for (const effect of effects) {
    const age = now - effect.born;

    switch (effect.kind) {
      case "ripple": {
        const life = lifeOpacity(age, 2800);
        if (life <= 0.01) continue;
        const r = (age / 2800) * effect.maxR;
        ctx.save();
        ctx.globalCompositeOperation = blend;
        ctx.strokeStyle = rgba(inkRgb, life * 0.35);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = rgba(accentRgb, life * 0.15);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, r * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        alive.push(effect);
        break;
      }

      case "ember": {
        const life = lifeOpacity(age, effect.life);
        if (life <= 0.01) continue;
        const x = effect.x + effect.vx * (age / 16);
        const y = effect.y + effect.vy * (age / 16);
        const flicker = 0.7 + Math.sin(age * 0.02 + effect.seed) * 0.3;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
        g.addColorStop(0, rgba(accentRgb, life * flicker * 0.9));
        g.addColorStop(1, rgba(inkRgb, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 4 + hash(effect.seed, 1) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        alive.push(effect);
        break;
      }

      case "spark": {
        const life = lifeOpacity(age, effect.life);
        if (life <= 0.01) continue;
        const x = effect.x + effect.vx * (age / 12);
        const y = effect.y + effect.vy * (age / 12);
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = rgba(accentRgb, life * 0.8);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - effect.vx * 2, y - effect.vy * 2);
        ctx.stroke();
        ctx.restore();
        alive.push(effect);
        break;
      }

      case "leaf": {
        const life = lifeOpacity(age, effect.life);
        if (life <= 0.01) continue;
        const fall = age * 0.02;
        const x = effect.x + Math.sin(age * 0.004) * 8;
        const y = effect.y + fall;
        ctx.save();
        ctx.globalCompositeOperation = blend;
        ctx.translate(x, y);
        ctx.rotate(effect.angle + age * 0.002);
        ctx.fillStyle = rgba(inkRgb, life * 0.55);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        alive.push(effect);
        break;
      }

      case "grain": {
        const life = lifeOpacity(age, effect.life);
        if (life <= 0.01) continue;
        const drift = age * 0.04;
        ctx.save();
        ctx.globalCompositeOperation = blend;
        ctx.fillStyle = rgba(inkRgb, life * 0.5);
        ctx.fillRect(effect.x + drift, effect.y + (hash(effect.seed, 1) - 0.5) * drift, 2, 1);
        ctx.restore();
        alive.push(effect);
        break;
      }

      case "star": {
        const life = lifeOpacity(age, effect.life);
        if (life <= 0.01) continue;
        const twinkle = 0.5 + Math.sin(age * 0.015) * 0.5;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = rgba(accentRgb, life * twinkle * 0.9);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        alive.push(effect);
        break;
      }

      case "ray": {
        const life = lifeOpacity(age, effect.life);
        if (life <= 0.01) continue;
        const len = effect.length * life;
        ctx.save();
        ctx.globalCompositeOperation = blend;
        const gradient = ctx.createLinearGradient(
          effect.x,
          effect.y,
          effect.x + Math.cos(effect.angle) * len,
          effect.y + Math.sin(effect.angle) * len,
        );
        gradient.addColorStop(0, rgba(accentRgb, life * 0.5));
        gradient.addColorStop(1, rgba(inkRgb, 0));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(effect.x + Math.cos(effect.angle) * len, effect.y + Math.sin(effect.angle) * len);
        ctx.stroke();
        ctx.restore();
        alive.push(effect);
        break;
      }

      case "node": {
        const life = lifeOpacity(age, 2400);
        if (life <= 0.01) continue;
        const pulse = 0.6 + Math.sin(age * 0.008 + effect.pulse * 10) * 0.4;
        ctx.save();
        ctx.globalCompositeOperation = blend;
        ctx.strokeStyle = rgba(accentRgb, life * pulse * 0.5);
        ctx.lineWidth = 1;
        ctx.strokeRect(effect.x - 6, effect.y - 6, 12, 12);
        ctx.fillStyle = rgba(inkRgb, life * 0.7);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        alive.push(effect);
        break;
      }
    }
  }

  return alive;
}
