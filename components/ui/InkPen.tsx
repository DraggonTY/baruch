"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { HeroVisualState } from "@/hooks/useHeroThemeMorph";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  createWaterSim,
  disturbWater,
  renderWater,
  resetWaterSim,
  resizeWaterSim,
  stepWater,
  type WaterSim,
} from "@/lib/waterSim";
import {
  createTreeScene,
  renderTreeScene,
  resizeTreeScene,
  shakeNearestTree,
  updateTreeScene,
  type TreeScene,
} from "@/lib/treeScene";
import {
  clickSpaceScene,
  createSpaceScene,
  renderSpaceScene,
  resizeSpaceScene,
  updateSpaceScene,
  type SpaceScene,
} from "@/lib/spaceScene";
import {
  createSandScene,
  pushSandStick,
  renderSandScene,
  resizeSandScene,
  updateSandScene,
  type SandScene,
} from "@/lib/sandScene";
import {
  createGrassScene,
  pushGrassStick,
  renderGrassScene,
  resizeGrassScene,
  updateGrassScene,
  type GrassScene,
} from "@/lib/grassScene";
import {
  createSunScene,
  endMoonDrag,
  moveMoon,
  renderSunScene,
  resizeSunScene,
  startMoonDrag,
  type SunScene,
} from "@/lib/sunScene";
import {
  createFireScene,
  pourGas,
  renderFireScene,
  resizeFireScene,
  updateFireScene,
  type FireScene,
} from "@/lib/fireScene";
import {
  drawThemeEffects,
  drawThemeStroke,
  isThemeMotif,
  spawnThemeInteraction,
  type InkEffect,
  type InkPoint,
  type InkStroke,
  type ThemeMotif,
} from "@/lib/inkPenThemes";

const STICK_MOTIFS = new Set<ThemeMotif>(["water", "sand", "grass", "trees"]);
const GAS_CAN_MOTIFS = new Set<ThemeMotif>(["fire"]);
const CROSSHAIR_MOTIFS = new Set<ThemeMotif>(["space"]);
const SCENE_MOTIFS = new Set<ThemeMotif>(["fire", "water", "trees", "space", "sand", "grass", "sun"]);
const MAX_EFFECTS = 120;

type InkPenProps = {
  visualStateRef: RefObject<HeroVisualState>;
};

function getMotif(visualStateRef: RefObject<HeroVisualState>): ThemeMotif {
  const motif = visualStateRef.current?.abstract.motif;
  return motif && isThemeMotif(motif) ? motif : "abstract";
}

const STROKE_LIFETIME_MS = 6500;
const TREE_RETIRE_MS = 1200;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function setStickMode(active: boolean) {
  document.documentElement.dataset.heroStick = active ? "1" : "0";
}

function setStickDrag(active: boolean) {
  document.documentElement.dataset.heroStickDrag = active ? "1" : "0";
}

function setGasCanMode(active: boolean) {
  document.documentElement.dataset.heroGasCan = active ? "1" : "0";
}

function setGasPour(active: boolean) {
  document.documentElement.dataset.heroGasPour = active ? "1" : "0";
}

function setCrosshairMode(active: boolean) {
  if (active) {
    document.documentElement.dataset.heroCrosshair = "1";
  } else {
    delete document.documentElement.dataset.heroCrosshair;
  }
}

