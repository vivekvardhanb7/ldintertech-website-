import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { VENDING_SOLUTIONS, type MachineCategoryId } from '../data/vendingCatalog';
import { HeroMachineCanvas } from './three/HeroMachineCanvas';
import { MagneticButton } from './MagneticButton';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  scrollProgressRef: React.MutableRefObject<number>;
  activeCategory: MachineCategoryId;
  onSelectCategory: (id: MachineCategoryId) => void;
  onNavigate: (sectionId: string) => void;
  reducedMotion: boolean;
}

export function HeroSection({
  scrollProgressRef,
  activeCategory,
  onSelectCategory,
  onNavigate,
  reducedMotion,
}: HeroSectionProps) {
  const activeMachine =
    VENDING_SOLUTIONS.find((item) => item.id === activeCategory) || VENDING_SOLUTIONS[2];

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-20 pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-[#10100F] border-b border-white/10"
    >
      {/* Subtle architectural radial glow behind the 3D machine */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 72% 48%, rgba(163, 116, 255, 0.14) 0%, rgba(158, 207, 250, 0.05) 32%, rgba(16, 16, 15, 0) 68%)',
        }}
      />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-7 z-10">
            <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-[#9ECFFA]">
              Smart Vending · Limitless Possibilities
            </p>

            <h1
              className="font-display font-semibold tracking-tight text-[#FCFCFC] leading-[1.04]"
              style={{
                fontSize: 'clamp(2.5rem, 4.4vw, 4.25rem)',
                textWrap: 'balance',
              }}
            >
              The Future of Vending Is Already Here.
            </h1>

            <p className="text-base sm:text-lg text-[#B8B8B4] max-w-xl leading-relaxed">
              Intelligent vending solutions designed to transform how people access food, essentials and everyday products across modern spaces.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <MagneticButton
                type="button"
                onClick={() => onNavigate('solutions')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-[#10100F] bg-[#A374FF] hover:bg-[#FCFCFC] rounded-lg cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCFCFC]"
              >
                <span>Explore Our Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>

              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#FCFCFC] border border-white/20 hover:border-[#A374FF] hover:bg-white/5 rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A374FF]"
              >
                <span>Talk to Our Team</span>
                <ArrowDownRight className="w-4 h-4 text-[#9ECFFA]" />
              </button>
            </div>

            {/* Interactive 3D Machine Lighting / Category Selector */}
            <div className="pt-6 border-t border-white/10">
              <div className="text-xs font-medium text-[#8C8C88] mb-3">
                Preview 3D Hardware Architecture
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Hero machine category selector">
                {VENDING_SOLUTIONS.map((sol) => {
                  const selected = sol.id === activeCategory;
                  return (
                    <button
                      key={sol.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => onSelectCategory(sol.id)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        selected
                          ? 'bg-[#FCFCFC] text-[#10100F] border-[#FCFCFC]'
                          : 'bg-[#161615] text-[#B8B8B4] border-white/10 hover:text-[#FCFCFC] hover:border-white/25'
                      }`}
                    >
                      {sol.categoryLabel}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-[#8C8C88]">
                {activeMachine.environmentTag}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive 3D Smart Vending Machine Viewport */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Desktop / Tablet interactive Three.js 3D viewport */}
            <div className="hidden md:block w-full h-[540px] lg:h-[640px] rounded-2xl border border-white/10 bg-[#141413]/70 overflow-hidden">
              <HeroMachineCanvas
                scrollProgressRef={scrollProgressRef}
                activeCategory={activeCategory}
                reducedMotion={reducedMotion}
                fallbackImage={activeMachine.image}
                fallbackAlt={activeMachine.categoryLabel}
              />
            </div>

            {/* Mobile optimized studio product fallback for responsive battery & frame performance */}
            <div className="md:hidden w-full rounded-2xl border border-white/10 bg-[#161615] overflow-hidden">
              <div className="aspect-[3/4] w-full overflow-hidden">
                <ResilientImage
                  src={activeMachine.image}
                  alt={activeMachine.categoryLabel}
                  fallbackGradient={activeMachine.fallbackGradient}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 border-t border-white/10 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-[#FCFCFC]">{activeMachine.categoryLabel}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('solutions')}
                  className="text-xs font-medium text-[#A374FF] whitespace-nowrap"
                >
                  Inspect Specs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
