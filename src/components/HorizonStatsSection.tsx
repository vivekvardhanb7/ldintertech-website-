import { useEffect, useRef, useState } from 'react';
import { SIGNATURE_STATS } from '../data/vendingCatalog';

export function HorizonStatsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>(() => SIGNATURE_STATS.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCounts(SIGNATURE_STATS.map((s) => s.target));
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = performance.now();
          const duration = 950;
          const step = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCounts(SIGNATURE_STATS.map((s) => Math.round(s.target * eased)));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      id="horizon-metrics"
      className="relative bg-[#10100F] border-b border-white/10"
    >
      {/* Horizon Transition Arc */}
      <div className="relative h-24 sm:h-32 overflow-hidden flex items-end justify-center">
        <div
          aria-hidden="true"
          className="w-[150%] h-48 rounded-[100%] border-t border-[#A374FF]/45 bg-gradient-to-b from-[#A374FF]/12 via-[#161615] to-[#161615] translate-y-24"
        />
      </div>

      {/* Pinned-style Architectural Metric Strip */}
      <div className="bg-[#161615] py-16 sm:py-24">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28 mb-10 lg:mb-0">
              <p className="text-xs uppercase tracking-[0.18em] text-[#A374FF] font-medium mb-3">
                Horizon Architecture
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl font-semibold text-[#FCFCFC] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Engineered for continuous, unattended commercial operation.
              </h2>
              <p className="mt-4 text-sm text-[#B8B8B4] leading-relaxed">
                Every LD Intertech smart vending platform unifies ruggedized industrial enclosures, interactive capacitive interfaces, and cloud telemetry.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {SIGNATURE_STATS.map((stat, idx) => (
                <div
                  key={stat.id}
                  className="p-7 rounded-xl bg-[#10100F] border border-white/10 flex flex-col justify-between"
                >
                  <div className="font-display font-semibold text-5xl sm:text-6xl tracking-tight text-[#FCFCFC] font-mono-tabular">
                    {counts[idx]}
                    <span className="text-[#A374FF]">{stat.suffix}</span>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-base font-semibold text-[#FCFCFC]">{stat.label}</h3>
                    <p className="mt-1 text-xs text-[#8C8C88] leading-relaxed">
                      {stat.context}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
