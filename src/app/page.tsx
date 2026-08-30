import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { CountersSection } from "@/components/landing/counters-section";
import { TokenDataSection } from "@/components/landing/token-data-section";
import { WhatIsSection } from "@/components/landing/what-is-section";
import { UtilitySection } from "@/components/landing/utility-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TokenomicsSection } from "@/components/landing/tokenomics-section";
import { LiveStatsSection } from "@/components/landing/live-stats-section";
import { ExternalPlatformsSection } from "@/components/landing/external-platforms-section";
import { ContractSection } from "@/components/landing/contract-section";
import { SwapSection } from "@/components/landing/swap-section";
import { PortfolioDashboard } from "@/components/landing/portfolio-dashboard";
import { PriceAlerts } from "@/components/landing/price-alerts";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { ReferralSection } from "@/components/landing/referral-section";
import { FaqSection } from "@/components/landing/faq-section";
import { ContactSection } from "@/components/landing/contact-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <CountersSection />
        <TokenDataSection />
        <WhatIsSection />
        <UtilitySection />
        <HowItWorksSection />
        <TokenomicsSection />
        <LiveStatsSection />
        <ExternalPlatformsSection />
        <ContractSection />
        <SwapSection />
        <PortfolioDashboard />
        <PriceAlerts />
        <BenefitsSection />
        <ReferralSection />
        <FaqSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}