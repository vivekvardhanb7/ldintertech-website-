import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  VENDING_SOLUTIONS,
  type MachineCategoryId,
  type VendingSolution,
} from './data/vendingCatalog';
import type { ProductCategoryOption } from './utils/validation';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HorizonStatsSection } from './components/HorizonStatsSection';
import { SolutionsSection } from './components/SolutionsSection';
import { InteractiveShowcase } from './components/InteractiveShowcase';
import { HowItWorksSection } from './components/HowItWorksSection';
import { TechnologyGlobeSection } from './components/TechnologyGlobeSection';
import { IndustriesSection } from './components/IndustriesSection';
import { WhyLDIntertechSection } from './components/WhyLDIntertechSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MachineDetailModal } from './components/MachineDetailModal';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [activeCategory, setActiveCategory] = useState<MachineCategoryId>('snacks');
  const [modalMachine, setModalMachine] = useState<VendingSolution | null>(null);
  const [contactCategory, setContactCategory] =
    useState<ProductCategoryOption>('Medical Vending Machine');
  const [reducedMotion, setReducedMotion] = useState(false);

  const heroScrollProgressRef = useRef<number>(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', listener);

    let lenis: Lenis | null = null;
    let rafId = 0;

    if (!mq.matches) {
      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
      });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    // Track scroll progress through the hero + horizon opening for 3D camera choreography
    const st = ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        heroScrollProgressRef.current = self.progress;
      },
    });

    return () => {
      mq.removeEventListener('change', listener);
      st.kill();
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const navigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -64 });
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  const handleInquireMachine = (machine: VendingSolution) => {
    setModalMachine(null);
    setContactCategory(machine.contactOption);
    navigateToSection('contact');
  };

  const handleSelectIndustryMachine = (categoryId: MachineCategoryId) => {
    setActiveCategory(categoryId);
    const found = VENDING_SOLUTIONS.find((s) => s.id === categoryId);
    if (found) setContactCategory(found.contactOption);
    navigateToSection('solutions');
  };

  return (
    <div className="min-h-screen bg-[#10100F] text-[#FCFCFC]">
      <Navbar onNavigate={navigateToSection} />

      <main>
        <HeroSection
          scrollProgressRef={heroScrollProgressRef}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onNavigate={navigateToSection}
          reducedMotion={reducedMotion}
        />

        <HorizonStatsSection />

        <SolutionsSection
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onOpenModal={setModalMachine}
          onInquireCategory={handleInquireMachine}
        />

        <InteractiveShowcase onOpenModal={setModalMachine} />

        <HowItWorksSection />

        <TechnologyGlobeSection />

        <IndustriesSection
          onSelectIndustryMachine={handleSelectIndustryMachine}
          reducedMotion={reducedMotion}
        />

        <WhyLDIntertechSection />

        <ContactSection preselectedCategory={contactCategory} />
      </main>

      <Footer
        onNavigate={navigateToSection}
        onSelectCategory={setActiveCategory}
      />

      <MachineDetailModal
        machine={modalMachine}
        onClose={() => setModalMachine(null)}
        onRequestQuote={handleInquireMachine}
      />
    </div>
  );
}
