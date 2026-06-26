"use client";

import {
  activeSegmentId,
  displaySegmentText,
  INDEXED_NEWSPAPER_SEGMENTS,
} from "@/lib/newspaperSegments";

type NewspaperTypeTextProps = {
  segmentId: string;
  totalTyped: number;
  isTyping: boolean;
  animateTyping?: boolean;
  className?: string;
  showCursor?: boolean;
};

export function NewspaperTypeText({
  segmentId,
  totalTyped,
  isTyping,
  animateTyping = false,
  className,
  showCursor = true,
}: NewspaperTypeTextProps) {
  const text = displaySegmentText(
    INDEXED_NEWSPAPER_SEGMENTS,
    segmentId,
    totalTyped,
    animateTyping,
  );
  const active = activeSegmentId(INDEXED_NEWSPAPER_SEGMENTS, totalTyped) === segmentId;

  if (!className) {
    return (
      <>
        {text}
        {showCursor && active && isTyping ? (
          <span className="newspaper-type-cursor" aria-hidden="true" />
        ) : null}
      </>
    );
  }

  return (
    <span className={className}>
      {text}
      {showCursor && active && isTyping ? (
        <span className="newspaper-type-cursor" aria-hidden="true" />
      ) : null}
    </span>
  );
}
