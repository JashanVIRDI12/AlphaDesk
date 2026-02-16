"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

const PAIRS = [
    { label: "EUR/USD" },
    { label: "GBP/USD" },
    { label: "USD/JPY" },
];

/* Animated gradient mesh blobs — subtle with hint of color */
function BackgroundMesh() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Primary glow — top center, faint emerald tint */}
            <motion.div
                className="absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-b from-emerald-500/[0.035] via-zinc-600/[0.015] to-transparent blur-[120px]"
                animate={{
                    scale: [1, 1.04, 1],
                    opacity: [0.5, 0.65, 0.5],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Slight violet accent — right */}
            <motion.div
                className="absolute -right-20 top-32 h-[500px] w-[500px] rounded-full bg-violet-500/[0.015] blur-[100px]"
                animate={{
                    x: [0, 15, 0],
                    y: [0, -10, 0],
                    opacity: [0.3, 0.45, 0.3],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Slight sky accent — left */}
            <motion.div
                className="absolute -left-20 top-64 h-[400px] w-[400px] rounded-full bg-sky-500/[0.012] blur-[100px]"
                animate={{
                    x: [0, -10, 0],
                    y: [0, 15, 0],
                    opacity: [0.2, 0.35, 0.2],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Grid texture */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                }}
            />

            {/* Noise overlay */}
            <div
                className="absolute inset-0 opacity-[0.012]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center">
            <BackgroundMesh />

            <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
                {/* Badge — subtle emerald tint */}
                <motion.div
                    className="mb-8 flex justify-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-1.5 transition-all duration-300 hover:border-emerald-500/15">
                        <Zap className="h-3 w-3 text-emerald-500/50" />
                        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-emerald-400/50">
                            AI-Powered Trading Intelligence
                        </span>
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_4s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                    </div>
                </motion.div>

                {/* Headline */}
                <div className="relative">
                    {/* Floating glow behind text — faint emerald */}
                    <motion.div
                        className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.02] blur-[80px]"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.h1
                        className="relative mx-auto max-w-4xl text-center text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.03em]"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <span className="bg-gradient-to-b from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                            The Terminal Built{" "}
                        </span>
                        <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-zinc-200 via-emerald-200/70 to-zinc-300 bg-clip-text text-transparent">
                            for Serious Traders
                        </span>
                    </motion.h1>
                </div>

                {/* Subheadline */}
                <motion.p
                    className="mx-auto mt-6 max-w-lg text-center text-[15px] leading-relaxed text-zinc-500 md:text-[16px] md:leading-7"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Real-time news, 1H/4H technical analysis, and macro
                    fundamentals — unified by AI into a single institutional dashboard.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    className="mt-10 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                >
                    <Link
                        href="/dashboard"
                        className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 px-7 py-3 text-[14px] font-semibold text-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3),0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:from-white hover:to-zinc-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.35)] active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                        <span className="relative">Access Terminal</span>
                        <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>

                    <Link
                        href="#features"
                        className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-7 py-3 text-[14px] font-medium text-zinc-500 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03] hover:text-zinc-300 active:scale-[0.98]"
                    >
                        <span>Explore Features</span>
                        <span className="text-zinc-700 transition-colors duration-300 group-hover:text-zinc-500">→</span>
                    </Link>
                </motion.div>

                {/* Instrument chips */}
                <div className="mt-16 flex items-center justify-center gap-3">
                    {PAIRS.map((pair, i) => (
                        <motion.div
                            key={pair.label}
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.7 + i * 0.1,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="group flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-2.5 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]"
                        >
                            <div className="relative h-1.5 w-1.5">
                                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/25" />
                                <div className="absolute inset-0 rounded-full bg-emerald-400/50" />
                            </div>
                            <span className="text-[12px] font-mono font-semibold tracking-wide text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
                                {pair.label}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Trust line */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                >
                    <p className="text-[11px] tracking-[0.12em] uppercase text-zinc-700">
                        Built for institutional-grade FX analysis
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
