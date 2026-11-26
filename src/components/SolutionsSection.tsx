import { ArrowRight, Check } from 'lucide-react';
import {
  VENDING_SOLUTIONS,
  type MachineCategoryId,
  type VendingSolution,
} from '../data/vendingCatalog';
import { ResilientImage } from './ResilientImage';

interface SolutionsSectionProps {
  activeCategory: MachineCategoryId;
  onSelectCategory: (id: MachineCategoryId) => void;
  onOpenModal: (machine: VendingSolution) => void;
  onInquireCategory: (machine: VendingSolution) => void;
}

const CTA_LABELS: Record<MachineCategoryId, string> = {
  medical: 'Explore Medical Solutions',
  pizza: 'Explore Pizza Solutions',
  snacks: 'Explore Snack Solutions',
  return: 'Explore Return Solutions',
};

export function SolutionsSection({
  activeCategory,
  onSelectCategory,
  onOpenModal,
  onInquireCategory,
}: SolutionsSectionProps) {
  const activeMachine =
    VENDING_SOLUTIONS.find((s) => s.id === activeCategory) || VENDING_SOLUTIONS[0];

  return (
    <section id="solutions" className="py-20 sm:py-28 bg-[#10100F] border-b border-white/10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Section Header + Category Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[#A374FF] font-medium mb-3">
              Our Vending Machine Solutions
            </p>
            <h2
              className="font-display text-3xl sm:text-5xl font-semibold text-[#FCFCFC] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Four Purpose-Built Smart Hardware Platforms.
            </h2>
          </div>

          <div
            className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#161615] border border-white/10"
            role="tablist"
            aria-label="Vending machine category tabs"
          >
            {VENDING_SOLUTIONS.map((sol) => {
              const isSelected = sol.id === activeCategory;
              return (
                <button
                  key={sol.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectCategory(sol.id)}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#A374FF] text-[#10100F] font-semibold'
                      : 'text-[#B8B8B4] hover:text-[#FCFCFC]'
                  }`}
                >
                  {sol.categoryLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Spotlight Transformation View */}
        <div className="rounded-2xl bg-[#161615] border border-white/10 overflow-hidden mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-5 bg-[#10100F] flex items-center justify-center p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="w-full max-w-[380px] aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                <ResilientImage
                  src={activeMachine.image}
                  alt={activeMachine.categoryLabel}
                  fallbackGradient={activeMachine.fallbackGradient}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <div className="text-xs font-medium text-[#9ECFFA]">
                  {activeMachine.categoryLabel} · {activeMachine.environmentTag}
                </div>
                <h3
                  className="font-display text-2xl sm:text-4xl font-semibold text-[#FCFCFC] leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {activeMachine.headline}
                </h3>
                <p className="text-base text-[#B8B8B4] leading-relaxed max-w-2xl">
                  {activeMachine.description}
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {activeMachine.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-[#D0D0CC]">
                      <Check className="w-4 h-4 text-[#A374FF] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
                  {activeMachine.specifications.slice(0, 3).map((spec) => (
                    <div key={spec.label} className="p-3 rounded-lg bg-[#10100F] border border-white/10">
                      <div className="text-[11px] text-[#8C8C88]">{spec.label}</div>
                      <div className="text-xs sm:text-sm font-medium text-[#FCFCFC] font-mono-tabular mt-1">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onOpenModal(activeMachine)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#10100F] bg-[#A374FF] hover:bg-[#FCFCFC] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>{CTA_LABELS[activeMachine.id]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onInquireCategory(activeMachine)}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#FCFCFC] border border-white/20 hover:border-[#A374FF] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Request Configuration Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Category Index: All 4 Machine Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VENDING_SOLUTIONS.map((sol, idx) => (
            <article
              key={sol.id}
              className={`rounded-2xl border transition-colors duration-150 overflow-hidden flex flex-col sm:flex-row items-stretch ${
                sol.id === activeCategory
                  ? 'bg-[#1A1A1D] border-[#A374FF]/60'
                  : 'bg-[#161615] border-white/10 hover:border-white/25'
              }`}
            >
              <div className="sm:w-48 shrink-0 bg-[#10100F] aspect-[3/4] sm:aspect-auto">
                <ResilientImage
                  src={sol.image}
                  alt={sol.categoryLabel}
                  fallbackGradient={sol.fallbackGradient}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col justify-between gap-4 flex-1">
                <div>
                  <div className="text-xs font-mono-tabular text-[#8C8C88] mb-1">
                    0{idx + 1} · {sol.categoryLabel}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#FCFCFC] leading-snug">
                    {sol.headline}
                  </h3>
                  <p className="mt-2 text-sm text-[#B8B8B4] line-clamp-3 leading-relaxed">
                    {sol.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(sol.id);
                      onOpenModal(sol);
                    }}
                    className="text-xs font-semibold text-[#A374FF] hover:text-[#FCFCFC] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {CTA_LABELS[sol.id]} →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
