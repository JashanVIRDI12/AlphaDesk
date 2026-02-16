import { getMockMarketData } from "@/data/market";

import { AuthGate } from "@/components/auth/auth-gate";
import { DashboardHeader } from "@/components/trading/dashboard-header";
import { DashboardShell } from "@/components/trading/dashboard-shell";
import { FundamentalsPanel } from "@/components/trading/fundamentals-panel";
import { Greeting } from "@/components/trading/greeting";
import { InstrumentsGrid } from "@/components/trading/instruments-grid";
import { MacroPanel } from "@/components/trading/macro-panel";
import { MarketSessions } from "@/components/trading/market-sessions";
import { NewsHeadlines } from "@/components/trading/news-headlines";
import { NoTradeDayBanner } from "@/components/trading/no-trade-day-banner";
import { SectionHeader } from "@/components/trading/section-header";

export default function Dashboard() {
    const data = getMockMarketData();

    return (
        <DashboardShell>
            <AuthGate>
                <DashboardHeader />

                <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:py-6 md:px-6 md:py-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <section className="space-y-7 lg:col-span-8">
                            <div className="space-y-4">
                                <Greeting
                                    title={data.greeting.title}
                                    subtitle={data.greeting.subtitle}
                                    sessions={data.sessions}
                                />
                                <NoTradeDayBanner />
                                <MarketSessions sessions={data.sessions} />
                            </div>

                            <MacroPanel />

                            <div className="space-y-3">
                                <SectionHeader
                                    title="Instruments"
                                    description="AI-powered FX analysis with live TradingView charts"
                                />
                                <InstrumentsGrid />
                            </div>
                        </section>

                        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-[76px] lg:self-start">
                            <NewsHeadlines />

                            <div className="space-y-3">
                                <SectionHeader
                                    title="Fundamentals"
                                    description="Calendar risk + risk regime"
                                />
                                <FundamentalsPanel
                                    riskMode={data.fundamentals.riskMode}
                                    events={data.fundamentals.events}
                                />
                            </div>
                        </aside>
                    </div>
                </main>
            </AuthGate>
        </DashboardShell>
    );
}
