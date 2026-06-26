"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { getHeroNavTokens } from "@/lib/heroNavTheme";

type NavTheme = "hero" | "newspaper" | "lab" | "swiss" | "space" | "gallery";

const NAV_THEMES: NavTheme[] = ["hero", "newspaper", "lab", "swiss", "space", "gallery"];

function isNavTheme(value: string | null): value is NavTheme {
  return value !== null && NAV_THEMES.includes(value as NavTheme);
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<NavTheme>("hero");
  const [heroThemeId, setHeroThemeId] = useState("paper");
  const scrolledRef = useRef(false);

  useEffect(() => {
    let frame = 0;

    const updateScrolled = () => {
      frame = 0;
      const next = window.scrollY > 24;
      if (scrolledRef.current === next) return;
      scrolledRef.current = next;
      setScrolled(next);
    };
    const requestScrolledUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrolled);
    };

    updateScrolled();
    window.addEventListener("scroll", requestScrolledUpdate, { passive: true });
    return () => {
      window.removeEventListener("scroll", requestScrolledUpdate);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const readHeroTheme = () => {
      setHeroThemeId(hero.getAttribute("data-hero-theme") ?? "paper");
    };

    readHeroTheme();
    const observer = new MutationObserver(readHeroTheme);
    observer.observe(hero, { attributes: true, attributeFilter: ["data-hero-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-nav-section]");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const active = visible.reduce((best, entry) =>
          entry.intersectionRatio > best.intersectionRatio ? entry : best,
        );

        const next = active.target.getAttribute("data-nav-section");
        if (isNavTheme(next)) {
          setTheme(next);
        }
      },
      { rootMargin: "-22% 0px -52% 0px", threshold: [0, 0.12, 0.3, 0.5, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const heroNav = useMemo(() => getHeroNavTokens(heroThemeId), [heroThemeId]);
  const heroNavLive = theme === "hero" && !scrolled;

  const headerStyle = heroNavLive
    ? ({
        "--nav-link": heroNav.navLink,
        "--nav-link-hover": heroNav.navLinkHover,
        "--nav-logo-filter": heroNav.logoFilter,
      } as React.CSSProperties)
    : undefined;

  const handleNavClick = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`site-nav site-nav--${theme} ${scrolled ? "site-nav--scrolled" : ""} ${heroNavLive ? "site-nav--hero-live" : ""}`}
        data-hero-tone={heroNavLive ? heroNav.heroTone : undefined}
        style={headerStyle}
      >
        {scrolled ? (
          <div className="site-nav-texture" aria-hidden="true">
            <span className="site-nav-texture-base" />
            <span className="site-nav-texture-pattern" />
            <span className="site-nav-texture-grain" />
            <span className="site-nav-texture-lines" />
          </div>
        ) : null}

        <nav className="site-nav-inner mx-auto flex max-w-6xl flex-col items-center px-6 pt-4 pb-3 md:px-8 md:pt-5 md:pb-4">
          <a
            href="#hero"
            className="site-nav-logo relative z-50 mb-3 flex items-center justify-center md:mb-4"
            onClick={handleNavClick}
          >
            <Image
              src="/logo.png"
              alt={SITE.name}
              width={200}
              height={106}
              className="h-12 w-auto transition-[filter] duration-500 md:h-16"
              style={{
                filter: heroNavLive ? heroNav.logoFilter : undefined,
              }}
              priority
            />
          </a>

          <div className="relative flex w-full items-center justify-center">
            <ul className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="site-nav-link text-xs tracking-[0.18em] uppercase">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="site-nav-menu-btn absolute right-0 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`site-nav-menu-line block h-px w-6 transition-transform duration-300 ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`site-nav-menu-line block h-px w-6 transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`site-nav-menu-line block h-px w-6 transition-transform duration-300 ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`site-nav-mobile site-nav-mobile--${theme} fixed inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-300 md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="site-nav-mobile-texture" aria-hidden="true">
          <span className="site-nav-mobile-texture-base" />
          <span className="site-nav-mobile-texture-pattern" />
          <span className="site-nav-mobile-texture-grain" />
          <span className="site-nav-mobile-texture-lines" />
        </div>

        <ul className="flex flex-col items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="site-nav-mobile-link font-display text-2xl tracking-[0.2em] uppercase"
                onClick={handleNavClick}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
