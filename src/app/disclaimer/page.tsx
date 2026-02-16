import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
    title: "Risk Disclaimer — AlphaDesk",
    description:
        "Risk disclaimer and financial disclosure for AlphaDesk AI trading terminal.",
};

function LegalNav() {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#07070b]/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-zinc-100">
                        AlphaDesk
                    </span>
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Home
                </Link>
            </div>
        </nav>
    );
}

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-[#07070b] text-zinc-300">
            <LegalNav />

            <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
                <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/[0.06]">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
                            Risk Disclaimer
                        </h1>
                        <p className="mt-2 text-[13px] text-zinc-600">
                            Last updated: February 16, 2026
                        </p>
                    </div>
                </div>

                {/* Risk warning banner */}
                <div className="mt-8 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4">
                    <p className="text-[14px] font-medium leading-relaxed text-amber-300/80">
                        ⚠️ Trading foreign exchange (forex) and other financial instruments
                        carries a high level of risk and may not be suitable for all
                        investors. You should carefully consider your investment objectives,
                        level of experience, and risk appetite before making any trading
                        decisions.
                    </p>
                </div>

                <div className="mt-12 space-y-10 text-[14px] leading-relaxed text-zinc-400">
                    {/* 1 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            1. Not Financial Advice
                        </h2>
                        <p>
                            AlphaDesk is an informational and analytical tool. The content
                            provided on this platform — including AI-generated analysis, bias
                            assessments, confidence scores, news summaries, technical levels,
                            and macro commentary — is for <strong className="text-zinc-300">
                                educational and informational purposes only</strong>. None of the
                            content constitutes financial advice, investment advice, trading
                            advice, or any other form of advice.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            2. No Recommendation or Solicitation
                        </h2>
                        <p>
                            Nothing on this platform should be construed as a recommendation,
                            solicitation, or offer to buy or sell any financial instrument. Any
                            &quot;Bullish&quot; or &quot;Bearish&quot; bias displayed is an algorithmic assessment
                            and does not represent advice to trade in any particular direction.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            3. Risk of Loss
                        </h2>
                        <p>
                            Foreign exchange trading involves substantial risk of loss and is
                            not appropriate for everyone. The possibility exists that you could
                            sustain a loss of some or all of your initial investment. Do not
                            invest money that you cannot afford to lose. Be aware of the risks
                            associated with forex trading and seek independent financial
                            advice if necessary.
                        </p>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            4. AI Limitations
                        </h2>
                        <p className="mb-3">
                            The AI-powered analysis provided by AlphaDesk has inherent
                            limitations:
                        </p>
                        <ul className="ml-4 list-disc space-y-2">
                            <li>
                                AI models can produce inaccurate, biased, or misleading analysis
                            </li>
                            <li>
                                Analysis may be based on cached or delayed data (typically up to
                                1–2 hours old)
                            </li>
                            <li>
                                Confidence scores are algorithmic estimates, not guarantees of
                                accuracy
                            </li>
                            <li>
                                AI cannot predict unexpected events (black swans, flash crashes,
                                policy surprises)
                            </li>
                            <li>
                                Technical levels are derived from historical data and may not
                                hold in the future
                            </li>
                            <li>
                                News sentiment analysis may misinterpret context, sarcasm, or
                                nuance
                            </li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            5. Past Performance
                        </h2>
                        <p>
                            Past performance is not indicative of future results. Any
                            historical analysis, bias accuracy, or backtesting results shown
                            on this platform are for informational purposes only and should
                            not be taken as a guarantee of future performance.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            6. Third-Party Data
                        </h2>
                        <p>
                            AlphaDesk aggregates data from third-party sources including news
                            providers, market data feeds, and economic calendars. We do not
                            guarantee the accuracy, completeness, or timeliness of third-party
                            data. Trading decisions based on potentially inaccurate data are
                            made at your own risk.
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            7. Leverage and Margin
                        </h2>
                        <p>
                            Forex trading often involves leverage, which can magnify both
                            profits and losses. Trading on margin carries significant risk.
                            You may lose more than your initial deposit when trading with
                            leverage. Ensure you fully understand the implications of margin
                            trading before engaging in leveraged transactions.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            8. Regulatory Compliance
                        </h2>
                        <p>
                            AlphaDesk is not a regulated financial institution, broker, or
                            investment advisor. We do not hold, manage, or have access to
                            client funds. Users are responsible for ensuring that their own
                            trading activities comply with the laws and regulations of their
                            jurisdiction.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            9. Your Responsibility
                        </h2>
                        <p>
                            You are entirely responsible for your own trading decisions. You
                            should:
                        </p>
                        <ul className="ml-4 mt-2 list-disc space-y-2">
                            <li>Conduct your own research and due diligence</li>
                            <li>Use proper risk management (stop losses, position sizing)</li>
                            <li>Never trade with money you cannot afford to lose</li>
                            <li>
                                Seek professional advice from a licenced financial advisor if
                                needed
                            </li>
                            <li>
                                Verify all data and analysis independently before making
                                decisions
                            </li>
                        </ul>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            10. Limitation of Liability
                        </h2>
                        <p>
                            AlphaDesk, its creators, employees, and affiliates shall not be
                            held liable for any financial losses, damages, or costs incurred
                            as a result of using the platform or relying on the analysis and
                            information provided. Use the Service at your own risk.
                        </p>
                    </section>

                    {/* Acknowledgement */}
                    <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            Acknowledgement
                        </h2>
                        <p>
                            By using AlphaDesk, you acknowledge that you have read,
                            understood, and agree to this Risk Disclaimer. You accept full
                            responsibility for your trading decisions and understand that
                            AlphaDesk provides informational tools, not financial advice.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
                            Contact Us
                        </h2>
                        <p>
                            If you have questions about this disclaimer, please reach out
                            to us at{" "}
                            <span className="text-zinc-300 font-medium">support@alphadesk.io</span>.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.04] bg-[#050508]">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
                    <p className="text-[11px] text-zinc-700">
                        © {new Date().getFullYear()} AlphaDesk. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-[11px] text-zinc-600 hover:text-zinc-400">Privacy</Link>
                        <Link href="/terms" className="text-[11px] text-zinc-600 hover:text-zinc-400">Terms</Link>
                        <Link href="/disclaimer" className="text-[11px] text-zinc-600 hover:text-zinc-400">Disclaimer</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
