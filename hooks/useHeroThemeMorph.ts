"use client";

import { useEffect, useRef, useState } from "react";
import {
  HERO_THEME_CYCLE_MS,
  HERO_THEME_MORPH_MS,
  HERO_THEMES,
  type HeroTheme,
} from "@/lib/heroThemes";

export type HeroInkState = {
  rgb: [number, number, number];
  blend: HeroTheme["inkBlend"];
};

export type HeroAbstractState = {
  colors: [[number, number, number], [number, number, number], [number, number, number]];
  accent: [number, number, number];
  pattern: number;
  motif: string;
  morphPulse: number;
};

export type HeroVisualState = {
  ink: HeroInkState;
  abstract: HeroAbstractState;
  scrollFade: number;
};

export type HeroMorphSnapshot = {
  theme: HeroTheme;
  themeIndex: number;
  morphProgress: number;
  bg: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  logoFilter: string;
  ctaBg: string;
  ctaText: string;
  ctaHoverBg: string;
  fontDisplay: string;
  fontBody: string;
  fontCta: string;
  fontMono: string;
  fromAtmosphereOpacity: number;
  toAtmosphereOpacity: number;
  fromAbstractOpacity: number;
  toAbstractOpacity: number;
  fromTheme: HeroTheme;
  toTheme: HeroTheme;
};

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const num = Number.parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function parseColor(input: string): [number, number, number] {
  if (input.startsWith("#")) return parseHex(input);
  const match = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  return [10, 10, 10];
}

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): string {
  return `rgb(${lerpChannel(a[0], b[0], t)}, ${lerpChannel(a[1], b[1], t)}, ${lerpChannel(a[2], b[2], t)})`;
}

function lerpInk(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerpChannel(a[0], b[0], t), lerpChannel(a[1], b[1], t), lerpChannel(a[2], b[2], t)];
}

function lerpTuple3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return lerpInk(a, b, t);
}

