import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LD_INTERTECH_BRAND } from '../data/vendingCatalog';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: 'solutions', label: 'Solutions' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'how-it-works', label: 'Process' },
  { id: 'technology', label: 'Technology' },
  { id: 'industries', label: 'Industries' },
] as const;

export function Navbar({ onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#10100F]/92 border-b border-white/10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Official LD Intertech Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hero');
          }}
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A374FF] rounded"
          aria-label={LD_INTERTECH_BRAND.companyName}
        >
          <img
            src={LD_INTERTECH_BRAND.logoPath}
            alt="LD InterTech Innovation"
            className="h-8 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="text-sm font-medium text-[#B8B8B4] hover:text-[#FCFCFC] transition-colors duration-150 whitespace-nowrap shrink-0 underline-offset-4 hover:underline"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary CTA + Mobile drawer trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('contact')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#10100F] bg-[#FCFCFC] hover:bg-[#A374FF] hover:text-[#FCFCFC] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A374FF]"
          >
            Request Quote
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-white/15 text-[#FCFCFC] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#161615] border-b border-white/10 px-6 py-5">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                className="py-2.5 text-base font-medium text-[#FCFCFC] border-b border-white/5"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => handleLinkClick('contact')}
              className="mt-2 w-full py-3 px-4 text-sm font-semibold text-[#10100F] bg-[#A374FF] rounded-lg text-center cursor-pointer"
            >
              Request Quote
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
