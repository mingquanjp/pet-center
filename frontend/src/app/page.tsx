import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-petcenter-background font-sans text-petcenter-text selection:bg-petcenter-primary/20">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <BenefitsSection />
        <ProcessSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}