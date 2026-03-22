import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, TrendingUp, ArrowRight, Zap, Globe } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
    title: "Free Forex Trading Tools — Calculators for Position Sizing & Risk Management",
    description:
        "Free professional forex trading tools. Lot size calculator, position sizing calculator, and more. Essential calculators for every forex trader to manage risk and size positions correctly.",
    openGraph: {
        title: "Free Forex Trading Tools | GetTradingBias",
        description: "Free professional-grade forex calculators for position sizing, lot sizes, and risk management.",
        type: "website",
        url: "https://gettradingbias.com/tools",
    },
    alternates: {
        canonical: "https://gettradingbias.com/tools",
    },
};

const TOOLS = [
    {
        href: "/tools/geopolitical-risk",
        title: "Geopolitical Risk Index",
        description:
            "Track historical and current geopolitical risk driven by global news, conflicts, and events. Visualize the impact from 1900 to present day.",
        icon: Globe,
        badge: "New",
        badgeColor: "border-sky-500/20 bg-sky-500/10 text-sky-300",
        glow: "bg-sky-500/[0.06]",
        accent: "border-sky-500/10 hover:border-sky-500/20",
        keywords: ["GPR Index", "Global News", "War & Conflicts", "Risk Sentiment"],
        live: true,
    },
    {
        href: "/tools/lot-size-calculator",
        title: "Lot Size Calculator",
        description:
            "Calculate the exact standard, mini, and micro lot size for any trade. Enter account size, risk %, stop loss pips, and currency pair.",
        icon: Calculator,
        badge: "Live Now",
        badgeColor: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        glow: "bg-indigo-500/[0.06]",
        accent: "border-indigo-500/10 hover:border-indigo-500/20",
        keywords: ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "+8 more"],
        live: true,
    },
    {
        href: "/tools/trade-journal",
        title: "Trade Journal",
        description:
            "Log every trade, track your win rate, R:R ratio, and equity curve. Private, browser-only — no server, no signup needed.",
        icon: TrendingUp,
        badge: "Coming Soon",
        badgeColor: "border-amber-500/20 bg-amber-500/[0.07] text-amber-400",
        glow: "bg-violet-500/[0.04]",
        accent: "border-white/[0.06] hover:border-violet-500/10",
        keywords: ["Win rate", "Equity curve", "Session analysis", "AI review"],
        live: true,
    },
];

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-[#06060a] text-zinc-100">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/3 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-500/[0.04] blur-[120px]" />
            </div>

            <div className="relative">
                <LandingNav />

                <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-[11px] text-zinc-600">
                        <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-400">Tools</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/15 bg-indigo-500/[0.06] px-4 py-1.5">
                            <Zap className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-400">
                                100% Free
                            </span>
                        </div>
                        <h1 className="mb-4 text-4xl font-black tracking-tight text-zinc-100 sm:text-5xl">
                            Forex Trading Tools
                        </h1>
                        <p className="mx-auto max-w-lg text-[15px] leading-relaxed text-zinc-500">
                            Professional-grade calculators built for forex traders. No signup required — completely free.
                        </p>
                    </div>

                    {/* Tools grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {TOOLS.map((tool) => {
                            const Icon = tool.icon;
                            const card = (
                                <div className={`group relative h-full overflow-hidden rounded-2xl border bg-gradient-to-b from-[#0d0d12] to-[#0a0a0f] p-6 transition-all duration-300 ${tool.accent} ${tool.live ? "hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
                                    <div className={`pointer-events-none absolute -top-12 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full blur-[60px] transition-opacity duration-300 ${tool.glow} ${tool.live ? "opacity-50 group-hover:opacity-100" : "opacity-30"}`} />
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                                    <div className="relative flex flex-col h-full gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                                                <Icon className="h-5 w-5 text-zinc-300" />
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${tool.badgeColor}`}>
                                                {tool.badge}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <h2 className="mb-2 text-[17px] font-bold tracking-tight text-zinc-100">
                                                {tool.title}
                                            </h2>
                                            <p className="text-[13px] leading-relaxed text-zinc-500">
                                                {tool.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {tool.keywords.map((kw) => (
                                                <span key={kw} className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-[10px] text-zinc-600">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>

                                        {tool.live && (
                                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-indigo-400/70 transition-all duration-300 group-hover:gap-2.5 group-hover:text-indigo-400">
                                                Open Calculator
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );

                            return tool.live ? (
                                <Link key={tool.href} href={tool.href} className="block h-full">
                                    {card}
                                </Link>
                            ) : (
                                <div key={tool.href} className="h-full">{card}</div>
                            );
                        })}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 text-center">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                            Powered by AI
                        </p>
                        <h2 className="mb-3 text-xl font-bold text-zinc-200">
                            Need the trade direction too?
                        </h2>
                        <p className="mx-auto mb-6 max-w-md text-[14px] text-zinc-500">
                            Our AI terminal gives you the bias, news drivers, technical levels, and macro backdrop — so you know <em>when</em> and <em>which direction</em> to trade.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:brightness-110"
                        >
                            Open AI Terminal
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </main>

                <LandingFooter />
            </div>
        </div>
    );
}
