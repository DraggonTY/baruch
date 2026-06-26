"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LAB_STEPS } from "@/lib/constants";

const REST_LAYOUTS = [
  { left: "0%", top: "0%", width: "72%", height: "58%", rotate: -3, zIndex: 10 },
  { left: "52%", top: "50%", width: "48%", height: "42%", rotate: 2.5, zIndex: 20 },
  { left: "18%", top: "62%", width: "42%", height: "38%", rotate: -1.5, zIndex: 30 },
];

type ActivePhoto = { index: number; phase: "slide" | "over" | "tilt" | "retreat" };

const PHOTO_BEHAVIOR = [
  {
    slideAway: { x: "0%", y: "-44%" },
    floatOver: { x: "6%", y: "-10%" },
    tiltDelta: 0,
    elevates: true,
  },
  {
    slideAway: { x: "46%", y: "-8%" },
    floatOver: { x: "8%", y: "-18%" },
    tiltDelta: 0,
    elevates: true,
  },
  {
    slideAway: null,
    floatOver: null,
    tiltDelta: 4,
    elevates: false,
  },
];

const ELEVATED_Z_INDEX = 32;
const spring = { type: "spring" as const, stiffness: 260, damping: 26 };
const SLIDE_DURATION_MS = 520;

type LabImageClusterProps = {
  stepIndex: number;
  images: (typeof LAB_STEPS)[number]["images"];
};

export function LabImageCluster({ stepIndex, images }: LabImageClusterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<ActivePhoto | null>(null);
  const activeRef = useRef<ActivePhoto | null>(null);
  const elevateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retreatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const clearElevateTimer = () => {
    if (elevateTimerRef.current) {
      clearTimeout(elevateTimerRef.current);
      elevateTimerRef.current = null;
    }
  };

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const clearRetreatTimer = () => {
    if (retreatTimerRef.current) {
      clearTimeout(retreatTimerRef.current);
      retreatTimerRef.current = null;
    }
  };

  const startRetreat = (imageIndex: number) => {
    clearElevateTimer();
    clearRetreatTimer();

    const behavior = PHOTO_BEHAVIOR[imageIndex];
    if (!behavior.elevates) {
      setActive(null);
      return;
    }

    setActive({ index: imageIndex, phase: "retreat" });
    retreatTimerRef.current = setTimeout(() => {
      setActive((current) =>
        current?.index === imageIndex && current.phase === "retreat" ? null : current,
      );
    }, SLIDE_DURATION_MS);
  };

  const handleHoverStart = (imageIndex: number) => {
    if (prefersReducedMotion) return;
    clearLeaveTimer();
    clearRetreatTimer();

    if (active?.index === imageIndex && active.phase === "retreat") {
      setActive({ index: imageIndex, phase: "slide" });
      elevateTimerRef.current = setTimeout(() => {
        setActive((current) =>
          current?.index === imageIndex ? { index: imageIndex, phase: "over" } : current,
        );
      }, SLIDE_DURATION_MS);
      return;
    }

    if (active !== null) {
      if (active.index !== imageIndex) return;
      if (active.phase === "over" || active.phase === "tilt" || active.phase === "slide") return;
    }

    clearElevateTimer();

    const behavior = PHOTO_BEHAVIOR[imageIndex];
    if (!behavior.elevates) {
      setActive({ index: imageIndex, phase: "tilt" });
      return;
    }

    setActive({ index: imageIndex, phase: "slide" });
    elevateTimerRef.current = setTimeout(() => {
      setActive((current) =>
        current?.index === imageIndex ? { index: imageIndex, phase: "over" } : current,
      );
    }, SLIDE_DURATION_MS);
  };

  const handleHoverEnd = (imageIndex: number) => {
    if (prefersReducedMotion) return;
    clearLeaveTimer();

    const current = activeRef.current;
    if (!current || current.index !== imageIndex) return;
    if (current.phase === "tilt") {
      clearElevateTimer();
      setActive(null);
      return;
    }
    if (current.phase === "retreat") return;

    startRetreat(imageIndex);
  };

  const handleClusterEnter = () => {
    clearLeaveTimer();
  };

  const handleClusterLeave = () => {
    clearLeaveTimer();
    leaveTimerRef.current = setTimeout(() => {
      const current = activeRef.current;
      if (!current) return;
      if (current.phase === "tilt") {
        setActive(null);
        return;
      }
      if (current.phase === "retreat") return;
      startRetreat(current.index);
    }, 120);
  };

  return (
    <div
      className="relative min-h-[340px] overflow-visible px-8 py-12 md:min-h-[420px] md:px-10 md:py-14"
      onMouseEnter={handleClusterEnter}
      onMouseLeave={handleClusterLeave}
    >
      {images.map((image, imageIndex) => {
        const rest = REST_LAYOUTS[imageIndex];
        const behavior = PHOTO_BEHAVIOR[imageIndex];
        const isActive = active?.index === imageIndex;
        const phase = isActive ? active.phase : "rest";
        const isEngaged = active?.phase === "slide" || active?.phase === "over";
        const isDimmed = isEngaged && !isActive;
        const isLocked = isEngaged && !isActive;

        let x: string | number = "0%";
        let y: string | number = "0%";
        let rotate = rest.rotate;
        let zIndex = rest.zIndex;
        let scale = 1;
        const lifted = phase === "over";

        if ((phase === "slide" || phase === "retreat") && behavior.slideAway) {
          x = behavior.slideAway.x;
          y = behavior.slideAway.y;
          if (phase === "retreat") {
            zIndex = rest.zIndex;
          }
        } else if (phase === "over" && behavior.floatOver) {
          x = behavior.floatOver.x;
          y = behavior.floatOver.y;
          zIndex = ELEVATED_Z_INDEX;
        } else if (phase === "tilt") {
          rotate = rest.rotate + behavior.tiltDelta;
          scale = 1.015;
        }

        if (isDimmed) {
          scale *= 0.96;
        }

        return (
          <motion.div
            key={image.src}
            className="absolute overflow-visible"
            style={{
              left: rest.left,
              top: rest.top,
              width: rest.width,
              height: rest.height,
              zIndex,
              pointerEvents: isLocked ? "none" : "auto",
            }}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-5%" }}
            animate={{
              rotate,
              x,
              y,
              opacity: isDimmed ? 0.65 : 1,
              scale,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    x: spring,
                    y: spring,
                    rotate: spring,
                    scale: spring,
                    opacity: { duration: 0.25 },
                  }
            }
            onHoverStart={() => handleHoverStart(imageIndex)}
            onHoverEnd={() => handleHoverEnd(imageIndex)}
            onFocus={() => handleHoverStart(imageIndex)}
            onBlur={() => handleHoverEnd(imageIndex)}
            tabIndex={0}
          >
            <div
              className={`lab-photo-frame relative h-full w-full cursor-grab overflow-hidden border border-foreground/15 bg-[#f5f2ec] active:cursor-grabbing ${
                lifted ? "lab-photo-frame--lifted" : ""
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover contrast-[1.15] saturate-[0.4] mix-blend-multiply"
                sizes="(max-width: 768px) 80vw, 40vw"
              />
              <div className="absolute inset-0 bg-foreground/10 mix-blend-overlay" />
              <span className="font-mono absolute bottom-2 left-2 text-[8px] tracking-widest text-background/70 uppercase">
                fig.{stepIndex + 1}.{imageIndex + 1}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
