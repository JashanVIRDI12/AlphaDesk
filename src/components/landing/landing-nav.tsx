"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Menu, Zap, TrendingUp, X } from "lucide-react";

export function LandingNav() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = useCallback(() => setMobileOpen(false), []);

    useEffect(() => {
        if (!mobileOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeMobile();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [mobileOpen, closeMobile]);

    return (
        <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="sticky top-4 z-50 mx-auto max-w-7xl px-4"
        >
            {/* Pill-style glassmorphic container */}
            <div className="relative overflow-hidden rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl shadow-black/50">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5" />
                
                <div className="relative flex items-center justify-between px-6 py-3 sm:px-8">
                <Link href="/" className="group flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] transition-all duration-300 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/[0.08]">
                        <TrendingUp className="h-4 w-4 text-zinc-400 transition-colors duration-300 group-hover:text-indigo-400" />
                    </div>
                    <span className="flex items-center gap-2">
                        <span className="text-[15px] font-bold tracking-tight">
                            Get<span className="text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">TradingBias</span>
                        </span>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-zinc-300">
                            BETA
                        </span>
                    </span>
                </Link>

                <div className="hidden flex-wrap items-center justify-end gap-1 sm:flex">
                    <Link
                        href="#features"
                        className="rounded-lg px-3 py-2 text-[12px] text-zinc-600 transition-all duration-200 hover:bg-white/[0.03] hover:text-zinc-300 sm:px-3.5 sm:text-[13px]"
                    >
                        Features
                    </Link>
                    <Link
                        href="#inside-dashboard"
                        className="rounded-lg px-3 py-2 text-[12px] text-zinc-600 transition-all duration-200 hover:bg-white/[0.03] hover:text-zinc-300 sm:px-3.5 sm:text-[13px]"
                    >
                        Inside Dashboard
                    </Link>
                    <Link
                        href="/blog"
                        className="rounded-lg px-3 py-2 text-[12px] text-zinc-600 transition-all duration-200 hover:bg-white/[0.03] hover:text-zinc-300 sm:px-3.5 sm:text-[13px]"
                    >
                        Blog
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
                        className="group relative ml-0 flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-2 text-[12px] font-semibold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(99,102,241,0.5)] hover:brightness-110 sm:ml-2 sm:px-5 sm:text-[13px]"
                    >
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.2s_ease-in-out_infinite]" />
                        <span className="pointer-events-none absolute inset-[1px] rounded-full bg-gradient-to-b from-white/[0.12] to-transparent" />
                        <Zap className="relative h-3.5 w-3.5 text-indigo-200 transition-colors duration-300 group-hover:text-white" />
                        <span className="relative text-white/90 transition-colors duration-300 group-hover:text-white">
                            Open Terminal
                        </span>
                    </Link>
                </div>

                <button
                    type="button"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    onClick={(e) => {
                        e.stopPropagation();
                        setMobileOpen((v) => !v);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] p-2 text-zinc-300 transition-all duration-200 hover:bg-white/[0.04] sm:hidden"
                >
                    {mobileOpen ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <Menu className="h-4 w-4" />
                    )}
                </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen ? (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close menu backdrop"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeMobile();
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm sm:hidden"
                        />

                        <motion.aside
                            role="dialog"
                            aria-modal="true"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed right-0 top-0 z-[80] h-dvh w-[86vw] max-w-sm border-l border-white/[0.08] bg-[#06060a]/90 p-4 backdrop-blur-2xl sm:hidden"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-zinc-200">
                                    Menu
                                </span>
                                <button
                                    type="button"
                                    aria-label="Close menu"
                                    onClick={closeMobile}
                                    className="inline-flex items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] p-2 text-zinc-300 transition-all duration-200 hover:bg-white/[0.04]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-4 grid gap-1">
                                <Link
                                    href="#features"
                                    onClick={closeMobile}
                                    className="rounded-xl px-3 py-3 text-[13px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.04]"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#inside-dashboard"
                                    onClick={closeMobile}
                                    className="rounded-lg px-3 py-2 text-[13px] text-zinc-300 transition-all duration-200 hover:bg-white/[0.03]"
                                >
                                    Inside Dashboard
                                </Link>
                                <Link
                                    href="/blog"
                                    onClick={closeMobile}
                                    className="rounded-xl px-3 py-3 text-[13px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.04]"
                                >
                                    Blog
                                </Link>
                                <Link
                                    href="/privacy"
                                    onClick={closeMobile}
                                    className="rounded-xl px-3 py-3 text-[13px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.04]"
                                >
                                    Legal
                                </Link>
                            </div>

                            <div className="mt-4 h-px bg-white/[0.06]" />

                            <Link
                                href="/dashboard"
                                onClick={closeMobile}
                                className="group relative mt-4 flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-3.5 text-[13px] font-semibold shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] hover:brightness-110"
                            >
                                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.2s_ease-in-out_infinite]" />
                                <span className="pointer-events-none absolute inset-[1px] rounded-[11px] bg-gradient-to-b from-white/[0.12] to-transparent" />
                                <Zap className="relative h-4 w-4 text-indigo-200" />
                                <span className="relative text-white/90">Open Terminal</span>
                            </Link>
                        </motion.aside>
                    </>
                ) : null}
            </AnimatePresence>
        </motion.nav>
    );
}
