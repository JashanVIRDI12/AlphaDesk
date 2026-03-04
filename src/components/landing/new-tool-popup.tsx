"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Calculator, Sparkles, ArrowRight } from "lucide-react";

const STORAGE_KEY = "gtb_new_tool_popup_v1"; // bump version to show again after updates

export function NewToolPopup() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show 800ms after page load; don't show if already dismissed
        const alreadyDismissed = localStorage.getItem(STORAGE_KEY);
        if (alreadyDismissed) return;

        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, "dismissed");
    };

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop — subtle, doesn't block scroll */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px]"
                        onClick={dismiss}
                        aria-hidden="true"
                    />

                    {/* Popup card */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="New tool announcement"
                        initial={{ opacity: 0, scale: 0.88, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28, delay: 0.05 }}
                        className="fixed left-1/2 top-1/2 z-[100] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-[#0d0d14] shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(99,102,241,0.08)] backdrop-blur-2xl">
                            {/* Top glow line */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />

                            {/* Ambient glow */}
                            <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[40px]" />

                            <div className="relative p-5">
                                {/* Header row */}
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* Icon */}
                                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                                            <Calculator className="h-5 w-5 text-indigo-400" />
                                            {/* Pulse dot */}
                                            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                                            </span>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles className="h-2.5 w-2.5 text-indigo-400/70" />
                                                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-400/80">
                                                    New Tool
                                                </span>
                                            </div>
                                            <p className="text-[14px] font-bold text-zinc-100">
                                                Lot Size Calculator
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={dismiss}
                                        aria-label="Close announcement"
                                        className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-400"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Body */}
                                <p className="mb-4 text-[12px] leading-relaxed text-zinc-500">
                                    Calculate the exact lot size for any forex trade — enter your account balance, risk %, stop loss, and pair.{" "}
                                    <span className="text-zinc-400">Works for 12+ pairs including XAU/USD.</span>
                                </p>

                                {/* Feature pills */}
                                <div className="mb-4 flex flex-wrap gap-1.5">
                                    {["Free", "No signup", "12 pairs", "Live R:R"].map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link
                                    href="/tools/lot-size-calculator"
                                    onClick={dismiss}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:brightness-110 hover:shadow-[0_0_28px_rgba(99,102,241,0.45)]"
                                >
                                    Try it free
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
