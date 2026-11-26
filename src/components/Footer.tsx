import { LD_INTERTECH_BRAND, VENDING_SOLUTIONS, type MachineCategoryId } from '../data/vendingCatalog';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onSelectCategory: (id: MachineCategoryId) => void;
}

export function Footer({ onNavigate, onSelectCategory }: FooterProps) {
  return (
    <footer className="relative bg-[#0B0B0A] text-[#B8B8B4] overflow-hidden">
      {/* Subtle animated architectural top hairline */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-[#A374FF]/70 to-transparent"
      />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-4 space-y-4">
            <img
              src={LD_INTERTECH_BRAND.logoPath}
              alt="LD InterTech Innovation"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <p className="text-sm text-[#8C8C88] leading-relaxed max-w-sm">
              LD InterTech Innovation engineers software, cloud platforms, embedded hardware, and smart vending solutions for modern commercial spaces.
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FCFCFC]">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { id: 'hero', label: 'Home' },
                { id: 'solutions', label: 'Solutions' },
                { id: 'showcase', label: 'Showcase' },
                { id: 'technology', label: 'Technology' },
                { id: 'industries', label: 'Industries' },
                { id: 'contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.id);
                    }}
                    className="hover:text-[#FCFCFC] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FCFCFC]">
              Product Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {VENDING_SOLUTIONS.map((sol) => (
                <li key={sol.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(sol.id);
                      onNavigate('solutions');
                    }}
                    className="hover:text-[#FCFCFC] transition-colors text-left cursor-pointer"
                  >
                    {sol.categoryLabel}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FCFCFC]">
              Headquarters
            </h3>
            <div className="space-y-2 text-sm text-[#8C8C88]">
              <p>
                <a
                  href={`mailto:${LD_INTERTECH_BRAND.email}`}
                  className="text-[#FCFCFC] hover:text-[#A374FF] transition-colors"
                >
                  {LD_INTERTECH_BRAND.email}
                </a>
              </p>
              <p className="font-mono-tabular text-[#D0D0CC]">{LD_INTERTECH_BRAND.phone}</p>
              <p className="text-xs leading-relaxed">{LD_INTERTECH_BRAND.address}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8C88]">
          <p>© {new Date().getFullYear()} LD InterTech Innovation. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a
              href={LD_INTERTECH_BRAND.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FCFCFC] transition-colors"
            >
              ldintertech.com
            </a>
            <a
              href={`mailto:${LD_INTERTECH_BRAND.email}`}
              className="hover:text-[#FCFCFC] transition-colors"
            >
              Email Team
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
