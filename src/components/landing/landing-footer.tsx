import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="border-t border-white/[0.03] bg-[#050508]">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-zinc-500" />
                            <span className="flex items-center gap-2">
                                <span className="text-[14px] font-bold tracking-tight">
                                    Get<span className="text-zinc-600">TradingBias</span>
                                </span>
                                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-zinc-400">
                                    BETA
                                </span>
                            </span>
                        </div>
                        <p className="mt-2.5 max-w-[260px] text-[11.5px] leading-[1.6] text-zinc-700">
                            AI-powered institutional trading terminal for FX traders.
                            Built for speed, accuracy, and actionable insights.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-14">
                        <div>
                            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                                Legal
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/privacy"
                                    className="text-[12px] text-zinc-700 transition-colors hover:text-zinc-500"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href="/terms"
                                    className="text-[12px] text-zinc-700 transition-colors hover:text-zinc-500"
                                >
                                    Terms of Service
                                </Link>
                                <Link
                                    href="/disclaimer"
                                    className="text-[12px] text-zinc-700 transition-colors hover:text-zinc-500"
                                >
                                    Risk Disclaimer
                                </Link>
                            </div>
                        </div>

                        <div>
                            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                                Product
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/dashboard"
                                    className="text-[12px] text-zinc-700 transition-colors hover:text-zinc-500"
                                >
                                    Terminal
                                </Link>
                                <Link
                                    href="/#features"
                                    className="text-[12px] text-zinc-700 transition-colors hover:text-zinc-500"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/#inside-dashboard"
                                    className="text-[12px] text-zinc-700 transition-colors hover:text-zinc-500"
                                >
                                    Inside Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center gap-2.5 border-t border-white/[0.03] pt-6 md:flex-row md:justify-between">
                    <p className="text-[10.5px] text-zinc-700">
                        © GetTradingBias. All rights reserved.
                    </p>
                    <p className="text-[10px] text-zinc-800">
                        Trading involves risk. Past performance does not guarantee future
                        results.
                    </p>
                </div>
            </div>
        </footer>
    );
}
