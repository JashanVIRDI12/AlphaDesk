import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PillarsSection } from "@/components/landing/pillars-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { StructuredData } from "@/app/schema";

export const metadata: Metadata = {
    title: "AI Forex Trading Terminal — Real-Time Currency Analysis & FX Signals",
    description:
        "Professional forex trading platform combining AI-powered currency analysis, real-time FX news, 1H/4H technical indicators, and macro fundamentals. Get institutional-grade trading signals for EUR/USD, GBP/USD, USD/JPY, and XAU/USD with live market intelligence.",
    openGraph: {
        title: "GetTradingBias — AI Forex Trading Terminal",
        description:
            "Professional forex trading platform with AI-powered currency analysis, real-time FX news, and institutional-grade insights.",
        type: "website",
    },
};

export default function HomePage() {
    return (
        <>
            <StructuredData />
            <div className="min-h-screen bg-[#06060a] text-zinc-100 overflow-x-hidden">
                <LandingNav />
                <HeroSection />
                <FeaturesSection />
                <PillarsSection />
                <CtaSection />
                <LandingFooter />
            </div>
        </>
    );
}
