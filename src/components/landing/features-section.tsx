"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, LineChart } from "lucide-react";

export function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });

    return (
        <section
            id="features"
            className="relative border-t border-white/[0.05] bg-black"
        >
            {/* Liquid gradient background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute right-1/4 top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl" />
                <div className="absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-purple-500/15 via-violet-500/10 to-transparent blur-3xl" />
            </div>

            <div ref={ref} className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
                <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                        className="max-w-xl"
                    >
                        <p className="mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-500">Platform</p>
                        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                            Manage every trading decision from one intelligent dashboard
                        </h2>
                        <p className="mt-5 text-[15px] leading-7 text-zinc-400">
                            See live bias updates, news impact, technical trend strength, and macro context in one place. Built for fast decisions without losing depth.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                                <div className="mb-2 flex items-center gap-2 text-zinc-200">
                                    <Brain className="h-4 w-4 text-indigo-300" />
                                    <span className="text-sm font-medium">AI Bias Engine</span>
                                </div>
                                <p className="text-xs leading-6 text-zinc-400">Three-layer intelligence across news, technicals, and macro signals.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                                <div className="mb-2 flex items-center gap-2 text-zinc-200">
                                    <LineChart className="h-4 w-4 text-indigo-300" />
                                    <span className="text-sm font-medium">Live Pair Context</span>
                                </div>
                                <p className="text-xs leading-6 text-zinc-400">Real-time pair behavior with direction, momentum, and key levels.</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.985 }}
                        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                        transition={{ duration: 0.4, delay: 0.02, ease: [0.23, 1, 0.32, 1] }}
                        className="relative"
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-1 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
                            <div className="relative rounded-[22px] border border-white/10 bg-black/40 p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Dashboard Overview</p>
                                        <h3 className="mt-1 text-lg font-semibold text-zinc-100">EUR/USD Bias: Bullish</h3>
                                    </div>
                                    <span className="rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200">
                                        +0.62 Confidence
                                    </span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">News Flow</p>
                                        <p className="mt-2 text-sm font-semibold text-zinc-100">Constructive</p>
                                        <p className="text-xs text-zinc-400">ECB tone supportive</p>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Technicals</p>
                                        <p className="mt-2 text-sm font-semibold text-zinc-100">Trend Up</p>
                                        <p className="text-xs text-zinc-400">1H + 4H aligned</p>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Macro</p>
                                        <p className="mt-2 text-sm font-semibold text-zinc-100">Neutral+</p>
                                        <p className="text-xs text-zinc-400">Yield spread stable</p>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4">
                                    <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                                        <span>Bias Strength</span>
                                        <span>Last 6 Hours</span>
                                    </div>
                                    <div className="h-20 w-full rounded-lg bg-black/30 p-2">
                                        <svg viewBox="0 0 320 60" className="h-full w-full">
                                            <path d="M0,45 C30,20 55,50 80,34 C102,20 120,22 142,18 C170,10 190,30 215,24 C238,18 265,8 320,14" fill="none" stroke="url(#biasLine)" strokeWidth="2.5" strokeLinecap="round" />
                                            <defs>
                                                <linearGradient id="biasLine" x1="0" x2="1" y1="0" y2="0">
                                                    <stop offset="0%" stopColor="#818cf8" />
                                                    <stop offset="100%" stopColor="#c084fc" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
