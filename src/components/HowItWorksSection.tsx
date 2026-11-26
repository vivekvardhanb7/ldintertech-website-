import { useState } from 'react';
import { WORKFLOW_STEPS } from '../data/vendingCatalog';

export function HowItWorksSection() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const current = WORKFLOW_STEPS[activeStepIdx];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#10100F] border-b border-white/10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A374FF] font-medium mb-3">
            How Smart Vending Works
          </p>
          <h2
            className="font-display text-3xl sm:text-5xl font-semibold text-[#FCFCFC] leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Five Seamless Stages From Approach to Cloud Insights.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Step Selector List */}
          <div className="lg:col-span-6 space-y-3" role="tablist" aria-label="Smart vending workflow stages">
            {WORKFLOW_STEPS.map((item, idx) => {
              const isSelected = idx === activeStepIdx;
              return (
                <button
                  key={item.step}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveStepIdx(idx)}
                  className={`w-full text-left p-5 rounded-xl border transition-colors duration-150 cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'bg-[#1A1A1E] border-[#A374FF]'
                      : 'bg-[#161615] border-white/10 hover:border-white/25'
                  }`}
                >
                  <span
                    className={`font-mono-tabular text-sm font-semibold shrink-0 mt-0.5 ${
                      isSelected ? 'text-[#A374FF]' : 'text-[#8C8C88]'
                    }`}
                  >
                    {item.step}
                  </span>
                  <div className="space-y-1">
                    <div className="font-display text-lg font-semibold text-[#FCFCFC]">
                      {item.title}
                    </div>
                    <p className="text-sm text-[#B8B8B4]">{item.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Synchronized Kiosk UI & Telemetry Preview */}
          <div className="lg:col-span-6 rounded-2xl bg-[#161615] border border-white/10 p-6 sm:p-10 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-mono-tabular text-[#9ECFFA]">
                  Stage {current.step} · {current.title}
                </span>
                <span className="text-xs font-mono-tabular text-[#8C8C88]">
                  {current.telemetryTag}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#FCFCFC]">
                {current.summary}
              </h3>
              <p className="text-base text-[#B8B8B4] leading-relaxed">{current.detail}</p>
            </div>

            {/* Simulated Kiosk Display Bezel */}
            <div className="rounded-xl bg-[#10100F] border border-white/15 p-5 space-y-5">
              <div className="flex items-center justify-between text-xs font-mono-tabular text-[#8C8C88]">
                <span>KIOSK TOUCHSCREEN STATE</span>
                <span>{current.step} / 05</span>
              </div>

              <div className="p-4 rounded-lg bg-[#1A1A1E] border border-white/10">
                <div className="text-xs text-[#A374FF] font-mono-tabular mb-1">
                  Active Display State
                </div>
                <div className="text-base sm:text-lg font-semibold text-[#FCFCFC]">
                  {current.screenState}
                </div>
              </div>

              {/* 5-step progress track */}
              <div className="grid grid-cols-5 gap-2">
                {WORKFLOW_STEPS.map((s, idx) => (
                  <div
                    key={s.step}
                    className={`h-1.5 rounded-full transition-colors ${
                      idx <= activeStepIdx ? 'bg-[#A374FF]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
