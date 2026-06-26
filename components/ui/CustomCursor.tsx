"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CustomCursorImpl = dynamic(
  () => import("@/components/ui/CustomCursorImpl").then((mod) => mod.CustomCursor),
  { ssr: false },
);

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    const enable = () => setEnabled(true);
    window.addEventListener("pointermove", enable, { once: true, passive: true });
    return () => window.removeEventListener("pointermove", enable);
  }, []);

  return enabled ? <CustomCursorImpl /> : null;
}
