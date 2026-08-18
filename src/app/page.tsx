import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { WhatIsSection } from "@/components/landing/what-is-section";
import { UtilitySection } from "@/components/landing/utility-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { ExternalPlatformsSection } from "@/components/landing/external-platforms-section";
import { ContractSection } from "@/components/landing/contract-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { ContactSection } from "@/components/landing/contact-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <WhatIsSection />
        <UtilitySection />
        <HowItWorksSection />
        <PricingSection />
        <ExternalPlatformsSection />
        <ContractSection />
        <BenefitsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
