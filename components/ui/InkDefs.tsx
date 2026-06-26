export function InkDefs() {
  return (
    <svg
      className="pointer-events-none absolute h-0 w-0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="ink-roughen" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="4"
            seed="8"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>

        <filter id="ink-roughen-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03"
            numOctaves="3"
            seed="3"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="1.2" />
        </filter>

        <radialGradient id="ink-pool" cx="42%" cy="38%" r="58%" fx="38%" fy="32%">
          <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.92" />
          <stop offset="28%" stopColor="#0a0a0a" stopOpacity="0.55" />
          <stop offset="52%" stopColor="#0a0a0a" stopOpacity="0.22" />
          <stop offset="72%" stopColor="#0a0a0a" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="ink-pool-light" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.7" />
          <stop offset="35%" stopColor="#0a0a0a" stopOpacity="0.28" />
          <stop offset="65%" stopColor="#0a0a0a" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="ink-cursor" cx="48%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#050505" stopOpacity="0.95" />
          <stop offset="22%" stopColor="#0a0a0a" stopOpacity="0.65" />
          <stop offset="48%" stopColor="#0a0a0a" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
