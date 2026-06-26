"use client";

import { NewspaperTypeText } from "@/components/ui/NewspaperTypeText";
import { useNewspaperTypewriter } from "@/hooks/useNewspaperTypewriter";
import { DAILY_FRAGRANCE } from "@/lib/constants";
import {
  displaySegmentText,
  INDEXED_NEWSPAPER_SEGMENTS,
  segmentStarted,
} from "@/lib/newspaperSegments";

export function Manifesto() {
  const { ref, totalTyped, isTyping, animateTyping } = useNewspaperTypewriter();

  const started = (id: string) =>
    !animateTyping || segmentStarted(INDEXED_NEWSPAPER_SEGMENTS, id, totalTyped);

  const lead = displaySegmentText(
    INDEXED_NEWSPAPER_SEGMENTS,
    "lead",
    totalTyped,
    animateTyping,
  );

  return (
    <section
      ref={ref}
      id="vision"
      data-nav-section="newspaper"
      className="section-manifesto newspaper relative overflow-hidden text-[#0a0a0a]"
    >
      <div
        className="newspaper-ticker border-[#0a0a0a] border-y bg-[#0a0a0a] text-[#f2f2f0]"
        aria-hidden={!started("ticker")}
      >
        <p className="newspaper-ticker-type font-mono">
          <NewspaperTypeText
            segmentId="ticker"
            totalTyped={totalTyped}
            isTyping={isTyping}
            animateTyping={animateTyping}
            className="inline"
          />
        </p>
      </div>

      <header className="newspaper-masthead border-[#0a0a0a]/80 border-b-2 border-double pb-3">
        <div className="newspaper-masthead-inner mx-auto max-w-6xl px-6 pt-8 md:px-10 md:pt-10">
          <p className="newspaper-kicker font-mono text-center text-[9px] tracking-[0.35em] uppercase">
            <NewspaperTypeText
              segmentId="kicker"
              totalTyped={totalTyped}
              isTyping={isTyping}
              animateTyping={animateTyping}
            />
          </p>

          <div className="newspaper-nameplate mt-3 border-[#0a0a0a] border-y-4 border-double py-3">
            <h2 className="newspaper-name font-display text-center text-[clamp(2.2rem,7.5vw,4.75rem)] leading-[0.92] font-bold tracking-tight uppercase">
              <NewspaperTypeText
                segmentId="name"
                totalTyped={totalTyped}
                isTyping={isTyping}
                animateTyping={animateTyping}
              />
            </h2>
            <p className="newspaper-tagline font-display mt-2 text-center text-[clamp(0.7rem,1.8vw,0.95rem)] tracking-[0.42em] uppercase">
              <NewspaperTypeText
                segmentId="tagline"
                totalTyped={totalTyped}
                isTyping={isTyping}
                animateTyping={animateTyping}
              />
            </p>
          </div>

          <div className="newspaper-meta font-mono mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-black/20 border-y px-1 py-2 text-[8px] tracking-[0.18em] uppercase md:grid-cols-4 md:text-[9px]">
            <span>
              <NewspaperTypeText segmentId="date" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
            </span>
            <span className="text-center">
              <NewspaperTypeText segmentId="edition" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
            </span>
            <span className="text-center">
              <NewspaperTypeText segmentId="volume" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
            </span>
            <span className="text-right">
              <NewspaperTypeText segmentId="price" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
            </span>
          </div>

          <p className="newspaper-weather font-mono mt-2 text-center text-[8px] tracking-[0.28em] uppercase">
            <NewspaperTypeText segmentId="weather" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
          </p>
        </div>
      </header>

      <div className="newspaper-body mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="newspaper-fold font-mono mb-8 flex items-center gap-3 text-[8px] tracking-[0.35em] uppercase">
          <span className="h-px flex-1 bg-black/25" />
          <NewspaperTypeText segmentId="fold" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
          <span className="h-px flex-1 bg-black/25" />
        </div>

        <div className="newspaper-main-grid mb-10 grid gap-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,0.75fr)] lg:gap-12">
          <div>
            <p className="newspaper-dateline font-mono mb-4 text-[9px] tracking-[0.28em] uppercase">
              <NewspaperTypeText segmentId="dateline" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
            </p>

            <h3 className="newspaper-headline font-display mb-5 text-[clamp(2rem,6.5vw,4.25rem)] leading-[0.95] font-bold tracking-tight uppercase">
              <NewspaperTypeText segmentId="headline" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
            </h3>

            <p className="newspaper-deck font-display mb-6 max-w-3xl text-xl leading-snug italic md:text-2xl">
              <NewspaperTypeText segmentId="deck" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
            </p>

            <div className="newspaper-photo-box mb-6 border border-black/30 p-2">
              <div className="newspaper-photo-placeholder flex aspect-[16/7] items-center justify-center border border-black/15 bg-black/[0.03]">
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-45">
                  <NewspaperTypeText segmentId="photo" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
                </p>
              </div>
              <p className="newspaper-photo-caption font-mono mt-2 text-[8px] leading-relaxed tracking-[0.12em] uppercase">
                <NewspaperTypeText segmentId="caption" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
              </p>
            </div>

            <p className="newspaper-lead newspaper-column-text font-sans mb-6 text-[15px] leading-relaxed md:text-base">
              {lead.length > 0 ? (
                <span className="newspaper-dropcap font-display float-left mt-1 mr-2 text-5xl leading-[0.8] font-bold">
                  T
                </span>
              ) : null}
              {lead.length > 1 ? lead.slice(1) : null}
              {isTyping && activeSegmentIs("lead", totalTyped) ? (
                <span className="newspaper-type-cursor" aria-hidden="true" />
              ) : null}
            </p>

            <div className="newspaper-columns border-black/25 border-t pt-8">
              {DAILY_FRAGRANCE.columns.map((line, index) => (
                <article key={line} className="newspaper-column">
                  {started(`column-${index}`) ? (
                    <p className="font-mono mb-2 text-[8px] tracking-[0.25em] uppercase">¶ {index + 1}</p>
                  ) : null}
                  <p className="newspaper-column-text font-sans text-[15px] leading-relaxed md:text-base">
                    <NewspaperTypeText
                      segmentId={`column-${index}`}
                      totalTyped={totalTyped}
                      isTyping={isTyping} animateTyping={animateTyping}
                    />
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="newspaper-sidebar space-y-6">
            <div className="newspaper-sidebar-box border border-black/25 p-4">
              <p className="font-mono mb-3 border-black/20 border-b pb-2 text-[8px] tracking-[0.3em] uppercase">
                <NewspaperTypeText
                  segmentId="sidebar-inside-label"
                  totalTyped={totalTyped}
                  isTyping={isTyping} animateTyping={animateTyping}
                />
              </p>
              <ul className="space-y-2">
                {DAILY_FRAGRANCE.sidebar[0].items.map((item, index) => (
                  <li key={item} className="font-sans text-sm leading-snug">
                    <NewspaperTypeText
                      segmentId={`sidebar-inside-${index}`}
                      totalTyped={totalTyped}
                      isTyping={isTyping} animateTyping={animateTyping}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <blockquote className="newspaper-pull-quote border-[#0a0a0a] border-y-4 border-double px-1 py-5">
              <p className="font-display text-2xl leading-tight italic md:text-[1.65rem]">
                <NewspaperTypeText segmentId="pull-quote" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
              </p>
            </blockquote>

            <div className="newspaper-sidebar-box border border-black/25 p-4">
              <p className="font-mono mb-3 text-[8px] tracking-[0.3em] uppercase">
                <NewspaperTypeText
                  segmentId="sidebar-record-label"
                  totalTyped={totalTyped}
                  isTyping={isTyping} animateTyping={animateTyping}
                />
              </p>
              <p className="font-display text-lg leading-snug italic">
                <NewspaperTypeText
                  segmentId="sidebar-record-quote"
                  totalTyped={totalTyped}
                  isTyping={isTyping} animateTyping={animateTyping}
                />
              </p>
              <p className="font-mono mt-3 text-[8px] tracking-[0.15em] uppercase opacity-55">
                <NewspaperTypeText
                  segmentId="sidebar-record-attribution"
                  totalTyped={totalTyped}
                  isTyping={isTyping} animateTyping={animateTyping}
                />
              </p>
            </div>

            <div className="newspaper-mini-chart border-2 border-black p-3">
              <p className="font-mono mb-2 text-[8px] tracking-[0.25em] uppercase">
                <NewspaperTypeText segmentId="chart-label" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
              </p>
              <p className="font-display text-4xl leading-none font-bold">
                <NewspaperTypeText segmentId="chart-value" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
              </p>
              <p className="font-mono mt-2 text-[8px] tracking-[0.15em] uppercase opacity-55">
                <NewspaperTypeText segmentId="chart-note" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
              </p>
            </div>
          </aside>
        </div>

        <div className="newspaper-briefs mb-10 grid gap-6 border-black/25 border-t pt-8 md:grid-cols-3 md:gap-0">
          {DAILY_FRAGRANCE.briefs.map((brief, index) => (
            <article
              key={brief.title}
              className="newspaper-brief md:px-5 md:first:pl-0 md:last:pr-0"
            >
              <p className="font-mono mb-1 text-[8px] tracking-[0.25em] uppercase">
                <NewspaperTypeText
                  segmentId={`brief-${index}-kicker`}
                  totalTyped={totalTyped}
                  isTyping={isTyping} animateTyping={animateTyping}
                />
              </p>
              <h4 className="font-display mb-2 text-xl leading-tight font-bold uppercase">
                <NewspaperTypeText
                  segmentId={`brief-${index}-title`}
                  totalTyped={totalTyped}
                  isTyping={isTyping} animateTyping={animateTyping}
                />
              </h4>
              <p className="newspaper-column-text font-sans text-sm leading-relaxed">
                <NewspaperTypeText
                  segmentId={`brief-${index}-body`}
                  totalTyped={totalTyped}
                  isTyping={isTyping} animateTyping={animateTyping}
                />
              </p>
            </article>
          ))}
        </div>

        <div className="newspaper-classifieds mb-10 border-2 border-black p-4 md:p-5">
          <p className="font-mono mb-4 text-center text-[9px] tracking-[0.4em] uppercase">
            <NewspaperTypeText
              segmentId="classifieds-title"
              totalTyped={totalTyped}
              isTyping={isTyping} animateTyping={animateTyping}
            />
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {DAILY_FRAGRANCE.classifieds.map((ad, index) => (
              <div key={ad.tag} className="newspaper-classified border border-black/15 p-3">
                <p className="font-mono mb-1 text-[8px] tracking-[0.25em] uppercase">
                  <NewspaperTypeText
                    segmentId={`classified-${index}-tag`}
                    totalTyped={totalTyped}
                    isTyping={isTyping} animateTyping={animateTyping}
                  />
                </p>
                <p className="font-sans text-sm leading-snug">
                  <NewspaperTypeText
                    segmentId={`classified-${index}-text`}
                    totalTyped={totalTyped}
                    isTyping={isTyping} animateTyping={animateTyping}
                  />
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="newspaper-editorial border-2 border-double border-[#0a0a0a] px-6 py-8 md:px-10 md:py-10">
          <p className="font-mono mb-3 text-[8px] tracking-[0.35em] uppercase">
            <NewspaperTypeText segmentId="editorial-label" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
          </p>
          <p className="font-display text-2xl leading-tight md:text-3xl">
            <NewspaperTypeText segmentId="editorial-body" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
          </p>
          <p className="font-mono mt-4 text-[8px] tracking-[0.2em] uppercase opacity-50">
            <NewspaperTypeText segmentId="editorial-line" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
          </p>
        </aside>

        <footer className="newspaper-footer font-mono mt-10 border-black/20 border-t pt-6 text-center text-[8px] tracking-[0.22em] uppercase">
          <p>
            <NewspaperTypeText segmentId="footer-1" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
          </p>
          <p className="mt-2 opacity-50">
            <NewspaperTypeText segmentId="footer-2" totalTyped={totalTyped} isTyping={isTyping} animateTyping={animateTyping} />
          </p>
        </footer>
      </div>
    </section>
  );
}

function activeSegmentIs(id: string, totalTyped: number) {
  const segment = INDEXED_NEWSPAPER_SEGMENTS.find((item) => item.id === id);
  if (!segment) return false;
  return totalTyped >= segment.start && totalTyped < segment.end;
}