export function InkPen({ visualStateRef }: InkPenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<InkStroke[]>([]);
  const effectsRef = useRef<InkEffect[]>([]);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<InkStroke | null>(null);
  const lastHoverRef = useRef<InkPoint | null>(null);
  const spawnSeedRef = useRef(0);
  const frameRef = useRef(0);
  const blendModeRef = useRef<GlobalCompositeOperation>("multiply");
  const waterSimRef = useRef<WaterSim | null>(null);
  const treeSceneRef = useRef<TreeScene | null>(null);
  const spaceSceneRef = useRef<SpaceScene | null>(null);
  const sandSceneRef = useRef<SandScene | null>(null);
  const grassSceneRef = useRef<GrassScene | null>(null);
  const sunSceneRef = useRef<SunScene | null>(null);
  const fireSceneRef = useRef<FireScene | null>(null);
  const retiredTreeRef = useRef<{ scene: TreeScene; born: number } | null>(null);
  const moonDraggingRef = useRef(false);
  const activeMotifRef = useRef<ThemeMotif>("abstract");
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
    let lastWaterHoverAt = 0;
    let isVisible = true;
    let isPageVisible = document.visibilityState === "visible";

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (waterSimRef.current) {
        waterSimRef.current = resizeWaterSim(waterSimRef.current, width, height);
      }
      if (treeSceneRef.current) {
        treeSceneRef.current = resizeTreeScene(treeSceneRef.current, width, height);
      }
      if (spaceSceneRef.current) {
        spaceSceneRef.current = resizeSpaceScene(spaceSceneRef.current, width, height);
      }
      if (sandSceneRef.current) {
        sandSceneRef.current = resizeSandScene(sandSceneRef.current, width, height);
      }
      if (grassSceneRef.current) {
        grassSceneRef.current = resizeGrassScene(grassSceneRef.current, width, height);
      }
      if (sunSceneRef.current) {
        sunSceneRef.current = resizeSunScene(sunSceneRef.current, width, height);
      }
      if (fireSceneRef.current) {
        fireSceneRef.current = resizeFireScene(fireSceneRef.current, width, height);
      }
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
      { rootMargin: "220px 0px" },
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

    const getPos = (event: PointerEvent): InkPoint => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        pressure: 0.5,
      };
    };

    const resetInkState = () => {
      strokesRef.current = [];
      effectsRef.current = [];
      currentStrokeRef.current = null;
      drawingRef.current = false;
      moonDraggingRef.current = false;
    };

    const clearThemeMode = (motif: ThemeMotif) => {
      if (STICK_MOTIFS.has(motif)) {
        setStickMode(false);
        setStickDrag(false);
      }
      if (GAS_CAN_MOTIFS.has(motif)) {
        setGasCanMode(false);
        setGasPour(false);
      }
      if (CROSSHAIR_MOTIFS.has(motif)) {
        setCrosshairMode(false);
      }
      if (motif === "water") {
        canvas.removeAttribute("data-water-active");
        waterSimRef.current = null;
      }
      if (motif === "trees") {
        canvas.removeAttribute("data-trees-active");
        if (!retiredTreeRef.current) {
          treeSceneRef.current = null;
        }
      }
      if (motif === "space") {
        canvas.removeAttribute("data-space-active");
        spaceSceneRef.current = null;
      }
      if (motif === "sand") {
        canvas.removeAttribute("data-sand-active");
        sandSceneRef.current = null;
      }
      if (motif === "grass") {
        canvas.removeAttribute("data-grass-active");
        grassSceneRef.current = null;
      }
      if (motif === "sun") {
        canvas.removeAttribute("data-sun-active");
        sunSceneRef.current = null;
      }
      if (motif === "fire") {
        canvas.removeAttribute("data-fire-active");
        fireSceneRef.current = null;
      }
    };

    const ensureMotifMode = (motif: ThemeMotif) => {
      if (motif === activeMotifRef.current) return;

      if (activeMotifRef.current === "trees" && treeSceneRef.current) {
        retiredTreeRef.current = {
          scene: treeSceneRef.current,
          born: performance.now(),
        };
        treeSceneRef.current = null;
        canvas.removeAttribute("data-trees-active");
      }

      clearThemeMode(activeMotifRef.current);

      if (motif === "water") {
        waterSimRef.current = createWaterSim(width, height);
        setStickMode(true);
        canvas.dataset.waterActive = "true";
        resetInkState();
      } else if (motif === "trees") {
        treeSceneRef.current = createTreeScene(width, height);
        setStickMode(true);
        canvas.dataset.treesActive = "true";
        resetInkState();
      } else if (motif === "space") {
        spaceSceneRef.current = createSpaceScene(width, height);
        setCrosshairMode(true);
        canvas.dataset.spaceActive = "true";
        resetInkState();
      } else if (motif === "sand") {
        sandSceneRef.current = createSandScene(width, height);
        setStickMode(true);
        canvas.dataset.sandActive = "true";
        resetInkState();
      } else if (motif === "grass") {
        grassSceneRef.current = createGrassScene(width, height);
        setStickMode(true);
        canvas.dataset.grassActive = "true";
        resetInkState();
      } else if (motif === "sun") {
        sunSceneRef.current = createSunScene(width, height);
        canvas.dataset.sunActive = "true";
        resetInkState();
      } else if (motif === "fire") {
        fireSceneRef.current = createFireScene(width, height);
        setGasCanMode(true);
        canvas.dataset.fireActive = "true";
        resetInkState();
      } else {
        setCrosshairMode(false);
        setStickMode(false);
        setStickDrag(false);
        setGasCanMode(false);
        setGasPour(false);
        canvas.removeAttribute("data-water-active");
        canvas.removeAttribute("data-trees-active");
        canvas.removeAttribute("data-space-active");
        canvas.removeAttribute("data-sand-active");
        canvas.removeAttribute("data-grass-active");
        canvas.removeAttribute("data-sun-active");
        canvas.removeAttribute("data-fire-active");
        if (waterSimRef.current) {
          resetWaterSim(waterSimRef.current);
        }
      }

      activeMotifRef.current = motif;
    };

    const pressureFromSpeed = (speed: number) =>
      Math.max(0.25, Math.min(1, 1.15 - speed / 28));

    const interactAt = (point: InkPoint, speed: number, drawing: boolean) => {
      const motif = getMotif(visualStateRef);
      if (SCENE_MOTIFS.has(motif)) return;

      spawnSeedRef.current += 1;
      spawnThemeInteraction(motif, point, speed, effectsRef.current, spawnSeedRef.current, drawing);
      if (effectsRef.current.length > MAX_EFFECTS) {
        effectsRef.current.splice(0, effectsRef.current.length - MAX_EFFECTS);
      }
    };

    const disturbAt = (point: InkPoint, vx: number, vy: number, strength: number) => {
      const sim = waterSimRef.current;
      if (!sim) return;
      disturbWater(sim, point.x, point.y, vx, vy, strength);
    };

    const pushStickAt = (point: InkPoint, vx: number, vy: number, strength: number) => {
      const motif = getMotif(visualStateRef);
      if (motif === "sand" && sandSceneRef.current) {
        pushSandStick(sandSceneRef.current, point.x, point.y, vx, vy, strength);
      }
      if (motif === "grass" && grassSceneRef.current) {
        pushGrassStick(grassSceneRef.current, point.x, point.y, vx, vy, strength);
      }
    };

    const pourGasAt = (point: InkPoint, vx: number, vy: number, strength: number) => {
      const scene = fireSceneRef.current;
      if (!scene) return;
      pourGas(scene, point.x, point.y, vx, vy, strength);
    };

    const startStroke = (point: InkPoint) => {
      const motif = getMotif(visualStateRef);
      if (motif === "fire") {
        setGasPour(true);
        pourGasAt(point, 0, 6, 3.2);
        return;
      }

      if (motif === "water") {
        disturbAt(point, 0, 0, 3.6);
        setStickDrag(true);
        return;
      }

      if (motif === "sand" || motif === "grass") {
        setStickDrag(true);
        pushStickAt(point, 0, 0, 1.4);
        return;
      }

      if (motif === "sun") {
        const scene = sunSceneRef.current;
        if (scene && startMoonDrag(scene, point.x, point.y)) {
          moonDraggingRef.current = true;
        }
        return;
      }

      if (motif === "trees") {
        setStickDrag(true);
        const scene = treeSceneRef.current;
        if (scene) {
          shakeNearestTree(scene, point.x, point.y, 1.15);
        }
        return;
      }

      if (motif === "space") {
        const scene = spaceSceneRef.current;
        if (scene) {
          clickSpaceScene(scene, point.x, point.y, performance.now());
        }
        return;
      }

      currentStrokeRef.current = {
        points: [{ ...point, pressure: 1 }],
        born: performance.now(),
        seed: Math.random() * 1000,
        motif,
      };
      interactAt(point, 0, true);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drawingRef.current = true;
      lastHoverRef.current = getPos(event);
      startStroke(lastHoverRef.current);
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = getPos(event);
      const last = lastHoverRef.current;
      const vx = last ? point.x - last.x : 0;
      const vy = last ? point.y - last.y : 0;
      const speed = Math.hypot(vx, vy);
      lastHoverRef.current = point;

      const motif = getMotif(visualStateRef);
      ensureMotifMode(motif);

      if (motif === "fire") {
        if (drawingRef.current) {
          const strength = 1.8 + Math.min(speed * 0.28, 4.2);
          pourGasAt(point, vx * 0.15, Math.max(vy, 4), strength);
        }
        return;
      }

      if (motif === "water") {
        if (drawingRef.current) {
          const strength = 1.8 + Math.min(speed * 0.28, 4.5);
          disturbAt(point, vx, vy, strength);
          if (speed > 2) {
            disturbAt(point, vx * 0.5, vy * 0.5, strength * 0.45);
          }
        } else if (speed > 0.8) {
          const t = performance.now();
          if (t - lastWaterHoverAt > 24) {
            lastWaterHoverAt = t;
            disturbAt(point, vx, vy, 0.35 + Math.min(speed * 0.06, 0.55));
          }
        }
        return;
      }

      if (motif === "sand" || motif === "grass") {
        if (drawingRef.current) {
          const strength = 1 + Math.min(speed * 0.18, 2.8);
          pushStickAt(point, vx, vy, strength);
        }
        return;
      }

      if (motif === "sun") {
        const scene = sunSceneRef.current;
        if (scene && moonDraggingRef.current) {
          moveMoon(scene, point.x, point.y);
        }
        return;
      }

      if (motif === "trees") {
        if (drawingRef.current) {
          const scene = treeSceneRef.current;
          if (scene) {
            const strength = 0.45 + Math.min(speed * 0.06, 0.85);
            shakeNearestTree(scene, point.x, point.y, strength);
          }
        }
        return;
      }

      if (motif === "space") {
        return;
      }

      if (drawingRef.current && currentStrokeRef.current) {
        const strokeLast = currentStrokeRef.current.points.at(-1);
        if (!strokeLast) return;

        const distance = Math.hypot(point.x - strokeLast.x, point.y - strokeLast.y);
        if (distance > 1.2) {
          currentStrokeRef.current.points.push({
            ...point,
            pressure: pressureFromSpeed(distance),
          });
          if (distance > 4) {
            interactAt(point, distance, true);
          }
        }
        return;
      }

      if (speed > 1.5) {
        interactAt(point, speed, false);
      }
    };

    const endStroke = () => {
      drawingRef.current = false;
      setStickDrag(false);
      setGasPour(false);

      const scene = sunSceneRef.current;
      if (scene && moonDraggingRef.current) {
        endMoonDrag(scene);
        moonDraggingRef.current = false;
      }

      const stroke = currentStrokeRef.current;
      if (stroke && stroke.points.length > 0) {
        const last = stroke.points.at(-1);
        if (last) {
          stroke.points.push({ ...last, pressure: 1.1 });
        }
        strokesRef.current.push(stroke);
      }
      currentStrokeRef.current = null;
    };

    const drawStroke = (
      stroke: InkStroke,
      now: number,
      isActive: boolean,
      inkRgb: string,
      accentRgb: string,
      blend: GlobalCompositeOperation,
    ) => {
      const age = now - stroke.born;
      if (!isActive && age > STROKE_LIFETIME_MS) return false;

      const life = isActive ? 1 : Math.max(0, 1 - age / STROKE_LIFETIME_MS);
      const dry = 1 - Math.pow(1 - life, 1.6);

      drawThemeStroke(ctx, stroke, dry, inkRgb, accentRgb, blend);
      return life > 0.01;
    };

    const renderRetiredTrees = (
      now: number,
      accent: [number, number, number] | undefined,
      colors: [[number, number, number], [number, number, number], [number, number, number]] | undefined,
      blend: GlobalCompositeOperation,
    ) => {
      const retired = retiredTreeRef.current;
      if (!retired) return false;

      const t = clamp01((now - retired.born) / TREE_RETIRE_MS);
      const alpha = 1 - easeOutCubic(t);
      if (t >= 1 || alpha <= 0.01) {
        retiredTreeRef.current = null;
        return false;
      }

      const palette = {
        trunk: [58, 38, 24] as [number, number, number],
        foliage: colors?.[1] ?? [35, 75, 40],
        foliageLight: colors?.[2] ?? [80, 130, 60],
        leaf: accent ?? [90, 140, 55],
      };

      ctx.save();
      ctx.globalAlpha = alpha;
      updateTreeScene(retired.scene, now);
      renderTreeScene(ctx, retired.scene, now, palette, blend, t * 0.9);
      ctx.restore();
      return true;
    };

    const render = () => {
      frameRef.current = 0;
      if (!shouldAnimate()) return;

      const motif = getMotif(visualStateRef);
      ensureMotifMode(motif);

      const ink = visualStateRef.current?.ink;
      const accent = visualStateRef.current?.abstract.accent;
      const colors = visualStateRef.current?.abstract.colors;
      const scrollFade = visualStateRef.current?.scrollFade ?? 0;
      const inkRgb = ink ? ink.rgb.join(", ") : "8, 6, 5";
      const accentRgb = accent ? accent.join(", ") : inkRgb;
      const blend = ink?.blend ?? "multiply";
      const now = performance.now();

      const paintedRetiredTrees = renderRetiredTrees(now, accent, colors, blend);

      if (blendModeRef.current !== blend) {
        blendModeRef.current = blend;
        canvas.style.mixBlendMode = motif === "water" || motif === "fire" || motif === "sand" ? "normal" : blend;
      }

      if (motif === "fire" && fireSceneRef.current) {
        const scene = fireSceneRef.current;
        if (!paintedRetiredTrees) {
          ctx.clearRect(0, 0, width, height);
        }
        updateFireScene(scene, now);
        renderFireScene(ctx, scene, now, {
          core: colors?.[0] ?? [255, 90, 25],
          mid: ink?.rgb ?? [255, 85, 25],
          tip: colors?.[2] ?? [255, 180, 60],
          ember: accent ?? [255, 140, 40],
          gas: [255, 230, 80],
          smoke: [45, 18, 12],
        });
        queueFrame();
        return;
      }

      if (motif === "water" && waterSimRef.current) {
        const sim = waterSimRef.current;
        if (!paintedRetiredTrees) {
          ctx.clearRect(0, 0, width, height);
        }
        stepWater(sim, now);

        const palette = {
          deep: colors?.[1] ?? [12, 45, 68],
          mid: ink?.rgb ?? [22, 95, 128],
          highlight: colors?.[2] ?? [70, 165, 195],
        };

        renderWater(sim, ctx, width, height, palette, now);
        queueFrame();
        return;
      }

      if (motif === "trees" && treeSceneRef.current) {
        const scene = treeSceneRef.current;
        if (!paintedRetiredTrees) {
          ctx.clearRect(0, 0, width, height);
        }
        updateTreeScene(scene, now);

        const palette = {
          trunk: [58, 38, 24] as [number, number, number],
          foliage: ink?.rgb ?? [35, 75, 40],
          foliageLight: colors?.[2] ?? [80, 130, 60],
          leaf: accent ?? [90, 140, 55],
        };

        renderTreeScene(ctx, scene, now, palette, blend, scrollFade * 0.35);
        queueFrame();
        return;
      }

      if (motif === "space" && spaceSceneRef.current) {
        const scene = spaceSceneRef.current;
        if (!paintedRetiredTrees) {
          ctx.clearRect(0, 0, width, height);
        }
        updateSpaceScene(scene, now);

        const palette = {
          star: colors?.[2] ?? [200, 220, 255],
          accent: accent ?? [180, 200, 255],
          glow: ink?.rgb ?? [100, 120, 220],
          nebula: colors?.[0] ?? [100, 120, 220],
        };

        renderSpaceScene(ctx, scene, now, palette);
        queueFrame();
        return;
      }

      if (motif === "sand" && sandSceneRef.current) {
        const scene = sandSceneRef.current;
        if (!paintedRetiredTrees) {
          ctx.clearRect(0, 0, width, height);
        }
        updateSandScene(scene);
        renderSandScene(ctx, scene, {
          dark: colors?.[1] ?? [120, 85, 45],
          mid: ink?.rgb ?? [160, 120, 70],
          light: colors?.[2] ?? [220, 190, 150],
        });
        queueFrame();
        return;
      }

      if (motif === "grass" && grassSceneRef.current) {
        const scene = grassSceneRef.current;
        if (!paintedRetiredTrees) {
          ctx.clearRect(0, 0, width, height);
        }
        updateGrassScene(scene, now);
        renderGrassScene(ctx, scene, {
          dark: colors?.[1] ?? [30, 70, 25],
          mid: ink?.rgb ?? [35, 80, 30],
          light: colors?.[2] ?? [120, 180, 80],
          tip: accent ?? [60, 130, 45],
        }, blend);
        queueFrame();
        return;
      }

      if (motif === "sun" && sunSceneRef.current) {
        const scene = sunSceneRef.current;
        if (!paintedRetiredTrees) {
          ctx.clearRect(0, 0, width, height);
        }
        renderSunScene(ctx, scene, now, {
          sun: colors?.[0] ?? [255, 200, 60],
          sunCore: colors?.[1] ?? [255, 160, 30],
          ray: colors?.[2] ?? [255, 240, 180],
          sky: accent ?? [230, 150, 20],
          moon: [210, 215, 225],
          shadow: [40, 35, 55],
        });
        queueFrame();
        return;
      }

      if (!paintedRetiredTrees) {
        ctx.clearRect(0, 0, width, height);
      }

      effectsRef.current = drawThemeEffects(ctx, effectsRef.current, now, inkRgb, accentRgb, blend);

      strokesRef.current = strokesRef.current.filter((stroke) =>
        drawStroke(stroke, now, false, inkRgb, accentRgb, blend),
      );

      if (currentStrokeRef.current) {
        drawStroke(currentStrokeRef.current, now, true, inkRgb, accentRgb, blend);
      }

      queueFrame();
    };

    ensureMotifMode(getMotif(visualStateRef));
    queueFrame();

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);
    canvas.addEventListener("pointerleave", endStroke);

    return () => {
      setStickMode(false);
      setStickDrag(false);
      setGasCanMode(false);
      setGasPour(false);
      setCrosshairMode(false);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endStroke);
      canvas.removeEventListener("pointercancel", endStroke);
      canvas.removeEventListener("pointerleave", endStroke);
      stopFrame();
    };
  }, [visualStateRef, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="ink-pen-canvas absolute inset-0 z-[5] touch-none"
      aria-hidden="true"
    />
  );
}
