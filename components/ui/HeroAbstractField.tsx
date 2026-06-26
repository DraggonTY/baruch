"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { HeroVisualState } from "@/hooks/useHeroThemeMorph";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type RGB = [number, number, number];

type Palette = { colors: [RGB, RGB, RGB]; accent: RGB };

function hash(seed: number, n: number) {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rgba(c: RGB, a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

type HeroAbstractFieldProps = {
  visualStateRef: RefObject<HeroVisualState>;
  patternIndex: number;
};

const HERO_CANVAS_DPR_CAP = 1.5;
const ABSTRACT_FRAME_INTERVAL_MS = 1000 / 30;

type MotifCtx = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  t: number;
  palette: Palette;
  energy: number;
  state: Record<string, unknown>;
};

function drawFire({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const embers = (state.embers as { x: number; y: number; vy: number; size: number; hue: number }[]) ?? [];
  if (!state.embers) {
    state.embers = Array.from({ length: 55 }, (_, i) => ({
      x: hash(i, 1) * width,
      y: height * (0.5 + hash(i, 2) * 0.5),
      vy: 0.4 + hash(i, 3) * 1.2,
      size: 1.5 + hash(i, 4) * 3,
      hue: hash(i, 5),
    }));
  }

  const g = ctx.createLinearGradient(0, height * 0.55, 0, height);
  g.addColorStop(0, "rgba(255,80,20,0)");
  g.addColorStop(0.5, rgba(palette.colors[0], 0.12 * energy));
  g.addColorStop(1, rgba(palette.accent, 0.22 * energy));
  ctx.fillStyle = g;
  ctx.fillRect(0, height * 0.5, width, height * 0.5);

  for (const e of embers) {
    e.y -= e.vy * (1.2 + energy * 0.8);
    e.x += Math.sin(t * 2 + e.hue * 10) * 0.6;
    if (e.y < height * 0.15) {
      e.y = height * (0.85 + hash(e.hue, 6) * 0.15);
      e.x = hash(e.hue + t, 7) * width;
    }
    const a = 0.15 + Math.sin(t * 3 + e.hue * 20) * 0.08;
    const c = e.hue > 0.5 ? palette.colors[2] : palette.colors[0];
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size * (1 + energy * 0.3), 0, Math.PI * 2);
    ctx.fillStyle = rgba(c, a * energy);
    ctx.fill();
  }
}

function drawWater({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const ripples = (state.ripples as { x: number; y: number; r: number; speed: number }[]) ?? [];
  if (!state.ripples) {
    state.ripples = Array.from({ length: 6 }, (_, i) => ({
      x: width * (0.15 + hash(i, 1) * 0.7),
      y: height * (0.2 + hash(i, 2) * 0.6),
      r: 0,
      speed: 0.6 + hash(i, 3) * 0.8,
    }));
  }

  for (let i = 0; i < 5; i++) {
    const y = height * (0.2 + i * 0.15) + Math.sin(t * 0.8 + i) * 12;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const wave = Math.sin(x * 0.008 + t * 1.2 + i) * 18 * energy;
      if (x === 0) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.strokeStyle = rgba(palette.colors[i % 3], 0.06 + i * 0.02);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  for (const rip of ripples) {
    rip.r += rip.speed * (1 + energy * 0.5);
    if (rip.r > Math.min(width, height) * 0.45) {
      rip.r = 0;
      rip.x = width * (0.1 + hash(t + rip.speed, 4) * 0.8);
      rip.y = height * (0.15 + hash(t, 5) * 0.7);
    }
    ctx.beginPath();
    ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(palette.accent, 0.18 * energy * (1 - rip.r / (height * 0.45)));
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

function drawTrees({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const trees = (state.trees as { x: number; h: number; w: number; phase: number }[]) ?? [];
  if (!state.trees) {
    state.trees = Array.from({ length: 9 }, (_, i) => ({
      x: width * (0.05 + i * 0.11),
      h: height * (0.35 + hash(i, 1) * 0.45),
      w: 3 + hash(i, 2) * 5,
      phase: hash(i, 3) * Math.PI * 2,
    }));
  }

  for (const tree of trees) {
    const sway = Math.sin(t * 0.7 + tree.phase) * 14 * energy;
    const x = tree.x + sway;
    const grad = ctx.createLinearGradient(x, height, x, height - tree.h);
    grad.addColorStop(0, rgba(palette.colors[1], 0.2));
    grad.addColorStop(1, rgba(palette.colors[0], 0.02));
    ctx.fillStyle = grad;
    ctx.fillRect(x - tree.w / 2, height - tree.h, tree.w, tree.h);

    for (let b = 0; b < 4; b++) {
      const ly = height - tree.h * (0.3 + b * 0.18) + Math.sin(t + b) * 4;
      const lw = tree.w * (3 + b);
      ctx.beginPath();
      ctx.ellipse(x + sway * 0.3, ly, lw, tree.w * 1.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.colors[2], 0.04 + b * 0.015);
      ctx.fill();
    }
  }

  const leaves = (state.leaves as { x: number; y: number; vx: number; vy: number; rot: number }[]) ?? [];
  if (!state.leaves) {
    state.leaves = Array.from({ length: 18 }, (_, i) => ({
      x: hash(i, 8) * width,
      y: hash(i, 9) * height * 0.5,
      vx: 0.3 + hash(i, 10) * 0.6,
      vy: 0.4 + hash(i, 11) * 0.5,
      rot: hash(i, 12) * Math.PI,
    }));
  }
  for (const leaf of leaves) {
    leaf.x += leaf.vx + Math.sin(t + leaf.rot) * 0.3;
    leaf.y += leaf.vy;
    leaf.rot += 0.01;
    if (leaf.y > height) {
      leaf.y = -10;
      leaf.x = hash(t + leaf.rot, 13) * width;
    }
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rot);
    ctx.fillStyle = rgba(palette.accent, 0.25 * energy);
    ctx.fillRect(-2, -5, 4, 10);
    ctx.restore();
  }
}

function drawWind({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const streaks = (state.streaks as { y: number; x: number; len: number; speed: number }[]) ?? [];
  if (!state.streaks) {
    state.streaks = Array.from({ length: 40 }, (_, i) => ({
      y: hash(i, 1) * height,
      x: hash(i, 2) * width,
      len: 40 + hash(i, 3) * 120,
      speed: 2 + hash(i, 4) * 5,
    }));
  }

  for (const s of streaks) {
    s.x += s.speed * (0.8 + energy * 0.6);
    if (s.x > width + s.len) {
      s.x = -s.len;
      s.y = hash(t + s.speed, 5) * height;
    }
    const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y + Math.sin(t + s.y) * 8);
    grad.addColorStop(0, rgba(palette.colors[0], 0));
    grad.addColorStop(0.4, rgba(palette.accent, 0.12 * energy));
    grad.addColorStop(1, rgba(palette.colors[1], 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1 + hash(s.y, 6);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + s.len, s.y + Math.sin(t * 0.5 + s.y * 0.02) * 12);
    ctx.stroke();
  }
}

function drawPaper({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const fibers = (state.fibers as { x: number; y: number; angle: number; len: number }[]) ?? [];
  if (!state.fibers) {
    state.fibers = Array.from({ length: 35 }, (_, i) => ({
      x: hash(i, 1) * width,
      y: hash(i, 2) * height,
      angle: hash(i, 3) * Math.PI,
      len: 20 + hash(i, 4) * 60,
    }));
  }

  for (const f of fibers) {
    f.x += Math.cos(f.angle) * 0.15;
    f.y += Math.sin(f.angle) * 0.1 + 0.05;
    if (f.x > width + 20) f.x = -20;
    if (f.y > height + 20) f.y = -20;
    ctx.strokeStyle = rgba(palette.colors[1], 0.06 * energy);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.lineTo(f.x + Math.cos(f.angle) * f.len, f.y + Math.sin(f.angle) * f.len);
    ctx.stroke();
  }

  ctx.strokeStyle = rgba(palette.accent, 0.04);
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const y = (height / 8) * i + Math.sin(t * 0.3 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawSpace({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const stars = (state.stars as { x: number; y: number; z: number; twinkle: number }[]) ?? [];
  if (!state.stars) {
    state.stars = Array.from({ length: 140 }, (_, i) => ({
      x: hash(i, 1) * width,
      y: hash(i, 2) * height,
      z: 0.2 + hash(i, 3) * 0.8,
      twinkle: hash(i, 4) * Math.PI * 2,
    }));
  }

  for (const star of stars) {
    const drift = Math.sin(t * 0.15 * star.z + star.twinkle) * 2;
    const size = 0.5 + star.z * 2;
    const a = (0.2 + star.z * 0.5) * (0.7 + Math.sin(t * 2 + star.twinkle) * 0.3) * energy;
    ctx.beginPath();
    ctx.arc(star.x + drift, star.y, size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(palette.colors[2], a);
    ctx.fill();
  }

  const shooters = (state.shooters as { x: number; y: number; life: number }[]) ?? [];
  if (!state.shooters) state.shooters = [];
  if (hash(Math.floor(t * 0.3), 99) > 0.92 && shooters.length < 2) {
    shooters.push({ x: hash(t, 1) * width, y: hash(t, 2) * height * 0.4, life: 1 });
  }
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.life -= 0.02;
    s.x += 8;
    s.y += 3;
    if (s.life <= 0) {
      shooters.splice(i, 1);
      continue;
    }
    const grad = ctx.createLinearGradient(s.x - 80, s.y - 30, s.x, s.y);
    grad.addColorStop(0, rgba(palette.accent, 0));
    grad.addColorStop(1, rgba(palette.accent, 0.6 * s.life * energy));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x - 80, s.y - 30);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  }
}

function drawSand({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const grains = (state.grains as { x: number; y: number; vx: number; size: number }[]) ?? [];
  if (!state.grains) {
    state.grains = Array.from({ length: 80 }, (_, i) => ({
      x: hash(i, 1) * width,
      y: height * (0.55 + hash(i, 2) * 0.45),
      vx: 0.5 + hash(i, 3) * 2,
      size: 0.8 + hash(i, 4) * 1.5,
    }));
  }

  for (let d = 0; d < 4; d++) {
    ctx.beginPath();
    const baseY = height * (0.65 + d * 0.08);
    for (let x = 0; x <= width; x += 6) {
      const y = baseY + Math.sin(x * 0.006 + t * 0.5 + d) * 20;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(palette.colors[d % 3], 0.08 * energy);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (const g of grains) {
    g.x += g.vx * (0.5 + energy * 0.5);
    g.y += Math.sin(t + g.x * 0.01) * 0.2;
    if (g.x > width + 5) {
      g.x = -5;
      g.y = height * (0.55 + hash(t + g.vx, 5) * 0.45);
    }
    ctx.fillStyle = rgba(palette.accent, 0.2 * energy);
    ctx.fillRect(g.x, g.y, g.size, g.size * 0.6);
  }
}

function drawBones({ ctx, width, height, palette, energy, state }: MotifCtx) {
  const arcs = (state.arcs as { x: number; y: number; r: number; rot: number; speed: number }[]) ?? [];
  if (!state.arcs) {
    state.arcs = Array.from({ length: 7 }, (_, i) => ({
      x: width * (0.1 + hash(i, 1) * 0.8),
      y: height * (0.15 + hash(i, 2) * 0.7),
      r: 30 + hash(i, 3) * 70,
      rot: hash(i, 4) * Math.PI,
      speed: 0.1 + hash(i, 5) * 0.15,
    }));
  }

  for (const arc of arcs) {
    arc.rot += arc.speed * 0.02 * (1 + energy);
    ctx.save();
    ctx.translate(arc.x, arc.y);
    ctx.rotate(arc.rot);
    ctx.beginPath();
    ctx.arc(0, 0, arc.r, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = rgba(palette.colors[1], 0.1 * energy);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, arc.r * 0.55, 0.4, Math.PI - 0.4);
    ctx.strokeStyle = rgba(palette.accent, 0.06 * energy);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function drawGrass({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const blades = (state.blades as { x: number; h: number; phase: number }[]) ?? [];
  if (!state.blades) {
    state.blades = Array.from({ length: 90 }, (_, i) => ({
      x: (i / 90) * width,
      h: 25 + hash(i, 1) * 55,
      phase: hash(i, 2) * Math.PI * 2,
    }));
  }

  for (const blade of blades) {
    const sway = Math.sin(t * 1.5 + blade.phase) * 12 * energy;
    const x = blade.x;
    const tipX = x + sway;
    const grad = ctx.createLinearGradient(x, height, tipX, height - blade.h);
    grad.addColorStop(0, rgba(palette.colors[0], 0.25));
    grad.addColorStop(1, rgba(palette.colors[2], 0.02));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.quadraticCurveTo(x + sway * 0.5, height - blade.h * 0.5, tipX, height - blade.h);
    ctx.stroke();
  }
}

function drawCircuits({ ctx, width, height, palette, energy, state }: MotifCtx) {
  const grid = 32;
  ctx.strokeStyle = rgba(palette.colors[0], 0.06 * energy);
  ctx.lineWidth = 0.5;
  for (let x = 0; x < width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const pulses = (state.pulses as { path: number; progress: number; speed: number }[]) ?? [];
  if (!state.pulses) {
    state.pulses = Array.from({ length: 8 }, (_, i) => ({
      path: i,
      progress: hash(i, 1),
      speed: 0.003 + hash(i, 2) * 0.006,
    }));
  }

  for (const p of pulses) {
    p.progress = (p.progress + p.speed * (1 + energy)) % 1;
    const horizontal = p.path % 2 === 0;
    const lane = Math.floor(p.path / 2);
    let x: number, y: number;
    if (horizontal) {
      x = p.progress * width;
      y = (lane + 1) * grid * 3;
    } else {
      x = (lane + 1) * grid * 4;
      y = p.progress * height;
    }
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
    glow.addColorStop(0, rgba(palette.accent, 0.5 * energy));
    glow.addColorStop(1, rgba(palette.accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(x - 12, y - 12, 24, 24);
  }
}

function drawSun({ ctx, width, height, t, palette, energy }: MotifCtx) {
  const cx = width * 0.5;
  const cy = height * 0.32;
  const rays = 24;

  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + t * 0.08;
    const len = Math.min(width, height) * (0.25 + Math.sin(t * 0.5 + i) * 0.05);
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len;
    const grad = ctx.createLinearGradient(cx, cy, x2, y2);
    grad.addColorStop(0, rgba(palette.colors[0], 0.15 * energy));
    grad.addColorStop(1, rgba(palette.colors[1], 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2 + Math.sin(t + i) * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.2);
  corona.addColorStop(0, rgba(palette.accent, 0.2 * energy));
  corona.addColorStop(0.5, rgba(palette.colors[0], 0.08 * energy));
  corona.addColorStop(1, rgba(palette.colors[1], 0));
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(width, height) * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawAbstract({ ctx, width, height, t, palette, energy, state }: MotifCtx) {
  const orbs = (state.orbs as { x: number; y: number; r: number; vx: number; vy: number; ci: number }[]) ?? [];
  if (!state.orbs) {
    state.orbs = Array.from({ length: 12 }, (_, i) => ({
      x: hash(i, 1) * width,
      y: hash(i, 2) * height,
      r: 30 + hash(i, 3) * 80,
      vx: (hash(i, 4) - 0.5) * 0.8,
      vy: (hash(i, 5) - 0.5) * 0.8,
      ci: i % 3,
    }));
  }

  for (const orb of orbs) {
    orb.x += orb.vx * (1 + energy);
    orb.y += orb.vy * (1 + energy);
    if (orb.x < -orb.r) orb.x = width + orb.r;
    if (orb.x > width + orb.r) orb.x = -orb.r;
    if (orb.y < -orb.r) orb.y = height + orb.r;
    if (orb.y > height + orb.r) orb.y = -orb.r;

    const c = palette.colors[orb.ci];
    const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
    g.addColorStop(0, rgba(c, 0.14 * energy));
    g.addColorStop(0.6, rgba(c, 0.04 * energy));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r * (1 + Math.sin(t + orb.ci) * 0.1), 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < orbs.length; i++) {
    for (let j = i + 1; j < orbs.length; j++) {
      const a = orbs[i];
      const b = orbs[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 200) {
        ctx.strokeStyle = rgba(palette.accent, 0.06 * energy * (1 - dist / 200));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

const MOTIF_RENDERERS: Record<string, (ctx: MotifCtx) => void> = {
  fire: drawFire,
  water: drawWater,
  trees: drawTrees,
  wind: drawWind,
  paper: drawPaper,
  space: drawSpace,
  sand: drawSand,
  bones: drawBones,
  grass: drawGrass,
  circuits: drawCircuits,
  sun: drawSun,
  abstract: drawAbstract,
};

const MOTIF_BLEND: Record<string, string> = {
  fire: "screen",
  water: "soft-light",
  trees: "multiply",
  wind: "multiply",
  paper: "multiply",
  space: "screen",
  sand: "multiply",
  bones: "soft-light",
  grass: "multiply",
  circuits: "screen",
  sun: "multiply",
  abstract: "overlay",
};

export function HeroAbstractField({ visualStateRef, patternIndex }: HeroAbstractFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const motifStateRef = useRef<{ motif: string; state: Record<string, unknown> }>({
    motif: "paper",
    state: {},
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;
    let isPageVisible = document.visibilityState === "visible";
    let lastDrawAt = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      dpr = Math.min(window.devicePixelRatio || 1, HERO_CANVAS_DPR_CAP);
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const shouldAnimate = () => isVisible && isPageVisible && width > 0 && height > 0;
    const queueFrame = () => {
      if (frameRef.current || !shouldAnimate()) return;
      frameRef.current = requestAnimationFrame(render);
    };
    const stopFrame = () => {
      if (!frameRef.current) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        if (shouldAnimate()) {
          queueFrame();
        } else {
          stopFrame();
        }
      },
      { rootMargin: "200px 0px" },
    );
    visibilityObserver.observe(canvas);

    const onVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (shouldAnimate()) {
        queueFrame();
      } else {
        stopFrame();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const render = (now: number) => {
      frameRef.current = 0;
      if (!shouldAnimate()) return;

      if (now - lastDrawAt < ABSTRACT_FRAME_INTERVAL_MS) {
        queueFrame();
        return;
      }
      lastDrawAt = now;

      const visual = visualStateRef.current;
      if (!visual) {
        queueFrame();
        return;
      }

      const t = now / 1000;
      const { colors, accent, motif, morphPulse } = visual.abstract;
      const energy = 0.65 + morphPulse * 0.55;

      if (motifStateRef.current.motif !== motif) {
        motifStateRef.current = { motif, state: {} };
      }

      const draw = MOTIF_RENDERERS[motif] ?? MOTIF_RENDERERS.abstract;
      canvas.style.mixBlendMode = MOTIF_BLEND[motif] ?? "soft-light";

      ctx.clearRect(0, 0, width, height);
      draw({
        ctx,
        width,
        height,
        t,
        palette: { colors, accent },
        energy,
        state: motifStateRef.current.state,
      });

      queueFrame();
    };

    queueFrame();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver.disconnect();
      stopFrame();
    };
  }, [patternIndex, prefersReducedMotion, visualStateRef]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="hero-abstract-canvas pointer-events-none absolute inset-0 z-[3] touch-none"
      aria-hidden="true"
    />
  );
}
