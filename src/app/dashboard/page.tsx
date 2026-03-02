import { getMockMarketData } from "@/data/market";

import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardHeader } from "@/components/trading/dashboard-header";
import { DashboardFooter } from "@/components/trading/dashboard-footer";
import { DashboardShell } from "@/components/trading/dashboard-shell";
import { Greeting } from "@/components/trading/greeting";
import { MacroPanel } from "@/components/trading/macro-panel";
import { SectionHeader } from "@/components/trading/section-header";
import { VolatilityPanel } from "@/components/trading/volatility-panel";
import { InstrumentsSummary } from "@/components/trading/instruments-summary";

export default function Dashboard() {
    const data = getMockMarketData();

    return (
        <DashboardShell>
            <AuthGate>
                <DashboardHeader sessions={data.sessions} />

                <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 md:px-7 md:py-8">

                    {/* Mobile quick-nav pills */}
                    <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 lg:hidden">
                        {[
                            { label: "NEWS", href: "#news" },
                            { label: "PAIRS", href: "#pairs" },
                            { label: "VOLATILITY", href: "#volatility" },
                        ].map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-[9px] font-bold tracking-[0.12em] text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                {label}
                            </a>
                        ))}
                    </div>

                    {/* Greeting strip */}
                    <div className="mb-6">
                        <Greeting
                            title={data.greeting.title}
                            subtitle={data.greeting.subtitle}
                            sessions={data.sessions}
                        />
                    </div>

                    {/* Macro + News Desk — full width */}
                    <div className="mb-6" id="news">
                        <MacroPanel riskMode={data.fundamentals.riskMode} events={data.fundamentals.events} />
                    </div>

                    {/* ═══ Main 2-column grid ═══
                        LEFT  (lg:8) — Compact instrument pair summaries (tap → full analysis page)
                        RIGHT (lg:4) — Sticky sidebar: Volatility
                    */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

                        {/* ── LEFT: Instrument pair summaries ── */}
                        <section className="lg:col-span-8" id="pairs">
                            <SectionHeader
                                title="Instruments"
                                description="AI bias across major FX pairs — tap any row for full analysis"
                            />
                            <div className="mt-3">
                                <InstrumentsSummary />
                            </div>
                        </section>

                        {/* ── RIGHT: Sticky sidebar ── */}
                        <aside className="lg:col-span-4">
                            <div className="lg:sticky lg:top-24">
                                <div id="volatility" className="scroll-mt-24">
                                    <SectionHeader
                                        title="Volatility"
                                        description="Cross-pair ATR regime"
                                    />
                                    <div className="mt-3">
                                        <VolatilityPanel />
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                <DashboardFooter />
            </AuthGate>
        </DashboardShell>
    );
}
