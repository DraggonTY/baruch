import { FadeInWhenVisible } from "@/components/motion/FadeInWhenVisible";
import { EmailSignupForm } from "@/components/ui/EmailSignupForm";
import { JOIN } from "@/lib/constants";

export function JoinCommunity() {
  return (
    <section id="join" className="relative z-10 overflow-hidden px-6 py-28 md:px-12 md:py-36">
      <div className="relative mx-auto max-w-2xl text-center">
        <FadeInWhenVisible>
          <p className="font-mono mb-6 text-[10px] tracking-[0.55em] text-white/40 uppercase">
            Transmission
          </p>
          <h2 className="font-display mb-6 text-4xl leading-tight font-light tracking-wide text-white md:text-5xl">
            {JOIN.title}
          </h2>
          <p className="mx-auto mb-14 max-w-md text-base leading-relaxed text-white/65 md:text-lg">
            {JOIN.subtext}
          </p>

          <div className="rounded-sm border border-white/15 bg-white/[0.04] p-8 backdrop-blur-sm md:p-10">
            <EmailSignupForm theme="dark" />
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
