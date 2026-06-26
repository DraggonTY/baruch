"use client";

import { motion, useReducedMotion } from "framer-motion";

const WHISPERS = [
  "forgotten memory",
  "impossible note",
  "classified",
  "raw material",
  "blank page",
  "unexpected",
  "still forming",
  "do not open",
];

export function WhisperTicker() {
  const prefersReducedMotion = useReducedMotion();
  const items = [...WHISPERS, ...WHISPERS];

  return (
    <div
      className="pointer-events-none fixed right-0 bottom-0 left-0 z-20 overflow-hidden border-t border-foreground/10 py-2 mix-blend-multiply"
      aria-hidden="true"
    >
      <div className={`flex gap-12 whitespace-nowrap ${prefersReducedMotion ? "" : "animate-whisper-scroll"}`}>
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-[10px] tracking-[0.35em] text-foreground/25 uppercase italic"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marginalia() {
  const prefersReducedMotion = useReducedMotion();

  const fragments = [
    { text: "specimen", top: "18%", left: "4%", rotate: -90 },
    { text: "volatile", top: "42%", right: "3%", rotate: 90 },
    { text: "∿", top: "68%", left: "6%", rotate: 12 },
    { text: "unlabeled", top: "82%", right: "5%", rotate: -8 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {fragments.map((frag) => (
        <motion.span
          key={frag.text}
          className="font-display absolute text-[10px] tracking-[0.3em] text-foreground/20 uppercase"
          style={{
            top: frag.top,
            left: frag.left,
            right: frag.right,
            rotate: `${frag.rotate}deg`,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: [0.15, 0.35, 0.15],
                  y: [0, -6, 0],
                }
          }
          transition={{
            duration: 8 + fragments.indexOf(frag) * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {frag.text}
        </motion.span>
      ))}
    </div>
  );
}
