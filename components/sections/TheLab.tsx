import { LabImageCluster } from "@/components/sections/LabImageCluster";
import { FadeInWhenVisible } from "@/components/motion/FadeInWhenVisible";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LAB_STEPS } from "@/lib/constants";

const marginNotes = ["raw", "unstable", "forming"];

export function TheLab() {
  return (
    <section
      id="lab"
      data-nav-section="lab"
      className="section-lab relative overflow-visible px-6 py-24 md:px-12 md:py-32"
    >
      <p
        className="font-mono pointer-events-none absolute top-12 right-6 text-[9px] tracking-[0.4em] text-foreground/25 uppercase [writing-mode:vertical-rl]"
        aria-hidden="true"
      >
        observation log
      </p>

      <div className="mx-auto max-w-6xl">
        <FadeInWhenVisible>
          <div className="relative">
            <div className="lab-stamp-open font-mono" aria-hidden="true">
              Open
            </div>
            <SectionHeading className="mb-2">The Lab</SectionHeading>
            <p className="font-mono mb-16 text-[10px] tracking-[0.3em] text-foreground/45 uppercase">
              case file — ref. BX-2026-014
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="space-y-28 md:space-y-40">
          {LAB_STEPS.map((step, stepIndex) => (
            <FadeInWhenVisible key={step.label} delay={stepIndex * 0.1} className="overflow-visible">
              <div
                className={`grid gap-12 overflow-visible md:grid-cols-2 md:gap-20 ${
                  stepIndex % 2 === 1 ? "md:[direction:rtl]" : ""
                }`}
              >
                <div
                  className={`flex flex-col justify-center md:[direction:ltr] ${
                    stepIndex % 2 === 1 ? "md:pl-8" : "md:pr-8"
                  }`}
                >
                  <p className="font-mono mb-3 text-[10px] tracking-[0.35em] text-foreground/45 uppercase">
                    {String(stepIndex + 1).padStart(2, "0")} — {marginNotes[stepIndex]}
                  </p>
                  <h3 className="font-display mb-4 text-4xl font-semibold tracking-wide text-foreground md:text-5xl">
                    {step.label}
                  </h3>
                  <p className="font-display text-xl text-foreground/55 italic md:text-2xl">
                    &ldquo;{step.quote}&rdquo;
                  </p>
                </div>

                <div className="overflow-visible md:[direction:ltr]">
                  <LabImageCluster stepIndex={stepIndex} images={step.images} />
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
