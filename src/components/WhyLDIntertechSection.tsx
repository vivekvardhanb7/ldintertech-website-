const PILLARS = [
  {
    index: '01',
    title: 'Innovative Vending Solutions',
    body: 'Hardware platforms engineered for specialized dispensing—from climate-controlled healthcare essentials to hot artisan pizza and reusable container returns.',
  },
  {
    index: '02',
    title: 'Modern Software & Hardware Synergy',
    body: 'LD InterTech Innovation combines full-stack cloud software, embedded systems, and mechanical design under a single engineering team.',
  },
  {
    index: '03',
    title: 'Flexible Machine Configurations',
    body: 'Configurable compartments, shelf geometries, thermal zones, and payment terminals tailored to each venue footprint.',
  },
  {
    index: '04',
    title: 'Connected Cloud Operations',
    body: 'Real-time visibility into stock depletion, thermal status, and cashless settlement summaries across distributed machine fleets.',
  },
  {
    index: '05',
    title: 'Customer-Focused Experience',
    body: 'Intuitive touchscreen navigation, transparent product lighting, and rapid contactless checkout reduce friction at every touchpoint.',
  },
  {
    index: '06',
    title: 'Scalable Business Opportunities',
    body: 'Start with a single flagship site and expand systematically across campuses, healthcare networks, or transit corridors.',
  },
];

export function WhyLDIntertechSection() {
  return (
    <section id="why-ld-intertech" className="py-20 sm:py-28 bg-[#161615] border-b border-white/10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#A374FF] font-medium">
              Why LD Intertech
            </p>
            <h2
              className="font-display text-3xl sm:text-5xl font-semibold text-[#FCFCFC] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Engineering a Smarter Vending Experience.
            </h2>
            <p className="text-base text-[#B8B8B4] leading-relaxed">
              We build automated retail systems with the rigor of a software and embedded systems studio—aligning durable physical mechanics with clear digital interfaces.
            </p>
          </div>

          <div className="lg:col-span-7 divide-y divide-white/10 border-t border-b border-white/10">
            {PILLARS.map((pillar) => (
              <div key={pillar.index} className="py-6 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                <span className="font-mono-tabular text-sm font-semibold text-[#A374FF] shrink-0">
                  {pillar.index}.
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-display text-xl font-semibold text-[#FCFCFC]">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#B8B8B4] leading-relaxed">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
