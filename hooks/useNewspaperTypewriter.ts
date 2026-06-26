"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  INDEXED_NEWSPAPER_SEGMENTS,
  NEWSPAPER_TOTAL_CHARS,
  typingDelay,
} from "@/lib/newspaperSegments";

export function useNewspaperTypewriter() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [totalTyped, setTotalTyped] = useState(prefersReducedMotion ? NEWSPAPER_TOTAL_CHARS : 0);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsInView(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    if (!isInView || startedRef.current) return;

    let typed = 0;
    let timer = 0;
    let cancelled = false;

    startedRef.current = true;

    const typeNext = () => {
      if (cancelled) return;

      if (typed >= NEWSPAPER_TOTAL_CHARS) {
        setTotalTyped(NEWSPAPER_TOTAL_CHARS);
        setIsTyping(false);
        return;
      }

      const segment = INDEXED_NEWSPAPER_SEGMENTS.find(
        (item) => typed >= item.start && typed < item.end,
      );
      const char = segment?.text[typed - (segment?.start ?? 0)] ?? " ";

      typed += 1;
      setTotalTyped(typed);

      const finishedSegment = segment && typed === segment.end;
      const pause = finishedSegment ? (segment.pauseAfter ?? 140) : typingDelay(char);

      timer = window.setTimeout(typeNext, pause);
    };

    timer = window.setTimeout(() => {
      if (cancelled) return;
      setHasStarted(true);
      setIsTyping(true);
      typeNext();
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hasStarted, isInView, prefersReducedMotion]);

  const displayedTotalTyped = prefersReducedMotion ? NEWSPAPER_TOTAL_CHARS : totalTyped;

  return {
    ref,
    totalTyped: displayedTotalTyped,
    hasStarted,
    animateTyping: Boolean(hasStarted && !prefersReducedMotion),
    isTyping: !prefersReducedMotion && isTyping && displayedTotalTyped < NEWSPAPER_TOTAL_CHARS,
    isComplete: displayedTotalTyped >= NEWSPAPER_TOTAL_CHARS,
  };
}
