export type HeroTheme = {
  id: string;
  label: string;
  bg: string;
  atmosphere: string;
  atmosphereSize?: string;
  abstract: string;
  abstractSize?: string;
  abstractMotion: "drift" | "pulse" | "orbit" | "glitch" | "breathe" | "scan" | "warp" | "ripple";
  inkRgb: [number, number, number];
  inkBlend: "multiply" | "screen" | "overlay" | "soft-light" | "color-dodge";
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  fontDisplay: string;
  fontBody: string;
  fontCta: string;
  fontMono: string;
  logoFilter: string;
  heroTone: "light" | "dark";
  ctaBg: string;
  ctaText: string;
  ctaHoverBg: string;
  abstractColors: [[number, number, number], [number, number, number], [number, number, number]];
  abstractAccent: [number, number, number];
};

export const HERO_THEME_CYCLE_MS = 20_000;
export const HERO_THEME_MORPH_MS = 5_600;

export const HERO_THEMES: HeroTheme[] = [
  {
    id: "fire",
    label: "Fire",
    bg: "#1a0c08",
    atmosphere:
      "radial-gradient(ellipse 90% 70% at 50% 95%, rgba(255,90,20,0.35), transparent 58%), radial-gradient(circle at 25% 20%, rgba(255,40,0,0.1), transparent 40%)",
    abstract:
      "radial-gradient(ellipse 40% 55% at 55% 75%, rgba(255,120,30,0.18), transparent 65%), conic-gradient(from 180deg at 40% 80%, rgba(255,60,0,0.1), transparent 90deg, rgba(255,160,40,0.08) 200deg, transparent)",
    abstractMotion: "breathe",
    inkRgb: [255, 85, 25],
    inkBlend: "screen",
    text: "#ffe8d8",
    textMuted: "rgba(255, 210, 185, 0.78)",
    textFaint: "rgba(255, 170, 130, 0.45)",
    border: "rgba(255, 100, 40, 0.22)",
    fontDisplay: "var(--font-instrument), Georgia, serif",
    fontBody: "var(--font-dm-sans), system-ui, sans-serif",
    fontCta: "var(--font-instrument), Georgia, serif",
    fontMono: "var(--font-courier), monospace",
    logoFilter:
      "brightness(0) invert(1) sepia(0.3) saturate(1.5) hue-rotate(-18deg) drop-shadow(0 0 14px rgba(255,100,30,0.35))",
    heroTone: "dark",
    ctaBg: "rgba(255, 90, 25, 0.88)",
    ctaText: "#1a0804",
    ctaHoverBg: "rgba(255, 120, 45, 0.95)",
    abstractColors: [
      [255, 90, 25],
      [200, 40, 0],
      [255, 180, 60],
    ],
    abstractAccent: [255, 140, 40],
  },
  {
    id: "water",
    label: "Water",
    bg: "#081820",
    atmosphere:
      "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(60,160,200,0.2), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(20,80,120,0.25), transparent 50%)",
    abstract:
      "repeating-radial-gradient(ellipse 80% 50% at 50% 0%, rgba(80,180,220,0.06) 0px, rgba(80,180,220,0.06) 1px, transparent 1px, transparent 16px), radial-gradient(ellipse 60% 45% at 30% 70%, rgba(40,120,180,0.12), transparent 60%)",
    abstractMotion: "ripple",
    inkRgb: [30, 120, 160],
    inkBlend: "soft-light",
    text: "#dff5fc",
    textMuted: "rgba(180, 230, 245, 0.75)",
    textFaint: "rgba(120, 190, 220, 0.42)",
    border: "rgba(60, 160, 200, 0.2)",
    fontDisplay: "var(--font-instrument), Georgia, serif",
    fontBody: "var(--font-space-grotesk), system-ui, sans-serif",
    fontCta: "var(--font-playfair), Georgia, serif",
    fontMono: "var(--font-ibm-plex-mono), monospace",
    logoFilter:
      "brightness(0) invert(1) saturate(0.55) hue-rotate(165deg) drop-shadow(0 0 14px rgba(80,190,230,0.35))",
    heroTone: "dark",
    ctaBg: "rgba(30, 100, 140, 0.85)",
    ctaText: "#e8f8fc",
    ctaHoverBg: "rgba(45, 130, 170, 0.95)",
    abstractColors: [
      [28, 110, 145],
      [12, 55, 82],
      [65, 155, 185],
    ],
    abstractAccent: [55, 150, 180],
  },
  {
    id: "trees",
    label: "Trees",
    bg: "#0e1610",
    atmosphere:
      "radial-gradient(ellipse 70% 55% at 30% 20%, rgba(60,120,50,0.18), transparent 55%), radial-gradient(ellipse 50% 60% at 75% 85%, rgba(20,50,30,0.3), transparent 50%)",
    abstract:
      "repeating-linear-gradient(95deg, transparent, transparent 38px, rgba(20,50,25,0.05) 38px, rgba(20,50,25,0.05) 40px), radial-gradient(ellipse 30% 80% at 20% 50%, rgba(40,80,30,0.12), transparent 70%)",
    abstractSize: "auto, cover",
    abstractMotion: "drift",
    inkRgb: [25, 55, 30],
    inkBlend: "multiply",
    text: "#e8f0e4",
    textMuted: "rgba(190, 215, 185, 0.72)",
    textFaint: "rgba(140, 170, 130, 0.4)",
    border: "rgba(60, 100, 50, 0.2)",
    fontDisplay: "var(--font-cormorant), Georgia, serif",
    fontBody: "var(--font-dm-sans), system-ui, sans-serif",
    fontCta: "var(--font-cormorant), Georgia, serif",
    fontMono: "var(--font-courier), monospace",
    logoFilter:
      "brightness(0) invert(1) sepia(0.15) saturate(0.75) hue-rotate(55deg) drop-shadow(0 0 12px rgba(70,120,50,0.3))",
    heroTone: "dark",
    ctaBg: "rgba(35, 70, 40, 0.9)",
    ctaText: "#e8f0e4",
    ctaHoverBg: "rgba(50, 95, 55, 0.95)",
    abstractColors: [
      [35, 75, 40],
      [20, 45, 25],
      [80, 130, 60],
    ],
    abstractAccent: [50, 100, 45],
  },
  {
    id: "wind",
    label: "Wind",
    bg: "#e4ecf2",
    atmosphere:
      "linear-gradient(175deg, rgba(255,255,255,0.7) 0%, transparent 45%), radial-gradient(ellipse 90% 40% at 80% 30%, rgba(180,210,230,0.35), transparent 60%)",
    abstract:
      "repeating-linear-gradient(168deg, transparent, transparent 20px, rgba(80,120,150,0.04) 20px, rgba(80,120,150,0.04) 21px), repeating-linear-gradient(12deg, transparent, transparent 48px, rgba(120,160,190,0.03) 48px, rgba(120,160,190,0.03) 49px)",
    abstractMotion: "scan",
    inkRgb: [50, 75, 95],
    inkBlend: "multiply",
    text: "#1a2838",
    textMuted: "rgba(30, 50, 70, 0.65)",
    textFaint: "rgba(50, 75, 100, 0.38)",
    border: "rgba(80, 120, 150, 0.18)",
    fontDisplay: "var(--font-space-grotesk), system-ui, sans-serif",
    fontBody: "var(--font-space-grotesk), system-ui, sans-serif",
    fontCta: "var(--font-syne), system-ui, sans-serif",
    fontMono: "var(--font-ibm-plex-mono), monospace",
    logoFilter: "saturate(0.35) brightness(0.82) contrast(1.05)",
    heroTone: "light",
    ctaBg: "#2a4058",
    ctaText: "#e8f0f8",
    ctaHoverBg: "#3a5570",
    abstractColors: [
      [100, 140, 170],
      [60, 90, 120],
      [180, 210, 230],
    ],
    abstractAccent: [70, 110, 145],
  },
  {
    id: "paper",
    label: "Paper",
    bg: "#f4f0e8",
    atmosphere:
      "radial-gradient(ellipse 90% 70% at 50% 15%, rgba(255,252,245,0.9), transparent 60%), radial-gradient(circle, rgba(0,0,0,0.035) 0.5px, transparent 0.5px)",
    atmosphereSize: "auto, 3px 3px",
    abstract:
      "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(10,10,10,0.04) 27px, rgba(10,10,10,0.04) 28px), linear-gradient(145deg, rgba(0,0,0,0.02) 0%, transparent 40%, rgba(0,0,0,0.015) 100%)",
    abstractMotion: "drift",
    inkRgb: [8, 6, 5],
    inkBlend: "multiply",
    text: "#0a0a0a",
    textMuted: "rgba(10, 10, 10, 0.62)",
    textFaint: "rgba(10, 10, 10, 0.35)",
    border: "rgba(10, 10, 10, 0.1)",
    fontDisplay: "var(--font-cormorant), Georgia, serif",
    fontBody: "var(--font-dm-sans), system-ui, sans-serif",
    fontCta: "var(--font-cormorant), Georgia, serif",
    fontMono: "var(--font-courier), monospace",
    logoFilter: "none",
    heroTone: "light",
    ctaBg: "#0a0a0a",
    ctaText: "#f4f0e8",
    ctaHoverBg: "#1a1a1a",
    abstractColors: [
      [20, 18, 14],
      [60, 55, 48],
      [120, 110, 95],
    ],
    abstractAccent: [10, 10, 10],
  },
  {
    id: "space",
    label: "Space",
    bg: "#06040f",
    atmosphere:
      "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(60,80,180,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 75%, rgba(120,40,160,0.12), transparent 55%)",
    abstract:
      "radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,0.45), transparent), radial-gradient(1px 1px at 35% 68%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 58% 18%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 78% 52%, rgba(255,255,255,0.28), transparent), radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,0.4), transparent), radial-gradient(ellipse 50% 35% at 50% 50%, rgba(80,100,200,0.08), transparent)",
    abstractMotion: "orbit",
    inkRgb: [180, 200, 255],
    inkBlend: "screen",
    text: "#e8eeff",
    textMuted: "rgba(200, 215, 255, 0.72)",
    textFaint: "rgba(160, 180, 230, 0.4)",
    border: "rgba(140, 160, 255, 0.18)",
    fontDisplay: "var(--font-space-grotesk), system-ui, sans-serif",
    fontBody: "var(--font-ibm-plex-mono), monospace",
    fontCta: "var(--font-syne), system-ui, sans-serif",
    fontMono: "var(--font-ibm-plex-mono), monospace",
    logoFilter: "brightness(0) invert(1) drop-shadow(0 0 16px rgba(140,160,255,0.35))",
    heroTone: "dark",
    ctaBg: "rgba(80, 100, 200, 0.25)",
    ctaText: "#d8e0ff",
    ctaHoverBg: "rgba(100, 120, 220, 0.4)",
    abstractColors: [
      [100, 120, 220],
      [180, 100, 220],
      [200, 220, 255],
    ],
    abstractAccent: [180, 200, 255],
  },
  {
    id: "sand",
    label: "Sand",
    bg: "#e8dcc8",
    atmosphere:
      "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(180,140,90,0.2), transparent 55%), radial-gradient(ellipse 60% 40% at 20% 30%, rgba(220,190,150,0.25), transparent 50%)",
    abstract:
      "repeating-linear-gradient(105deg, transparent, transparent 18px, rgba(140,100,60,0.04) 18px, rgba(140,100,60,0.04) 19px), radial-gradient(ellipse 80% 30% at 50% 80%, rgba(160,120,70,0.1), transparent 70%)",
    abstractMotion: "breathe",
    inkRgb: [120, 85, 45],
    inkBlend: "multiply",
    text: "#3a2e1e",
    textMuted: "rgba(60, 45, 25, 0.68)",
    textFaint: "rgba(100, 75, 45, 0.4)",
    border: "rgba(140, 100, 60, 0.2)",
    fontDisplay: "var(--font-playfair), Georgia, serif",
    fontBody: "var(--font-dm-sans), system-ui, sans-serif",
    fontCta: "var(--font-playfair), Georgia, serif",
    fontMono: "var(--font-courier), monospace",
    logoFilter: "sepia(0.3) saturate(0.85) brightness(0.88) contrast(1.08)",
    heroTone: "light",
    ctaBg: "rgba(100, 70, 35, 0.88)",
    ctaText: "#f8f0e4",
    ctaHoverBg: "rgba(130, 90, 50, 0.95)",
    abstractColors: [
      [160, 120, 70],
      [120, 85, 45],
      [220, 190, 150],
    ],
    abstractAccent: [140, 100, 55],
  },
  {
    id: "bones",
    label: "Bones",
    bg: "#ebe6de",
    atmosphere:
      "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,252,245,0.8), transparent 60%), radial-gradient(circle at 85% 15%, rgba(180,170,155,0.15), transparent 40%)",
    abstract:
      "repeating-radial-gradient(ellipse 8% 3% at 30% 45%, rgba(200,190,175,0.08) 0px, transparent 12px), repeating-radial-gradient(ellipse 6% 2% at 70% 60%, rgba(180,170,155,0.06) 0px, transparent 10px), linear-gradient(160deg, rgba(160,150,135,0.05), transparent 50%)",
    abstractMotion: "pulse",
    inkRgb: [55, 50, 45],
    inkBlend: "multiply",
    text: "#2a2620",
    textMuted: "rgba(50, 45, 38, 0.68)",
    textFaint: "rgba(90, 82, 72, 0.4)",
    border: "rgba(80, 72, 62, 0.15)",
    fontDisplay: "var(--font-cormorant), Georgia, serif",
    fontBody: "var(--font-instrument), Georgia, serif",
    fontCta: "var(--font-cormorant), Georgia, serif",
    fontMono: "var(--font-courier), monospace",
    logoFilter: "saturate(0.2) contrast(1.12) brightness(0.86)",
    heroTone: "light",
    ctaBg: "rgba(55, 50, 45, 0.88)",
    ctaText: "#f5f0e8",
    ctaHoverBg: "rgba(75, 68, 58, 0.95)",
    abstractColors: [
      [180, 170, 155],
      [120, 110, 98],
      [220, 215, 205],
    ],
    abstractAccent: [90, 82, 72],
  },
  {
    id: "grass",
    label: "Grass",
    bg: "#dce8d0",
    atmosphere:
      "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(255,255,240,0.6), transparent 55%), radial-gradient(ellipse 60% 40% at 70% 90%, rgba(60,120,40,0.12), transparent 50%)",
    abstract:
      "repeating-linear-gradient(88deg, transparent, transparent 3px, rgba(40,90,30,0.04) 3px, rgba(40,90,30,0.04) 4px), repeating-linear-gradient(92deg, transparent, transparent 5px, rgba(60,110,40,0.03) 5px, rgba(60,110,40,0.03) 6px)",
    abstractSize: "12px 40px, 16px 48px",
    abstractMotion: "ripple",
    inkRgb: [35, 80, 30],
    inkBlend: "multiply",
    text: "#1a3018",
    textMuted: "rgba(30, 60, 25, 0.65)",
    textFaint: "rgba(50, 90, 40, 0.38)",
    border: "rgba(50, 100, 40, 0.15)",
    fontDisplay: "var(--font-syne), system-ui, sans-serif",
    fontBody: "var(--font-dm-sans), system-ui, sans-serif",
    fontCta: "var(--font-syne), system-ui, sans-serif",
    fontMono: "var(--font-courier), monospace",
    logoFilter: "saturate(1.15) hue-rotate(75deg) brightness(0.88) contrast(1.06)",
    heroTone: "light",
    ctaBg: "rgba(40, 90, 35, 0.88)",
    ctaText: "#eef8e8",
    ctaHoverBg: "rgba(55, 115, 48, 0.95)",
    abstractColors: [
      [50, 110, 40],
      [30, 70, 25],
      [120, 180, 80],
    ],
    abstractAccent: [60, 130, 45],
  },
  {
    id: "circuits",
    label: "Circuits",
    bg: "#0a0e14",
    atmosphere:
      "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,180,100,0.1), transparent 55%), radial-gradient(circle at 20% 80%, rgba(0,120,200,0.08), transparent 40%)",
    abstract:
      "linear-gradient(rgba(0,200,120,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,120,0.06) 1px, transparent 1px), repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(0,180,255,0.03) 40px, rgba(0,180,255,0.03) 41px)",
    abstractSize: "28px 28px, 28px 28px, auto",
    abstractMotion: "glitch",
    inkRgb: [0, 220, 140],
    inkBlend: "screen",
    text: "#d8ffe8",
    textMuted: "rgba(160, 240, 200, 0.72)",
    textFaint: "rgba(100, 200, 150, 0.42)",
    border: "rgba(0, 200, 120, 0.2)",
    fontDisplay: "var(--font-ibm-plex-mono), monospace",
    fontBody: "var(--font-ibm-plex-mono), monospace",
    fontCta: "var(--font-space-grotesk), system-ui, sans-serif",
    fontMono: "var(--font-ibm-plex-mono), monospace",
    logoFilter:
      "brightness(0) invert(1) saturate(1.2) hue-rotate(95deg) drop-shadow(0 0 12px rgba(0,220,140,0.35))",
    heroTone: "dark",
    ctaBg: "rgba(0, 180, 100, 0.2)",
    ctaText: "#b8ffd8",
    ctaHoverBg: "rgba(0, 220, 130, 0.35)",
    abstractColors: [
      [0, 220, 140],
      [0, 160, 220],
      [40, 255, 180],
    ],
    abstractAccent: [0, 255, 160],
  },
  {
    id: "sun",
    label: "Sun",
    bg: "#fff6e0",
    atmosphere:
      "radial-gradient(circle at 50% 35%, rgba(255,220,80,0.45), transparent 42%), radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,240,180,0.5), transparent 55%)",
    abstract:
      "conic-gradient(from 0deg at 50% 38%, rgba(255,200,60,0.08) 0deg, transparent 12deg, rgba(255,200,60,0.08) 24deg, transparent 36deg, rgba(255,200,60,0.06) 48deg, transparent 60deg), radial-gradient(circle at 50% 35%, rgba(255,180,40,0.12), transparent 35%)",
    abstractMotion: "pulse",
    inkRgb: [140, 80, 10],
    inkBlend: "multiply",
    text: "#3a2808",
    textMuted: "rgba(80, 50, 10, 0.68)",
    textFaint: "rgba(120, 80, 20, 0.4)",
    border: "rgba(200, 140, 40, 0.2)",
    fontDisplay: "var(--font-playfair), Georgia, serif",
    fontBody: "var(--font-instrument), Georgia, serif",
    fontCta: "var(--font-playfair), Georgia, serif",
    fontMono: "var(--font-courier), monospace",
    logoFilter: "sepia(0.25) saturate(1.2) brightness(0.92) contrast(1.08) hue-rotate(-12deg)",
    heroTone: "light",
    ctaBg: "rgba(200, 130, 20, 0.9)",
    ctaText: "#fff8e8",
    ctaHoverBg: "rgba(230, 160, 30, 0.95)",
    abstractColors: [
      [255, 200, 60],
      [255, 160, 30],
      [255, 240, 180],
    ],
    abstractAccent: [230, 150, 20],
  },
  {
    id: "abstract",
    label: "Abstract",
    bg: "#dcdce8",
    atmosphere:
      "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(255,100,180,0.15), transparent 50%), radial-gradient(ellipse 50% 45% at 80% 70%, rgba(80,180,255,0.15), transparent 50%), radial-gradient(ellipse 40% 40% at 50% 50%, rgba(180,255,100,0.1), transparent 45%)",
    abstract:
      "conic-gradient(from 45deg at 30% 40%, rgba(255,80,120,0.1), transparent 60deg, rgba(80,120,255,0.1) 120deg, transparent 180deg, rgba(120,255,80,0.08) 240deg, transparent 300deg), conic-gradient(from 200deg at 70% 60%, rgba(255,200,80,0.08), transparent 90deg, rgba(180,80,255,0.08) 180deg, transparent 270deg)",
    abstractMotion: "warp",
    inkRgb: [80, 60, 140],
    inkBlend: "overlay",
    text: "#1a1830",
    textMuted: "rgba(40, 35, 70, 0.68)",
    textFaint: "rgba(70, 60, 110, 0.4)",
    border: "rgba(100, 80, 160, 0.18)",
    fontDisplay: "var(--font-syne), system-ui, sans-serif",
    fontBody: "var(--font-space-grotesk), system-ui, sans-serif",
    fontCta: "var(--font-syne), system-ui, sans-serif",
    fontMono: "var(--font-ibm-plex-mono), monospace",
    logoFilter: "saturate(1.35) hue-rotate(235deg) brightness(0.92) contrast(1.08)",
    heroTone: "light",
    ctaBg: "rgba(80, 60, 140, 0.75)",
    ctaText: "#f0eeff",
    ctaHoverBg: "rgba(110, 85, 180, 0.9)",
    abstractColors: [
      [255, 100, 160],
      [80, 140, 255],
      [140, 255, 100],
    ],
    abstractAccent: [180, 80, 220],
  },
];