function lerpColors(
  from: HeroTheme["abstractColors"],
  to: HeroTheme["abstractColors"],
  t: number,
): HeroTheme["abstractColors"] {
  return [lerpTuple3(from[0], to[0], t), lerpTuple3(from[1], to[1], t), lerpTuple3(from[2], to[2], t)];
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function morphPulse(t: number) {
  return Math.sin(t * Math.PI);
}

function buildSnapshot(
  from: HeroTheme,
  to: HeroTheme,
  fromIndex: number,
  toIndex: number,
  eased: number,
): HeroMorphSnapshot {
  const fromBg = parseColor(from.bg);
  const toBg = parseColor(to.bg);
  const fromText = parseColor(from.text);
  const toText = parseColor(to.text);
  const fromMuted = parseColor(from.textMuted);
  const toMuted = parseColor(to.textMuted);
  const fromFaint = parseColor(from.textFaint);
  const toFaint = parseColor(to.textFaint);
  const fromCtaBg = parseColor(from.ctaBg);
  const toCtaBg = parseColor(to.ctaBg);
  const fromCtaText = parseColor(from.ctaText);
  const toCtaText = parseColor(to.ctaText);
  const fromCtaHover = parseColor(from.ctaHoverBg);
  const toCtaHover = parseColor(to.ctaHoverBg);

  const activeTheme = eased < 0.5 ? from : to;

  return {
    theme: activeTheme,
    themeIndex: eased < 0.5 ? fromIndex : toIndex,
    morphProgress: eased,
    bg: lerpRgb(fromBg, toBg, eased),
    text: lerpRgb(fromText, toText, eased),
    textMuted: lerpRgb(fromMuted, toMuted, eased),
    textFaint: lerpRgb(fromFaint, toFaint, eased),
    border: eased < 0.5 ? from.border : to.border,
    logoFilter: eased < 0.5 ? from.logoFilter : to.logoFilter,
    ctaBg: lerpRgb(fromCtaBg, toCtaBg, eased),
    ctaText: lerpRgb(fromCtaText, toCtaText, eased),
    ctaHoverBg: lerpRgb(fromCtaHover, toCtaHover, eased),
    fontDisplay: activeTheme.fontDisplay,
    fontBody: activeTheme.fontBody,
    fontCta: activeTheme.fontCta,
    fontMono: activeTheme.fontMono,
    fromAtmosphereOpacity: 1 - eased,
    toAtmosphereOpacity: eased,
    fromAbstractOpacity: 1 - eased,
    toAbstractOpacity: eased,
    fromTheme: from,
    toTheme: to,
  };
}

function buildVisualState(from: HeroTheme, to: HeroTheme, fromIndex: number, toIndex: number, eased: number): HeroVisualState {
  const patternIndex = eased < 0.5 ? fromIndex : toIndex;
  const motif = eased < 0.5 ? from.id : to.id;

  return {
    ink: {
      rgb: lerpInk(from.inkRgb, to.inkRgb, eased),
      blend: eased < 0.5 ? from.inkBlend : to.inkBlend,
    },
    abstract: {
      colors: lerpColors(from.abstractColors, to.abstractColors, eased),
      accent: lerpTuple3(from.abstractAccent, to.abstractAccent, eased),
      pattern: patternIndex,
      motif,
      morphPulse: morphPulse(eased),
    },
    scrollFade: 0,
  };
}

export function useHeroThemeMorph(prefersReducedMotion: boolean | null) {
  const [snapshot, setSnapshot] = useState<HeroMorphSnapshot>(() =>
    buildSnapshot(HERO_THEMES[0], HERO_THEMES[0], 0, 0, 1),
  );
  const visualStateRef = useRef<HeroVisualState>(
    buildVisualState(HERO_THEMES[0], HERO_THEMES[0], 0, 0, 1),
  );

  const indexRef = useRef(0);
  const morphRef = useRef({
    fromIndex: 0,
    toIndex: 0,
    start: 0,
    active: false,
  });
  const frameRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      const theme = HERO_THEMES[0];
      visualStateRef.current = buildVisualState(theme, theme, 0, 0, 1);
      frameRef.current = window.requestAnimationFrame(() => {
        setSnapshot(buildSnapshot(theme, theme, 0, 0, 1));
      });
      return () => cancelAnimationFrame(frameRef.current);
    }

    const startMorph = (toIndex: number) => {
      morphRef.current = {
        fromIndex: indexRef.current,
        toIndex,
        start: performance.now(),
        active: true,
      };
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    const cycleTimer = window.setInterval(() => {
      const next = (indexRef.current + 1) % HERO_THEMES.length;
      startMorph(next);
    }, HERO_THEME_CYCLE_MS);

    const tick = (now: number) => {
      frameRef.current = 0;
      const morph = morphRef.current;

      if (morph.active) {
        const raw = Math.min(1, (now - morph.start) / HERO_THEME_MORPH_MS);
        const eased = easeInOutCubic(raw);
        const from = HERO_THEMES[morph.fromIndex];
        const to = HERO_THEMES[morph.toIndex];

        visualStateRef.current = buildVisualState(from, to, morph.fromIndex, morph.toIndex, eased);
        setSnapshot(buildSnapshot(from, to, morph.fromIndex, morph.toIndex, eased));

        if (raw >= 1) {
          indexRef.current = morph.toIndex;
          morph.active = false;
          const settled = HERO_THEMES[morph.toIndex];
          visualStateRef.current = buildVisualState(settled, settled, morph.toIndex, morph.toIndex, 1);
          setSnapshot({
            ...buildSnapshot(settled, settled, morph.toIndex, morph.toIndex, 1),
            morphProgress: 0,
          });
          return;
        }
      }

      if (morphRef.current.active) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    return () => {
      window.clearInterval(cycleTimer);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [prefersReducedMotion]);

  return { snapshot, visualStateRef };
}
