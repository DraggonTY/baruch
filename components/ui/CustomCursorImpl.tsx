"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DOT_LERP = 0.22;
const RING_LERP = 0.14;

const INTERACTIVE_SELECTOR =
  'a, button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [role="button"]:not([aria-disabled="true"]), [role="link"], label[for], summary';

const GRABBABLE_SELECTOR = ".cursor-grab, .lab-photo-frame";

export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const gasCanRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const visible = useRef(false);
  const pressing = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer || prefersReducedMotion) return;

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const stick = stickRef.current;
    const gasCan = gasCanRef.current;
    const crosshair = crosshairRef.current;
    if (!root || !dot || !ring || !stick || !gasCan || !crosshair) return;

    document.documentElement.classList.add("custom-cursor-active");
    root.dataset.active = "1";

    let raf = 0;
    let pageVisible = document.visibilityState === "visible";
    let lastHoverCheck = 0;

    const setVisible = (show: boolean) => {
      visible.current = show;
      root.dataset.visible = show ? "1" : "0";
      if (show) {
        queueFrame();
      }
    };

    const updateHoverState = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y);
      const interactive = Boolean(hit?.closest(INTERACTIVE_SELECTOR));
      const grab = Boolean(hit?.closest(GRABBABLE_SELECTOR));
      const text = Boolean(
        hit?.closest('input[type="text"], input[type="email"], input[type="search"], textarea'),
      );
      const onInkCanvas = Boolean(hit?.closest(".ink-pen-canvas"));
      const heroTheme = document.getElementById("hero")?.getAttribute("data-hero-theme");
      const onStick =
        document.documentElement.dataset.heroStick === "1" &&
        onInkCanvas;
      const onGasCan =
        document.documentElement.dataset.heroGasCan === "1" &&
        onInkCanvas;
      const onCrosshair =
        document.documentElement.dataset.heroCrosshair === "1" &&
        heroTheme === "space" &&
        onInkCanvas;

      root.dataset.hover = interactive ? "1" : "0";
      root.dataset.grab = grab ? "1" : "0";
      root.dataset.text = text ? "1" : "0";
      root.dataset.stick = onStick && !interactive && !text ? "1" : "0";
      root.dataset.stickDrag = document.documentElement.dataset.heroStickDrag === "1" ? "1" : "0";
      root.dataset.gasCan = onGasCan && !interactive && !text ? "1" : "0";
      root.dataset.gasPour = document.documentElement.dataset.heroGasPour === "1" ? "1" : "0";
      root.dataset.crosshair = onCrosshair && !interactive && !text ? "1" : "0";
    };

    const onPointerMove = (event: PointerEvent) => {
      target.current = { x: event.clientX, y: event.clientY };

      if (!visible.current) {
        dotPos.current = { ...target.current };
        ringPos.current = { ...target.current };
        setVisible(true);
      }

      updateHoverState(event.clientX, event.clientY);
      queueFrame();
    };

    const onPointerDown = (event: PointerEvent) => {
      pressing.current = true;
      root.dataset.press = "1";
      updateHoverState(event.clientX, event.clientY);
      queueFrame();
    };

    const onPointerUp = (event: PointerEvent) => {
      pressing.current = false;
      root.dataset.press = "0";
      updateHoverState(event.clientX, event.clientY);
      queueFrame();
    };

    const onPointerLeave = () => {
      setVisible(false);
    };

    const shouldAnimate = () => pageVisible && (visible.current || pressing.current);
    const queueFrame = () => {
      if (raf || !shouldAnimate()) return;
      raf = requestAnimationFrame(tick);
    };
    const stopFrame = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible";
      if (shouldAnimate()) {
        queueFrame();
      } else {
        stopFrame();
      }
    };

    const tick = (now: number) => {
      raf = 0;
      if (!shouldAnimate()) return;

      const lerp = prefersReducedMotion ? 1 : DOT_LERP;
      const ringLerp = prefersReducedMotion ? 1 : RING_LERP;

      dotPos.current.x += (target.current.x - dotPos.current.x) * lerp;
      dotPos.current.y += (target.current.y - dotPos.current.y) * lerp;
      ringPos.current.x += (target.current.x - ringPos.current.x) * ringLerp;
      ringPos.current.y += (target.current.y - ringPos.current.y) * ringLerp;

      dot.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      stick.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      gasCan.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      crosshair.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0)`;

      if (now - lastHoverCheck > 120) {
        lastHoverCheck = now;
        updateHoverState(target.current.x, target.current.y);
      }

      queueFrame();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    queueFrame();

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      delete document.documentElement.dataset.heroCrosshair;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopFrame();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={rootRef}
      className="custom-cursor"
      data-active="0"
      data-visible="0"
      data-hover="0"
      data-press="0"
      data-grab="0"
      data-text="0"
      data-stick="0"
      data-stick-drag="0"
      data-gas-can="0"
      data-gas-pour="0"
      data-crosshair="0"
      aria-hidden="true"
    >
      <div ref={ringRef} className="custom-cursor__ring" />
      <div ref={dotRef} className="custom-cursor__dot">
        <span className="custom-cursor__dot-inner">
          <svg viewBox="0 0 20 26" className="custom-cursor__ink" aria-hidden="true">
            <path
              d="M10 1.5C14.2 1.5 17.5 7.2 17.5 12.5C17.5 18.8 10 24.5 10 24.5C10 24.5 2.5 18.8 2.5 12.5C2.5 7.2 5.8 1.5 10 1.5Z"
              fill="url(#ink-cursor)"
              filter="url(#ink-roughen-soft)"
            />
          </svg>
        </span>
      </div>
      <div ref={stickRef} className="custom-cursor__stick">
        <svg viewBox="0 0 32 64" className="custom-cursor__stick-svg" aria-hidden="true">
          <defs>
            <linearGradient id="stick-wood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6b4a2e" />
              <stop offset="45%" stopColor="#9a7048" />
              <stop offset="100%" stopColor="#5a3d24" />
            </linearGradient>
          </defs>
          <rect x="14" y="8" width="4" height="48" rx="2" fill="url(#stick-wood)" />
          <ellipse cx="16" cy="58" rx="5" ry="2.5" fill="rgba(30,80,110,0.35)" />
          <path d="M12 6 L16 2 L20 6 Z" fill="#8a6340" />
        </svg>
      </div>
      <div ref={gasCanRef} className="custom-cursor__gas-can">
        <svg viewBox="0 0 48 56" className="custom-cursor__gas-can-svg" aria-hidden="true">
          <defs>
            <linearGradient id="gas-can-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d42b1f" />
              <stop offset="55%" stopColor="#a81812" />
              <stop offset="100%" stopColor="#7a0f0c" />
            </linearGradient>
            <linearGradient id="gas-can-spout" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a9098" />
              <stop offset="100%" stopColor="#4f555d" />
            </linearGradient>
          </defs>
          <rect x="10" y="18" width="24" height="30" rx="3" fill="url(#gas-can-body)" />
          <rect x="12" y="22" width="20" height="8" rx="1" fill="rgba(255,220,80,0.35)" />
          <path d="M22 10 L26 6 L30 10 L28 14 L20 14 Z" fill="#5a6068" />
          <rect x="21" y="14" width="6" height="5" rx="1" fill="url(#gas-can-spout)" />
          <path className="custom-cursor__gas-spout" d="M24 19 L24 28" stroke="url(#gas-can-spout)" strokeWidth="3" strokeLinecap="round" />
          <path className="custom-cursor__gas-stream" d="M24 28 C22 32 26 36 24 40" stroke="rgba(255,230,90,0.85)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="22" cy="50" rx="12" ry="3" fill="rgba(0,0,0,0.2)" />
        </svg>
      </div>
      <div ref={crosshairRef} className="custom-cursor__crosshair">
        <svg viewBox="0 0 18 18" className="custom-cursor__crosshair-svg" aria-hidden="true">
          <circle cx="9" cy="9" r="5.5" fill="none" stroke="rgba(200, 225, 255, 0.5)" strokeWidth="0.75" />
          <line x1="9" y1="1.5" x2="9" y2="5.5" stroke="rgba(230, 242, 255, 0.92)" strokeWidth="1" strokeLinecap="round" />
          <line x1="9" y1="12.5" x2="9" y2="16.5" stroke="rgba(230, 242, 255, 0.92)" strokeWidth="1" strokeLinecap="round" />
          <line x1="1.5" y1="9" x2="5.5" y2="9" stroke="rgba(230, 242, 255, 0.92)" strokeWidth="1" strokeLinecap="round" />
          <line x1="12.5" y1="9" x2="16.5" y2="9" stroke="rgba(230, 242, 255, 0.92)" strokeWidth="1" strokeLinecap="round" />
          <circle cx="9" cy="9" r="1" fill="rgba(200, 230, 255, 0.95)" />
        </svg>
      </div>
    </div>
  );
}
