"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PILLARS = [
    {
        step: "01",
        title: "News Flow",
        weight: "40%",
        description:
            "AI scans live headlines, identifies currency-moving events, and scores sentiment in real-time. Breaking news drives intraday bias.",
        color: "sky",
        style: {
            dot: "bg-sky-500/80",
            glow: "group-hover:bg-sky-500/[0.04]",
            border: "group-hover:border-sky-500/10",
            accent: "group-hover:text-sky-400/80",
        }
    },
    {
        step: "02",
        title: "Technical Analysis",
        weight: "30%",
        description:
            "1H and 4H price action, trend direction, momentum scoring, and key support/resistance levels with actual prices.",
        color: "violet",
        style: {
            dot: "bg-violet-500/80",
            glow: "group-hover:bg-violet-500/[0.04]",
            border: "group-hover:border-violet-500/10",
            accent: "group-hover:text-violet-400/80",
        }
    },
    {
        step: "03",
        title: "Macro Backdrop",
        weight: "30%",
        description:
            "Central bank rates, CPI, GDP, and unemployment data frame the fundamental landscape and medium-term direction.",
        color: "amber",
        style: {
            dot: "bg-amber-500/80",
            glow: "group-hover:bg-amber-500/[0.04]",
            border: "group-hover:border-amber-500/10",
            accent: "group-hover:text-amber-400/80",
        }
    },
];

export function PillarsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="methodology"
            className="relative border-t border-white/[0.03]"
        >
            <div ref={ref} className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
                        Methodology
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]">
                        Three-Pillar AI Analysis
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[14px] text-zinc-600">
                        Every bias is backed by news, technicals, and macro data —
                        never a single-factor call.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {PILLARS.map((pillar, i) => (
                        <motion.div
                            key={pillar.step}
                            initial={{ opacity: 0, y: 24 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                duration: 0.5,
                                delay: 0.15 + i * 0.12,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6 transition-all duration-500 ${pillar.style.border} hover:bg-white/[0.02]`}
                        >
                            {/* Top glow on hover */}
                            <div className={`pointer-events-none absolute -top-12 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${pillar.style.glow}`} />

                            <div className="relative">
                                {/* Step number + weight */}
                                <div className="mb-5 flex items-end justify-between">
                                    <span className={`text-3xl font-bold tracking-tight text-zinc-700 transition-colors duration-300 ${pillar.style.accent}`}>
                                        {pillar.step}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-1.5 w-1.5 rounded-full opacity-70 ${pillar.style.dot} transition-opacity duration-300 group-hover:opacity-100`} />
                                        <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">
                                            {pillar.weight} weight
                                        </span>
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="mb-4 h-px bg-white/[0.04]" />

                                <h3 className="mb-2 text-[15px] font-semibold text-zinc-300 transition-colors duration-300 group-hover:text-zinc-200">
                                    {pillar.title}
                                </h3>
                                <p className="text-[12.5px] leading-[1.65] text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500">
                                    {pillar.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
