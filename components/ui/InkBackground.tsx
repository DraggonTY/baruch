"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

function AmbientStain({
  className,
  path,
  gradient = "ink-pool-light",
  filter = "ink-roughen-soft",
  style,
}: {
  className?: string;
  path: string;
  gradient?: string;
  filter?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={`ink-stain ${className ?? ""}`}
      style={style}
      aria-hidden="true"
    >
      <path d={path} fill={`url(#${gradient})`} filter={`url(#${filter})`} />
    </svg>
  );
}

const STAIN_A =
  "M198 42 C142 38, 88 72, 62 128 C34 190, 48 268, 102 318 C156 362, 248 358, 302 302 C348 252, 352 168, 312 108 C276 56, 248 46, 198 42 Z";

const STAIN_B =
  "M210 58 C168 52, 108 88, 82 142 C58 198, 78 278, 138 328 C192 372, 282 348, 322 278 C358 214, 332 118, 268 72 C242 54, 228 60, 210 58 Z";

const STAIN_C =
  "M188 72 C132 68, 72 118, 58 182 C42 258, 98 338, 178 352 C258 364, 328 298, 338 218 C348 138, 278 78, 188 72 Z";

export function InkBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    const onMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        container.style.setProperty("--mx", "0");
        container.style.setProperty("--my", "0");
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nx = (x / rect.width - 0.5) * 100;
      const ny = (y / rect.height - 0.5) * 100;
      container.style.setProperty("--mx", String(nx));
      container.style.setProperty("--my", String(ny));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReducedMotion]);

  const containerStyle = {
    "--mx": "0",
    "--my": "0",
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className="ink-field pointer-events-none absolute inset-0 overflow-hidden"
      style={containerStyle}
      aria-hidden="true"
    >
      <div
        className="ink-blob-layer absolute -top-24 -left-28 w-[min(480px,65vw)] opacity-80"
        style={{
          transform: "translate(calc(var(--mx) * 1.5px), calc(var(--my) * 1.2px)) rotate(-8deg)",
        }}
      >
        <AmbientStain path={STAIN_A} gradient="ink-pool" filter="ink-roughen" className="ink-blob-pulse w-full" />
      </div>

      <div
        className="ink-blob-layer absolute top-[14%] -right-36 w-[min(380px,50vw)] opacity-70"
        style={{
          transform: "translate(calc(var(--mx) * -1.2px), calc(var(--my) * 1.5px)) rotate(14deg)",
        }}
      >
        <AmbientStain path={STAIN_B} className="ink-blob-pulse-delayed w-full" />
      </div>

      <div
        className="ink-blob-layer absolute -bottom-32 left-[6%] w-[min(400px,55vw)] opacity-75"
        style={{
          transform: "translate(calc(var(--mx) * 1.3px), calc(var(--my) * -1.2px)) rotate(4deg)",
        }}
      >
        <AmbientStain path={STAIN_C} className="ink-blob-pulse-slow w-full" />
      </div>
    </div>
  );
}
