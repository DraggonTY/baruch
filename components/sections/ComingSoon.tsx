import { FadeInWhenVisible } from "@/components/motion/FadeInWhenVisible";
import { COMING_SOON } from "@/lib/constants";

export function ComingSoon() {
  return (
    <section className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center overflow-visible px-6 py-24 text-white">
      <FadeInWhenVisible>
        <p className="font-mono mb-10 text-center text-[10px] tracking-[0.45em] text-white/55 uppercase">
          {COMING_SOON.lines[0]}
        </p>
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.1}>
        <div className="space-door">
          <div className="space-door-frame">
            <div className="space-door-opening" aria-hidden="true">
              <div className="space-door-light-depth" />
              <div className="space-door-light-source" />
              <div className="space-door-gap-spill" />
              <div className="space-door-light-shaft" />
            </div>

            <div className="space-door-panel">
              <div className="space-door-panel-surface" aria-hidden="true" />
            </div>
            <div className="space-door-exterior-beam" aria-hidden="true" />
            <div className="space-door-exterior-beam space-door-exterior-beam--soft" aria-hidden="true" />
            <div className="space-door-exterior-beam space-door-exterior-beam--wide" aria-hidden="true" />

            <div className="space-door-arch" aria-hidden="true" />
            <div className="space-door-threshold" aria-hidden="true" />
          </div>

          <div className="space-door-floor-light" aria-hidden="true" />
        </div>
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.2}>
        <p className="font-mono mt-12 text-center text-xs tracking-[0.5em] text-white/70 uppercase">
          {COMING_SOON.lines[2]}
        </p>
        <p className="font-mono mt-6 max-w-xs text-center text-[9px] leading-relaxed tracking-wider text-white/45 uppercase">
          beyond this door — something is forming
        </p>
      </FadeInWhenVisible>
    </section>
  );
}
