import { useEffect } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import type { VendingSolution } from '../data/vendingCatalog';
import { ResilientImage } from './ResilientImage';

interface MachineDetailModalProps {
  machine: VendingSolution | null;
  onClose: () => void;
  onRequestQuote: (machine: VendingSolution) => void;
}

export function MachineDetailModal({
  machine,
  onClose,
  onRequestQuote,
}: MachineDetailModalProps) {
  useEffect(() => {
    if (!machine) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [machine, onClose]);

  if (!machine) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="machine-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#161615] border border-white/15 text-[#FCFCFC]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#161615] border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#A374FF] font-medium">
              {machine.categoryLabel}
            </span>
            <h3 id="machine-modal-title" className="font-display text-xl font-semibold text-[#FCFCFC]">
              {machine.headline}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close specifications modal"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-[#10100F]">
              <ResilientImage
                src={machine.image}
                alt={machine.categoryLabel}
                fallbackGradient={machine.fallbackGradient}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <p className="text-sm text-[#B8B8B4] leading-relaxed">{machine.description}</p>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9ECFFA] mb-3">
                Published & Reference Technical Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {machine.specifications.map((spec) => (
                  <div
                    key={spec.label}
                    className="p-3 rounded-lg bg-[#10100F] border border-white/10"
                  >
                    <div className="text-[11px] text-[#8C8C88]">{spec.label}</div>
                    <div className="text-sm font-medium text-[#FCFCFC] font-mono-tabular mt-0.5">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9ECFFA] mb-3">
                Site & Installation Readiness
              </h4>
              <ul className="space-y-2">
                {machine.installationNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2.5 text-sm text-[#B8B8B4]">
                    <Check className="w-4 h-4 text-[#A374FF] shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onRequestQuote(machine)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#10100F] bg-[#A374FF] hover:bg-[#FCFCFC] rounded-lg transition-colors cursor-pointer"
              >
                <span>Request {machine.categoryLabel} Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-sm font-medium text-[#B8B8B4] hover:text-[#FCFCFC] border border-white/15 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
