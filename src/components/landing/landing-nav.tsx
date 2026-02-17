"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, TrendingUp } from "lucide-react";

export function LandingNav() {
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="sticky top-0 z-50 border-b border-white/[0.03]"
        >
            {/* Glassmorphic backdrop */}
            <div className="absolute inset-0 bg-[#06060a]/60 backdrop-blur-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
                <Link href="/" className="group flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] transition-all duration-300 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.05]">
                        <TrendingUp className="h-4 w-4 text-zinc-400 transition-colors duration-300 group-hover:text-emerald-400" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight">
                        Get<span className="text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">TradingBias</span>
                    </span>
                </Link>

                <div className="flex flex-wrap items-center justify-end gap-1">
                    <Link
                        href="#features"
                        className="rounded-lg px-3 py-2 text-[12px] text-zinc-600 transition-all duration-200 hover:bg-white/[0.03] hover:text-zinc-300 sm:px-3.5 sm:text-[13px]"
                    >
                        Features
                    </Link>
                    <Link
                        href="#methodology"
                        className="rounded-lg px-3 py-2 text-[12px] text-zinc-600 transition-all duration-200 hover:bg-white/[0.03] hover:text-zinc-300 sm:px-3.5 sm:text-[13px]"
                    >
                        Methodology
                    </Link>
                    <Link
                        href="/privacy"
                        className="rounded-lg px-3 py-2 text-[12px] text-zinc-600 transition-all duration-200 hover:bg-white/[0.03] hover:text-zinc-300 sm:px-3.5 sm:text-[13px]"
                    >
                        Legal
                    </Link>
                    <div className="ml-2 hidden h-4 w-px bg-white/[0.05] sm:block" />
                    <Link
                        href="/dashboard"
                        className="group relative ml-0 flex items-center gap-1.5 overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-[12px] font-medium transition-all duration-300 hover:border-emerald-500/20 hover:bg-emerald-500/[0.04] sm:ml-2 sm:px-4 sm:text-[13px]"
                    >
                        <Shield className="h-3.5 w-3.5 text-zinc-500 transition-colors duration-300 group-hover:text-emerald-400" />
                        <span className="text-zinc-400 transition-colors duration-300 group-hover:text-emerald-300">
                            Terminal
                        </span>
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
