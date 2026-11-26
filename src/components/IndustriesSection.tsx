import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  INDUSTRY_APPLICATIONS,
  VENDING_SOLUTIONS,
  type MachineCategoryId,
} from '../data/vendingCatalog';
import { VenueTrafficVideo } from './VenueTrafficVideo';

interface IndustriesSectionProps {
  onSelectIndustryMachine: (categoryId: MachineCategoryId) => void;
  reducedMotion?: boolean;
}

export function IndustriesSection({
  onSelectIndustryMachine,
  reducedMotion = false,
}: IndustriesSectionProps) {
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>(
    INDUSTRY_APPLICATIONS[0].id
  );
  const [selectedMachineId, setSelectedMachineId] = useState<MachineCategoryId>(
    INDUSTRY_APPLICATIONS[0].recommendedCategory
  );

  const selectedIndustry =
    INDUSTRY_APPLICATIONS.find((ind) => ind.id === selectedIndustryId) ||
    INDUSTRY_APPLICATIONS[0];
  const activeMachine =
    VENDING_SOLUTIONS.find((sol) => sol.id === selectedMachineId) || VENDING_SOLUTIONS[0];

  const handleSelectIndustry = (id: string, defaultCategory: MachineCategoryId) => {
    setSelectedIndustryId(id);
    setSelectedMachineId(defaultCategory);
  };

  return (
    <section id="industries" className="py-20 sm:py-28 bg-[#10100F] border-b border-white/10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#9ECFFA] font-medium">
              Industries & Applications
            </p>
            <h2
              className="font-display text-3xl sm:text-5xl font-semibold text-[#FCFCFC] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Built for High-Traffic Real-World Environments.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="text-base text-[#B8B8B4] leading-relaxed">
              Select any deployment venue or machine platform below to view the real-world environment, hardware configuration, and live customer dispensing sequence in motion.
            </p>
          </div>
        </div>

        {/* Interactive High-Traffic Venue Simulation Video */}
        <VenueTrafficVideo
          industry={selectedIndustry}
          machine={activeMachine}
          onSelectMachine={setSelectedMachineId}
          onExploreMachine={onSelectIndustryMachine}
          reducedMotion={reducedMotion}
        />

        {/* 8 Interactive Industry Deployment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {INDUSTRY_APPLICATIONS.map((ind) => {
            const active = ind.id === selectedIndustryId;
            return (
              <div
                key={ind.id}
                className={`p-6 rounded-xl border transition-colors duration-150 flex flex-col justify-between gap-5 ${
                  active
                    ? 'bg-[#1A1A1E] border-[#A374FF]'
                    : 'bg-[#161615] border-white/10 hover:border-white/25'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectIndustry(ind.id, ind.recommendedCategory)}
                  aria-pressed={active}
                  className="text-left space-y-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A374FF] rounded"
                >
                  <div className="text-[11px] font-mono-tabular text-[#9ECFFA]">
                    {ind.recommendedLabel}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#FCFCFC]">
                    {ind.name}
                  </h3>
                  <p className="text-sm text-[#B8B8B4] leading-relaxed">{ind.summary}</p>
                </button>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#8C8C88] truncate">
                    {ind.deploymentNote}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectIndustryMachine(ind.recommendedCategory)}
                    aria-label={`View recommended solution for ${ind.name}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#A374FF] hover:text-[#FCFCFC] shrink-0 cursor-pointer"
                  >
                    <span>Explore</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
