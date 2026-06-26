"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type FadeInWhenVisibleProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function FadeInWhenVisible({
  children,
  className,
  delay = 0,
  y = 24,
}: FadeInWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible || prefersReducedMotion ? "translate3d(0, 0, 0)" : `translate3d(0, ${y}px, 0)`,
        transition: prefersReducedMotion
          ? undefined
          : `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
