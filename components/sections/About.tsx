import Image from "next/image";
import { FadeInWhenVisible } from "@/components/motion/FadeInWhenVisible";
import { ABOUT } from "@/lib/constants";

export function About() {
  return (
    <section id="about" data-nav-section="gallery" className="section-gallery px-6 py-32 md:px-12 md:py-40">
      <div className="mx-auto max-w-xl">
        <FadeInWhenVisible>
          <div className="gallery-frame px-10 py-16 text-center md:px-16 md:py-20">
            <p className="font-mono mb-12 text-[9px] tracking-[0.55em] text-foreground/35 uppercase">
              Gallery Note — 2026
            </p>

            <Image
              src="/logo.png"
              alt="BARUCH"
              width={80}
              height={42}
              className="mx-auto mb-12 h-auto w-16 opacity-60"
            />

            <p className="font-display text-2xl leading-[1.6] font-light text-foreground/80 md:text-[1.65rem]">
              {ABOUT.text}
            </p>

            <div className="mx-auto mt-14 h-px w-12 bg-foreground/15" aria-hidden="true" />
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
