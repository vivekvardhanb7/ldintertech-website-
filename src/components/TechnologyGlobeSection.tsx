import { useState } from 'react';
import {
  Activity,
  BarChart3,
  Cloud,
  Cpu,
  CreditCard,
  FileSpreadsheet,
  PackageCheck,
  Wifi,
} from 'lucide-react';
import { GLOBE_HUBS, PLATFORM_CAPABILITIES } from '../data/vendingCatalog';
import { GlobalNetworkGlobe } from './three/GlobalNetworkGlobe';

const CAPABILITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  iot: Wifi,
  monitoring: Activity,
  inventory: PackageCheck,
  payments: CreditCard,
  analytics: BarChart3,
  cloud: Cloud,
  reporting: FileSpreadsheet,
  status: Cpu,
};

export function TechnologyGlobeSection() {
  const [selectedHubId, setSelectedHubId] = useState(GLOBE_HUBS[0].id);
  const activeHub = GLOBE_HUBS.find((h) => h.id === selectedHubId) || GLOBE_HUBS[0];

  return (
    <section id="technology" className="py-20 sm:py-28 bg-[#161615] border-b border-white/10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Split: Interactive 3D Global Network Globe + Regional Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#A374FF] font-medium">
              Technology & Connected Operations
            </p>
            <h2
              className="font-display text-3xl sm:text-5xl font-semibold text-[#FCFCFC] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Unified Cloud Telemetry Across Every Deployment.
            </h2>
            <p className="text-base text-[#B8B8B4] leading-relaxed">
              Every smart vending machine links directly to centralized cloud operations for remote monitoring, inventory tracking, digital payments, and operational reporting.
            </p>

            <div className="space-y-3 pt-2">
              <div className="text-xs font-medium text-[#8C8C88]">
                Inspect Regional Network Corridors
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {GLOBE_HUBS.map((hub) => {
                  const active = hub.id === selectedHubId;
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => setSelectedHubId(hub.id)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#10100F] border-[#A374FF] text-[#FCFCFC]'
                          : 'bg-[#10100F]/60 border-white/10 text-[#B8B8B4] hover:border-white/25'
                      }`}
                    >
                      <div className="text-[11px] font-mono-tabular text-[#9ECFFA]">
                        {hub.region}
                      </div>
                      <div className="text-sm font-semibold mt-0.5">{hub.city}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#10100F] border border-white/10 space-y-1">
              <div className="text-xs font-mono-tabular text-[#A374FF]">
                {activeHub.focusMachine}
              </div>
              <p className="text-sm text-[#B8B8B4]">{activeHub.summary}</p>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl bg-[#10100F] border border-white/10 p-4 sm:p-6">
            <GlobalNetworkGlobe activeHub={activeHub} />
            <div className="pt-2 text-center text-xs font-mono-tabular text-[#8C8C88]">
              Drag globe to explore · Click corridors to focus regional network
            </div>
          </div>
        </div>

        {/* Bottom 8-Capability Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLATFORM_CAPABILITIES.map((cap) => {
            const Icon = CAPABILITY_ICONS[cap.id] || Cpu;
            return (
              <div
                key={cap.id}
                className="p-6 rounded-xl bg-[#10100F] border border-white/10 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="w-5 h-5 text-[#A374FF]" />
                    <span className="text-[11px] font-mono-tabular text-[#8C8C88]">
                      {cap.metricLabel}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#FCFCFC]">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[#B8B8B4] leading-relaxed">{cap.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
