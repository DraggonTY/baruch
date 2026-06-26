"use client";

import { useEffect } from "react";
import { InkPen } from "@/components/ui/InkPen";
import { HeroAbstractField } from "@/components/ui/HeroAbstractField";
import { LiquidLogo } from "@/components/ui/LiquidLogo";
import { useHeroThemeMorph } from "@/hooks/useHeroThemeMorph";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HERO_THEMES } from "@/lib/heroThemes";
import { HERO } from "@/lib/constants";

function layerSize(theme: { id: string; atmosphereSize?: string; abstractSize?: string }, layer: "atmosphere" | "abstract") {
  if (layer === "atmosphere" && theme.atmosphereSize) return theme.atmosphereSize;
  if (layer === "abstract" && theme.abstractSize) return theme.abstractSize;
  return undefined;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { snapshot, visualStateRef } = useHeroThemeMorph(prefersReducedMotion);
  const { theme, themeIndex, morphProgress } = snapshot;
  const isMorphing = morphProgress > 0 && morphProgress < 1;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const hero = document.getElementById("hero");
    if (!hero) return;
    const visualState = visualStateRef.current;
    let frame = 0;

    const updateScrollFade = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.06;
      const end = vh * 0.78;
      const progress = clamp01((start - rect.top) / (end - start));
      const fade = easeInOutCubic(progress);

      visualState.scrollFade = fade;
      hero.style.setProperty("--hero-exit-fade", fade.toFixed(3));
    };
    const requestScrollFadeUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollFade);
    };

    updateScrollFade();
    window.addEventListener("scroll", requestScrollFadeUpdate, { passive: true });
    window.addEventListener("resize", requestScrollFadeUpdate);

    return () => {
      window.removeEventListener("scroll", requestScrollFadeUpdate);
      window.removeEventListener("resize", requestScrollFadeUpdate);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      hero.style.removeProperty("--hero-exit-fade");
      visualState.scrollFade = 0;
    };
  }, [prefersReducedMotion, visualStateRef]);

  return (
    <section
      id="hero"
      data-nav-section="hero"
      data-hero-theme={theme.id}
      className="hero-section relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20 md:px-10"
      style={{
        isolation: "isolate",
        backgroundColor: snapshot.bg,
        color: snapshot.text,
        borderBottom: `1px solid ${snapshot.border}`,
        transition: prefersReducedMotion ? undefined : "color 0.1s linear",
      }}
    >
      <div className="hero-theme-atmosphere hero-exit-fade-layer pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            opacity: snapshot.fromAtmosphereOpacity,
            backgroundImage: snapshot.fromTheme.atmosphere,
            backgroundSize: layerSize(snapshot.fromTheme, "atmosphere"),
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: snapshot.toAtmosphereOpacity,
            backgroundImage: snapshot.toTheme.atmosphere,
            backgroundSize: layerSize(snapshot.toTheme, "atmosphere"),
          }}
        />
      </div>

      <div className="hero-theme-abstract hero-exit-fade-layer pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
        <div
          className={`hero-abstract-layer hero-abstract-layer--${snapshot.fromTheme.abstractMotion} absolute inset-0`}
          style={{
            opacity: snapshot.fromAbstractOpacity,
            backgroundImage: snapshot.fromTheme.abstract,
            backgroundSize: layerSize(snapshot.fromTheme, "abstract"),
          }}
        />
        <div
          className={`hero-abstract-layer hero-abstract-layer--${snapshot.toTheme.abstractMotion} absolute inset-0`}
          style={{
            opacity: snapshot.toAbstractOpacity,
            backgroundImage: snapshot.toTheme.abstract,
            backgroundSize: layerSize(snapshot.toTheme, "abstract"),
          }}
        />
        <div className="hero-theme-grain absolute inset-0 opacity-[0.09]" aria-hidden="true" />
      </div>

      <div
        className={`hero-motif-overlay hero-motif-overlay--${theme.id} hero-exit-fade-layer`}
        aria-hidden="true"
      />

      <div className="hero-exit-fade-layer absolute inset-0 z-[3]">
        <HeroAbstractField visualStateRef={visualStateRef} patternIndex={themeIndex} />
      </div>

      <div
        className={`hero-theme-flash pointer-events-none absolute inset-0 z-[4] ${isMorphing ? "hero-theme-flash--active" : ""}`}
        aria-hidden="true"
      />

      <div
        className={`hero-theme-vignette pointer-events-none absolute inset-0 z-[4] ${isMorphing ? "hero-theme-vignette--active" : ""}`}
        style={{ color: snapshot.text }}
        aria-hidden="true"
      />

      <div className="hero-exit-fade-layer absolute inset-0 z-[5]">
        <InkPen visualStateRef={visualStateRef} />
      </div>

      <div className="hero-exit-veil pointer-events-none absolute inset-x-0 bottom-0 z-[8]" aria-hidden="true" />

      <div
        className="hero-theme-copy pointer-events-none relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        style={{
          transform: prefersReducedMotion
            ? undefined
            : `scale(${isMorphing ? 1 + Math.sin(morphProgress * Math.PI) * 0.012 : 1}) rotate(${
                isMorphing ? Math.sin(morphProgress * Math.PI) * 0.4 : 0
              }deg)`,
          transition: prefersReducedMotion ? undefined : "transform 0.3s ease",
        }}
      >
        <div className="pointer-events-none w-fit">
          <LiquidLogo logoFilter={snapshot.logoFilter} heroTone={theme.heroTone} />
        </div>

        <div className="mb-5 min-h-[1.5rem] w-full">
          <p
            key={`tagline-${themeIndex}`}
            className="hero-copy-swap hero-theme-tagline text-[11px] font-medium tracking-[0.32em] uppercase md:text-xs"
            style={{ color: snapshot.text }}
          >
            {HERO.tagline}
          </p>
        </div>

        <div className="mb-12 min-h-[4.5rem] w-full max-w-lg">
          <p
            key={`subtext-${themeIndex}`}
            className="hero-copy-swap hero-copy-swap--delay-1 hero-theme-body text-base leading-relaxed md:text-lg"
            style={{ color: snapshot.textMuted }}
          >
            {HERO.subtext}
          </p>
        </div>

        <div className="pointer-events-auto min-h-[3rem]">
          <a
            key={`cta-${themeIndex}`}
            href="#join"
            className="hero-copy-swap hero-copy-swap--delay-2 hero-theme-cta hero-cta inline-flex items-center justify-center px-8 py-3.5 text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-500"
            style={{
              backgroundColor: snapshot.ctaBg,
              color: snapshot.ctaText,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = snapshot.ctaHoverBg;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = snapshot.ctaBg;
            }}
          >
            {HERO.cta}
          </a>
        </div>

        <div className="mt-14 min-h-[1rem] w-full">
          <p
            key={`hint-${themeIndex}`}
            className="hero-copy-swap hero-copy-swap--delay-3 hero-theme-hint mt-0 text-[10px] tracking-[0.28em] uppercase"
            style={{ color: snapshot.textFaint }}
          >
            click or drag to draw — ink fades
          </p>
        </div>
      </div>

      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
          aria-hidden="true"
        >
          {HERO_THEMES.map((item, index) => (
            <span
              key={item.id}
              className="hero-theme-dot h-1 rounded-full transition-all duration-700"
              style={{
                width: index === themeIndex ? "1.25rem" : "0.25rem",
                backgroundColor: index === themeIndex ? snapshot.text : snapshot.textFaint,
                opacity: index === themeIndex ? 0.85 : 0.35,
              }}
              title={item.label}
            />
          ))}
        </div>
      )}
    </section>
  );
}
