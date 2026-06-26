import { DAILY_FRAGRANCE } from "@/lib/constants";

export type NewspaperSegment = {
  id: string;
  text: string;
  pauseAfter?: number;
};

const TICKER_BODY = DAILY_FRAGRANCE.ticker.map((item) => `${item} ✦`).join(" ").trim();

export const NEWSPAPER_SEGMENTS: NewspaperSegment[] = [
  { id: "ticker", text: `WIRE — ${TICKER_BODY}`, pauseAfter: 320 },
  { id: "kicker", text: "Est. MMXXVI — Independent Fragrance Report", pauseAfter: 180 },
  { id: "name", text: DAILY_FRAGRANCE.name, pauseAfter: 220 },
  { id: "tagline", text: DAILY_FRAGRANCE.tagline, pauseAfter: 200 },
  { id: "date", text: DAILY_FRAGRANCE.date },
  { id: "edition", text: DAILY_FRAGRANCE.edition },
  { id: "volume", text: DAILY_FRAGRANCE.volume },
  { id: "price", text: DAILY_FRAGRANCE.price, pauseAfter: 160 },
  { id: "weather", text: DAILY_FRAGRANCE.weather, pauseAfter: 240 },
  { id: "fold", text: "Fold Here", pauseAfter: 200 },
  { id: "dateline", text: "Special Report — Fragrance Industry", pauseAfter: 180 },
  { id: "headline", text: DAILY_FRAGRANCE.headline, pauseAfter: 280 },
  { id: "deck", text: DAILY_FRAGRANCE.deck, pauseAfter: 260 },
  { id: "sidebar-inside-label", text: DAILY_FRAGRANCE.sidebar[0].label, pauseAfter: 120 },
  ...DAILY_FRAGRANCE.sidebar[0].items.map((item, index) => ({
    id: `sidebar-inside-${index}`,
    text: item,
    pauseAfter: 100,
  })),
  { id: "pull-quote", text: DAILY_FRAGRANCE.pullQuote, pauseAfter: 240 },
  { id: "sidebar-record-label", text: DAILY_FRAGRANCE.sidebar[1].label, pauseAfter: 120 },
  { id: "sidebar-record-quote", text: DAILY_FRAGRANCE.sidebar[1].quote, pauseAfter: 200 },
  {
    id: "sidebar-record-attribution",
    text: DAILY_FRAGRANCE.sidebar[1].attribution,
    pauseAfter: 180,
  },
  { id: "chart-label", text: "Olfactory Index", pauseAfter: 100 },
  { id: "chart-value", text: "↓ 8.2", pauseAfter: 120 },
  { id: "chart-note", text: "Closing: Predictability High", pauseAfter: 200 },
  {
    id: "photo",
    text: "[ File Photo: The Aisle That Never Changes ]",
    pauseAfter: 200,
  },
  {
    id: "caption",
    text: "Fig. 1 — A typical retail fragrance wall, photographed yesterday and every day before it.",
    pauseAfter: 220,
  },
  { id: "lead", text: DAILY_FRAGRANCE.lead, pauseAfter: 280 },
  ...DAILY_FRAGRANCE.columns.map((line, index) => ({
    id: `column-${index}`,
    text: line,
    pauseAfter: 200,
  })),
  ...DAILY_FRAGRANCE.briefs.flatMap((brief, index) => [
    { id: `brief-${index}-kicker`, text: brief.kicker, pauseAfter: 80 },
    { id: `brief-${index}-title`, text: brief.title, pauseAfter: 140 },
    { id: `brief-${index}-body`, text: brief.body, pauseAfter: 200 },
  ]),
  { id: "classifieds-title", text: "Classifieds", pauseAfter: 160 },
  ...DAILY_FRAGRANCE.classifieds.flatMap((ad, index) => [
    { id: `classified-${index}-tag`, text: ad.tag, pauseAfter: 60 },
    { id: `classified-${index}-text`, text: ad.text, pauseAfter: 140 },
  ]),
  { id: "editorial-label", text: "Editorial", pauseAfter: 120 },
  { id: "editorial-body", text: DAILY_FRAGRANCE.closing, pauseAfter: 220 },
  { id: "editorial-line", text: DAILY_FRAGRANCE.editorsLine, pauseAfter: 180 },
  {
    id: "footer-1",
    text: `${DAILY_FRAGRANCE.name} · Printed in small batches · Corrections: corrections@dailyfragrance.baruch`,
    pauseAfter: 120,
  },
  {
    id: "footer-2",
    text: "© MMXXVI Baruch. Reproduction of predictability strictly forbidden.",
  },
];

export type IndexedSegment = NewspaperSegment & {
  start: number;
  end: number;
};

export function indexNewspaperSegments(segments: NewspaperSegment[]): IndexedSegment[] {
  let offset = 0;
  return segments.map((segment) => {
    const start = offset;
    offset += segment.text.length;
    const end = offset;
    return { ...segment, start, end };
  });
}

export const INDEXED_NEWSPAPER_SEGMENTS = indexNewspaperSegments(NEWSPAPER_SEGMENTS);

export const NEWSPAPER_TOTAL_CHARS = INDEXED_NEWSPAPER_SEGMENTS.at(-1)?.end ?? 0;

export function typingDelay(char: string) {
  if (char === "\n") return 120;
  if (char === " ") return 38;
  if (char === "✦") return 200;
  if (char === "↓" || char === "№") return 110;
  if (char === "—" || char === "–") return 90;
  if (char === "," || char === "." || char === ";" || char === ":") return 150;
  if (char === '"' || char === "'" || char === "[" || char === "]") return 70;
  return 22 + Math.floor(Math.random() * 20);
}

export function segmentFullText(indexed: IndexedSegment[], id: string): string {
  return indexed.find((item) => item.id === id)?.text ?? "";
}

export function segmentText(
  indexed: IndexedSegment[],
  id: string,
  totalTyped: number,
): string {
  const segment = indexed.find((item) => item.id === id);
  if (!segment || totalTyped <= segment.start) return "";
  const visible = totalTyped - segment.start;
  return segment.text.slice(0, Math.min(segment.text.length, visible));
}

export function displaySegmentText(
  indexed: IndexedSegment[],
  id: string,
  totalTyped: number,
  animateTyping: boolean,
): string {
  const segment = indexed.find((item) => item.id === id);
  if (!segment) return "";

  if (!animateTyping || totalTyped >= segment.end) {
    return segment.text;
  }

  const activeId = activeSegmentId(indexed, totalTyped);
  if (id !== activeId) {
    return segment.text;
  }

  if (totalTyped > segment.start) {
    const visible = totalTyped - segment.start;
    return segment.text.slice(0, Math.min(segment.text.length, visible));
  }

  return "";
}

export function segmentStarted(indexed: IndexedSegment[], id: string, totalTyped: number) {
  const segment = indexed.find((item) => item.id === id);
  if (!segment) return false;
  return totalTyped > segment.start;
}

export function segmentComplete(indexed: IndexedSegment[], id: string, totalTyped: number) {
  const segment = indexed.find((item) => item.id === id);
  if (!segment) return false;
  return totalTyped >= segment.end;
}

export function activeSegmentId(indexed: IndexedSegment[], totalTyped: number) {
  if (totalTyped >= NEWSPAPER_TOTAL_CHARS) return null;
  return indexed.find((segment) => totalTyped >= segment.start && totalTyped < segment.end)?.id ?? null;
}
