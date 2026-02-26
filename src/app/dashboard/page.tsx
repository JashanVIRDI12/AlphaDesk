import { getMockMarketData } from "@/data/market";

import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardHeader } from "@/components/trading/dashboard-header";
import { DashboardFooter } from "@/components/trading/dashboard-footer";
import { DashboardShell } from "@/components/trading/dashboard-shell";
import { Greeting } from "@/components/trading/greeting";
import { InstrumentsGrid } from "@/components/trading/instruments-grid";
import { MacroPanel } from "@/components/trading/macro-panel";
import { TopStatusStrip } from "@/components/trading/top-status-strip";
import { SectionHeader } from "@/components/trading/section-header";
import { VolatilityPanel } from "@/components/trading/volatility-panel";

export default function Dashboard() {
    const data = getMockMarketData();

    return (
        <DashboardShell>
            <AuthGate>
                <DashboardHeader sessions={data.sessions} />

                <main className="mx-auto w-full max-w-[1800px] 2xl:max-w-[2400px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
                    <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 lg:hidden">
                        <a
                            href="#instruments"
                            className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-zinc-300"
                        >
                            INSTRUMENTS
                        </a>
                        <a
                            href="#news"
                            className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-zinc-300"
                        >
                            NEWS
                        </a>
                        <a
                            href="#fundamentals"
                            className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-zinc-300"
                        >
                            FUNDAMENTALS
                        </a>
                        <a
                            href="#volatility"
                            className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-zinc-300"
                        >
                            VOLATILITY
                        </a>
                    </div>

                    <div className="space-y-5 sm:space-y-7 mb-5 sm:mb-7">
                        <Greeting
                            title={data.greeting.title}
                            subtitle={data.greeting.subtitle}
                            sessions={data.sessions}
                        />
                    </div>

                    <div className="mb-5 sm:mb-7" id="news">
                        <MacroPanel riskMode={data.fundamentals.riskMode} events={data.fundamentals.events} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                        <section className="space-y-5 sm:space-y-7 lg:col-span-8">
                            <div id="instruments" className="space-y-3 scroll-mt-24">
                                <SectionHeader
                                    title="Instruments"
                                    description="AI-powered FX analysis with live TradingView charts"
                                />
                                <InstrumentsGrid />
                            </div>
                        </section>

                        <aside className="space-y-4 sm:space-y-6 lg:col-span-4">
                            <div id="volatility" className="space-y-3 scroll-mt-24">
                                <SectionHeader
                                    title="Volatility"
                                    description="Cross-pair ATR regime snapshot"
                                />
                                <VolatilityPanel />
                            </div>
                        </aside>
                    </div>
                </main>

                <DashboardFooter />
            </AuthGate>
        </DashboardShell>
    );
}
