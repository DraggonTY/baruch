import { FadeInWhenVisible } from "@/components/motion/FadeInWhenVisible";
import { DIFFERENTIATORS } from "@/lib/constants";

export function Differentiators() {
  return (
    <section data-nav-section="swiss" className="section-swiss text-foreground">
      <div className="border-foreground border-b-4 px-6 py-6 md:px-12">
        <p className="font-sans text-[10px] font-semibold tracking-[0.5em] uppercase">Baruch Principles</p>
      </div>

      {DIFFERENTIATORS.map((card, index) => (
        <FadeInWhenVisible key={card.title}>
          <article className="border-foreground grid min-h-[40vh] grid-cols-1 border-b-4 md:grid-cols-[1fr_2fr]">
            <div className="flex items-end border-foreground p-8 md:border-r-4 md:p-12">
              <span className="font-sans text-[clamp(4rem,15vw,10rem)] leading-none font-bold tracking-tighter text-foreground/10">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <h3 className="font-sans mb-4 text-sm font-bold tracking-[0.35em] uppercase">{card.title}</h3>
              <p className="font-sans max-w-md text-xl leading-relaxed font-light md:text-2xl">{card.body}</p>
            </div>
          </article>
        </FadeInWhenVisible>
      ))}
    </section>
  );
}
