import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "Forex Trading Guides & Market Analysis",
  description:
    "Expert forex trading guides, currency analysis strategies, and FX market insights. Learn technical analysis, risk management, and institutional trading techniques for EUR/USD, GBP/USD, USD/JPY.",
  openGraph: {
    title: "Forex Trading Guides | GetTradingBias",
    description:
      "Expert forex trading guides and currency analysis strategies for professional traders.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100">
      <LandingNav />
      <main className="relative">{children}</main>
      <LandingFooter />
    </div>
  );
}
