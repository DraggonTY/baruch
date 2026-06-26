export const SITE = {
  name: "BARUCH",
  title: "BARUCH — A New Kind of Fragrance House",
  description:
    "Creating scents inspired by impossible ideas, forgotten memories, and unexpected experiences.",
} as const;

export const NAV_LINKS = [
  { label: "Vision", href: "#vision" },
  { label: "Lab", href: "#lab" },
  { label: "About", href: "#about" },
  { label: "Join", href: "#join" },
] as const;

export const HERO = {
  tagline: "A NEW KIND OF FRAGRANCE HOUSE",
  subtext:
    "Creating scents inspired by impossible ideas, forgotten memories, and unexpected experiences.",
  cta: "JOIN THE JOURNEY",
} as const;

export const MANIFESTO = {
  headline: "PERFUME HAS BECOME PREDICTABLE.",
  lines: [
    "The same notes.",
    "The same bottles.",
    "The same ideas.",
  ],
  closing: "Baruch exists to create something different.",
} as const;

export const DAILY_FRAGRANCE = {
  name: "The Daily Fragrance",
  tagline: "All the Scent That's Fit to Print",
  edition: "Late City Final",
  date: "Tuesday, June 23, 2026",
  volume: "Vol. I — No. 1",
  price: "3¢",
  weather: "Smoky · 68° · Humidity High",
  ticker: [
    "MUSK INDEX ↓12%",
    "VANILLA SURPLUS HITS GRASSE",
    "BARUCH OPENS INVESTIGATION DESK",
    "LIMITED EDITIONS, UNLIMITED",
    "CELEBRITY LAUNCH №47 THIS QUARTER",
    "OLFACTORY CONFIDENCE AT 11-YEAR LOW",
  ],
  headline: MANIFESTO.headline,
  deck:
    "A dispatch from the front lines of an industry running on empty formulas, recycled narratives, and flacons that all whisper the same nameless thing.",
  lead: "The corridors of commerce smell identical. Walk through any department store, any airport duty-free, any influencer's unboxing — and you will find the same architecture of scent: bergamot opening, woody amber heart, clean musk drydown. The packaging changes. The price tag climbs. The soul does not.",
  columns: MANIFESTO.lines,
  briefs: [
    {
      kicker: "Industry Watch",
      title: "Vanilla Surplus Reaches Critical Mass",
      body: "Warehouses in Grasse report unprecedented stockpiles of 'warm gourmand' bases. Analysts warn the note may soon qualify as ambient temperature.",
    },
    {
      kicker: "Market Brief",
      title: "Olfactory Index Slips Again",
      body: "The OI closed down 8.2 points amid heavy trading in 'smells like my ex but richer' derivatives. Traders cite fatigue.",
    },
    {
      kicker: "Culture Desk",
      title: "Nostalgia Declared Official Note of 2026",
      body: "Every launch now claims to evoke a childhood that increasingly resembles a stock photo. Parents unavailable for comment.",
    },
  ],
  sidebar: [
    {
      label: "Inside",
      items: [
        "The Dupe Economy, Page A2",
        "Who Killed the Chypre?",
        "Baruch Lab: First Look",
      ],
    },
    {
      label: "On Record",
      quote:
        '"We don\'t need another safe scent. We need a reason to remember."',
      attribution: "— Unnamed nose, off the record",
    },
  ],
  classifieds: [
    { tag: "LOST", text: "One original idea. Last seen circa 2019. Reward offered." },
    { tag: "FOR SALE", text: "47 identical 'niche' releases. Slight variation in cap color." },
    { tag: "WANTED", text: "Creators willing to work without a mood board of other people's perfumes." },
    { tag: "NOTICE", text: "The Daily Fragrance is now accepting tips. Anonymity guaranteed." },
  ],
  pullQuote: "If everything smells like everything else, nothing is memorable.",
  closing: MANIFESTO.closing,
  editorsLine: "— The Editors, The Daily Fragrance",
} as const;

export const LAB_STEPS = [
  {
    label: "IDEA",
    quote: "An unusual thought.",
    images: [
      { src: "/images/lab/idea-1.jpg", alt: "Sketch on paper" },
      { src: "/images/lab/idea-2.jpg", alt: "Handwritten notes" },
      { src: "/images/lab/idea-3.jpg", alt: "Abstract ink texture" },
    ],
  },
  {
    label: "CREATION",
    quote: "Turning imagination into a scent.",
    images: [
      { src: "/images/lab/creation-1.jpg", alt: "Raw ingredients close-up" },
      { src: "/images/lab/creation-2.jpg", alt: "Laboratory glassware" },
      { src: "/images/lab/creation-3.jpg", alt: "Mixing and formulation" },
    ],
  },
  {
    label: "EXPERIENCE",
    quote: "Creating something people remember.",
    images: [
      { src: "/images/lab/experience-1.jpg", alt: "Bottle silhouette" },
      { src: "/images/lab/experience-2.jpg", alt: "Atmospheric texture" },
      { src: "/images/lab/experience-3.jpg", alt: "Still life composition" },
    ],
  },
] as const;

export const DIFFERENTIATORS = [
  {
    title: "UNEXPECTED",
    body: "We don't start with trends. We start with ideas.",
  },
  {
    title: "ORIGINAL",
    body: "Every creation begins from a blank page.",
  },
  {
    title: "MEMORABLE",
    body: "A scent should tell a story.",
  },
] as const;

export const COMING_SOON = {
  lines: ["THE FIRST CREATION", "CLASSIFIED", "COMING SOON"],
} as const;

export const JOIN = {
  title: "BE HERE FROM THE BEGINNING",
  subtext: "Get first access to new creations.",
  button: "ENTER BARUCH",
  privacy: "No spam. Only creations worth remembering.",
  success: "You're in.",
} as const;

export const ABOUT = {
  text: "Baruch is an independent fragrance house built around creativity, curiosity, and the pursuit of the unexpected.",
} as const;
