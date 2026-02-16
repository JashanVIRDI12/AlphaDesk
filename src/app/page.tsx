import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PillarsSection } from "@/components/landing/pillars-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";

export const metadata: Metadata = {
    title: "AlphaDesk — AI-Powered Institutional Trading Terminal",
    description:
        "AlphaDesk blends real-time news, technical analysis, and macro fundamentals into a single AI-powered dashboard for FX traders.",
};

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#06060a] text-zinc-100 overflow-x-hidden">
            <LandingNav />
            <HeroSection />
            <FeaturesSection />
            <PillarsSection />
            <CtaSection />
            <LandingFooter />
        </div>
    );
}
