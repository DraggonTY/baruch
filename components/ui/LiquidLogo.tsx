"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const IDLE_FILTER_ID = "liquid-logo-idle";
const SPOT_FILTER_ID = "liquid-logo-spot";
const SPOT_RADIUS = 76;

function isPointerOverRect(clientX: number, clientY: number, rect: DOMRect) {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function lerp(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}

type LiquidLogoProps = {
  logoFilter?: string;
  heroTone?: "light" | "dark";
};

export function LiquidLogo({ logoFilter = "none", heroTone = "light" }: LiquidLogoProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const idleTurbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const idleDisplacementRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const spotOffsetRef = useRef<SVGFEOffsetElement | null>(null);
  const spotDisplacementRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const frameRef = useRef(0);
  const hoveringRef = useRef(false);
  const mouseNormRef = useRef({ x: 0, y: 0 });
  const mouseLocalRef = useRef({ x: 0, y: 0 });
  const smoothLocalRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    idleTurbulenceRef.current = document.querySelector(
      `#${IDLE_FILTER_ID} feTurbulence`,
    ) as SVGFETurbulenceElement | null;
    idleDisplacementRef.current = document.querySelector(
      `#${IDLE_FILTER_ID} feDisplacementMap`,
    ) as SVGFEDisplacementMapElement | null;
    spotOffsetRef.current = document.querySelector(
      `#${SPOT_FILTER_ID} feOffset`,
    ) as SVGFEOffsetElement | null;
    spotDisplacementRef.current = document.querySelector(
      `#${SPOT_FILTER_ID} feDisplacementMap`,
    ) as SVGFEDisplacementMapElement | null;

    const syncPointer = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const over = isPointerOverRect(clientX, clientY, rect);
      hoveringRef.current = over;

      if (over) {
        mouseLocalRef.current = {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
        mouseNormRef.current = {
          x: (clientX - rect.left - rect.width / 2) / (rect.width / 2),
          y: (clientY - rect.top - rect.height / 2) / (rect.height / 2),
        };
      } else {
        mouseNormRef.current = { x: 0, y: 0 };
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      syncPointer(event.clientX, event.clientY);
    };

    const onPointerLeaveWindow = () => {
      hoveringRef.current = false;
      mouseNormRef.current = { x: 0, y: 0 };
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeaveWindow);

    const start = performance.now();
    let isVisible = true;
    let isPageVisible = document.visibilityState === "visible";

    const shouldAnimate = () => isVisible && isPageVisible;
    const queueFrame = () => {
      if (frameRef.current || !shouldAnimate()) return;
      frameRef.current = requestAnimationFrame(tick);
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
      { rootMargin: "160px 0px" },
    );
    visibilityObserver.observe(el);

    const onVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (shouldAnimate()) {
        queueFrame();
      } else {
        stopFrame();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const tick = (now: number) => {
      frameRef.current = 0;
      if (!shouldAnimate()) return;

      const t = (now - start) / 1000;
      const active = hoveringRef.current;
      const spot = spotRef.current;
      const { x: nx, y: ny } = mouseNormRef.current;

      if (idleTurbulenceRef.current) {
        const idleFreqX = 0.008 + Math.sin(t * 0.55) * 0.002;
        const idleFreqY = 0.012 + Math.cos(t * 0.48) * 0.002;
        idleTurbulenceRef.current.setAttribute("baseFrequency", `${idleFreqX} ${idleFreqY}`);
      }

      if (idleDisplacementRef.current) {
        idleDisplacementRef.current.setAttribute("scale", String(5 + Math.sin(t * 0.9) * 2));
      }

      if (active && spot) {
        smoothLocalRef.current = {
          x: lerp(smoothLocalRef.current.x, mouseLocalRef.current.x, 0.2),
          y: lerp(smoothLocalRef.current.y, mouseLocalRef.current.y, 0.2),
        };

        const { x, y } = smoothLocalRef.current;
        const mask = `radial-gradient(circle ${SPOT_RADIUS}px at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 28%, transparent 68%)`;

        spot.style.maskImage = mask;
        spot.style.webkitMaskImage = mask;
        spot.style.opacity = "1";

        if (spotOffsetRef.current) {
          spotOffsetRef.current.setAttribute("dx", String(nx * 28));
          spotOffsetRef.current.setAttribute("dy", String(ny * 20));
        }

        if (spotDisplacementRef.current) {
          spotDisplacementRef.current.setAttribute("scale", String(18 + Math.hypot(nx, ny) * 4));
        }
      } else if (spot) {
        spot.style.opacity = "0";
      }

      queueFrame();
    };

    queueFrame();

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeaveWindow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver.disconnect();
      stopFrame();
    };
  }, [prefersReducedMotion]);

  const logoClass = "pointer-events-none block h-auto w-[min(380px,82vw)]";
  const composedFilter = prefersReducedMotion
    ? logoFilter
    : `url(#${IDLE_FILTER_ID}) ${logoFilter !== "none" ? logoFilter : ""}`.trim();
  const logoHalo =
    heroTone === "dark" ? "drop-shadow(0 4px 28px rgba(0,0,0,0.42))" : undefined;

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto relative mx-auto mb-12 w-fit max-w-[min(380px,82vw)]"
      style={logoHalo ? { filter: logoHalo } : undefined}
    >
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={IDLE_FILTER_ID} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.015" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={SPOT_FILTER_ID} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="3" seed="8" result="noise" />
            <feOffset in="noise" dx="0" dy="0" result="shiftedNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="shiftedNoise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <Image
        src="/logo.png"
        alt="BARUCH"
        width={380}
        height={202}
        className={logoClass}
        style={prefersReducedMotion ? { filter: logoFilter } : { filter: composedFilter }}
        priority
      />

      {!prefersReducedMotion && (
        <div ref={spotRef} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150">
          <Image
            src="/logo.png"
            alt=""
            aria-hidden
            width={380}
            height={202}
            className={logoClass}
            style={{ filter: prefersReducedMotion ? logoFilter : `url(#${SPOT_FILTER_ID}) ${logoFilter !== "none" ? logoFilter : ""}`.trim() }}
            priority
          />
        </div>
      )}
    </div>
  );
}
