import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { VENDING_SOLUTIONS, type VendingSolution } from '../data/vendingCatalog';
import { ResilientImage } from './ResilientImage';

interface InteractiveShowcaseProps {
  onOpenModal: (machine: VendingSolution) => void;
}

const SEQUENCE_FRAMES = [
  {
    id: 'frame-1',
    title: '01. Proximity Wake & Interface',
    caption: 'Anti-glare capacitive touchscreen illuminates catalog availability upon approach.',
    machineIdx: 2,
    scale: 1.0,
    xShift: 0,
  },
  {
    id: 'frame-2',
    title: '02. Multi-Modal Cashless Checkout',
    caption: 'NFC tap, mobile wallet, and QR authorization settle in a single pass.',
    machineIdx: 0,
    scale: 1.04,
    xShift: -8,
  },
  {
    id: 'frame-3',
    title: '03. Automated Heating & Elevator Lift',
    caption: 'Precision robotics retrieve chilled items or activate rapid convection heating.',
    machineIdx: 1,
    scale: 1.07,
    xShift: 8,
  },
  {
    id: 'frame-4',
    title: '04. Circular Return & Bin Telemetry',
    caption: 'Optical sensors validate returned bottles, cups, and reusable bowls automatically.',
    machineIdx: 3,
    scale: 1.02,
    xShift: 0,
  },
];

export function InteractiveShowcase({ onOpenModal }: InteractiveShowcaseProps) {
  const sequenceSectionRef = useRef<HTMLDivElement | null>(null);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

  useEffect(() => {
    const el = sequenceSectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight * 0.4, 1);
      const raw = (window.innerHeight * 0.6 - rect.top) / total;
      const clamped = Math.max(0, Math.min(1, raw));
      setScrubProgress(clamped);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const frameIdx = Math.min(
    SEQUENCE_FRAMES.length - 1,
    Math.floor(scrubProgress * SEQUENCE_FRAMES.length)
  );
  const currentFrame = SEQUENCE_FRAMES[frameIdx];
  const currentSequenceMachine = VENDING_SOLUTIONS[currentFrame.machineIdx];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + VENDING_SOLUTIONS.length) % VENDING_SOLUTIONS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % VENDING_SOLUTIONS.length);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) > 45) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <section id="showcase" className="py-20 sm:py-28 bg-[#161615] border-b border-white/10 overflow-hidden">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Part A: Scroll-Scrubbed Automated Operation Visualizer */}
        <div ref={sequenceSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9ECFFA] font-medium">
              Scroll-Scrubbed Sequence
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#FCFCFC] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Every Interaction Choreographed From Tap to Dispense.
            </h2>
            <p className="text-sm sm:text-base text-[#B8B8B4] leading-relaxed">
              Scroll through the viewport or scrub the timeline below to inspect how LD Intertech hardware transitions across authentication, preparation, dispensing, and return processing.
            </p>

            {/* Timeline Scrubber */}
            <div className="p-4 rounded-xl bg-[#10100F] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#FCFCFC] font-medium">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#A374FF]" />
                  <span>Interactive Sequence Scrub</span>
                </span>
                <span className="font-mono-tabular text-[#8C8C88]">
                  {Math.round(scrubProgress * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(scrubProgress * 100)}
                onChange={(e) => setScrubProgress(Number(e.target.value) / 100)}
                aria-label="Scrub automated vending sequence timeline"
                className="w-full accent-[#A374FF] cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-2 pt-1">
                {SEQUENCE_FRAMES.map((frame, i) => (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setScrubProgress((i + 0.1) / SEQUENCE_FRAMES.length)}
                    className={`py-1.5 px-2 text-[11px] font-mono-tabular rounded border transition-colors cursor-pointer ${
                      i === frameIdx
                        ? 'bg-[#A374FF] text-[#10100F] border-[#A374FF] font-semibold'
                        : 'bg-[#161615] text-[#8C8C88] border-white/10 hover:text-[#FCFCFC]'
                    }`}
                  >
                    0{i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative rounded-2xl bg-[#10100F] border border-white/10 overflow-hidden p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-6 aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-[#161615]">
                  <div
                    className="w-full h-full transition-transform duration-300 ease-out"
                    style={{
                      transform: `scale(${currentFrame.scale}) translate3d(${currentFrame.xShift}px, 0, 0)`,
                    }}
                  >
                    <ResilientImage
                      src={currentSequenceMachine.image}
                      alt={currentSequenceMachine.categoryLabel}
                      fallbackGradient={currentSequenceMachine.fallbackGradient}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="sm:col-span-6 space-y-4">
                  <div className="text-xs font-mono-tabular text-[#A374FF]">
                    {currentSequenceMachine.categoryLabel}
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-[#FCFCFC]">
                    {currentFrame.title}
                  </h3>
                  <p className="text-sm text-[#B8B8B4] leading-relaxed">
                    {currentFrame.caption}
                  </p>
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    {currentSequenceMachine.specifications.slice(0, 3).map((spec) => (
                      <div key={spec.label} className="flex justify-between gap-4 text-xs">
                        <span className="text-[#8C8C88]">{spec.label}</span>
                        <span className="text-[#FCFCFC] font-mono-tabular text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part B: Interactive 3D Perspective Product Carousel */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#A374FF] font-medium mb-2">
                Interactive Product Showcase
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FCFCFC]">
                Drag or Step Through the Fleet
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous vending machine"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#10100F] border border-white/15 text-[#FCFCFC] hover:border-[#A374FF] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono-tabular text-[#B8B8B4] px-2">
                0{activeIndex + 1} / 0{VENDING_SOLUTIONS.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next vending machine"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#10100F] border border-white/15 text-[#FCFCFC] hover:border-[#A374FF] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {VENDING_SOLUTIONS.map((machine, idx) => {
              const isFocused = idx === activeIndex;
              return (
                <div
                  key={machine.id}
                  className={`group relative rounded-2xl border overflow-hidden transition-transform duration-200 bg-gradient-to-b ${machine.fallbackGradient} ${
                    isFocused
                      ? 'border-[#A374FF] -translate-y-1.5'
                      : 'border-white/10 hover:border-white/30 hover:-translate-y-1'
                  }`}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#10100F]">
                    <ResilientImage
                      src={machine.image}
                      alt={machine.categoryLabel}
                      fallbackGradient={machine.fallbackGradient}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5 space-y-3 bg-[#10100F]/95 border-t border-white/10">
                    <div className="text-xs font-mono-tabular text-[#9ECFFA]">
                      0{idx + 1} · {machine.categoryLabel}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#FCFCFC] leading-snug">
                      {machine.headline}
                    </h3>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveIndex(idx);
                          onOpenModal(machine);
                        }}
                        className="text-xs font-semibold text-[#A374FF] hover:text-[#FCFCFC] transition-colors cursor-pointer"
                      >
                        Inspect Specifications →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
