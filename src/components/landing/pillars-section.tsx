"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Newspaper, BarChart3, Landmark } from "lucide-react";

const PILLARS = [
    {
        step: "01",
        icon: Newspaper,
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
            line: "from-sky-500/20",
            chip: "border-sky-500/15 bg-sky-500/[0.05] text-sky-300/80",
            icon: "text-sky-300/70",
            bar: "from-sky-400/70 to-sky-300/40",
        }
    },
    {
        step: "02",
        icon: BarChart3,
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
            line: "from-violet-500/20",
            chip: "border-violet-500/15 bg-violet-500/[0.05] text-violet-300/80",
            icon: "text-violet-300/70",
            bar: "from-violet-400/70 to-violet-300/40",
        }
    },
    {
        step: "03",
        icon: Landmark,
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
            line: "from-amber-500/20",
            chip: "border-amber-500/15 bg-amber-500/[0.05] text-amber-300/80",
            icon: "text-amber-300/70",
            bar: "from-amber-400/70 to-amber-300/40",
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
                    initial={{ opacity: 0, y: 14 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                >
                    <motion.p 
                        className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600"
                        initial={{ opacity: 0, y: 8 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.45, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Methodology
                    </motion.p>
                    <motion.h2 
                        className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.55, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Three-Pillar AI Analysis
                    </motion.h2>
                    <motion.p 
                        className="mx-auto mt-3 max-w-md text-[14px] text-zinc-600"
                        initial={{ opacity: 0, y: 8 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.45, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Every bias is backed by news, technicals, and macro data —
                        never a single-factor call.
                    </motion.p>
                </motion.div>

                {/* Connecting line for desktop */}
                <div className="relative">
                    <div className="absolute top-[60px] left-[16.67%] right-[16.67%] hidden md:block">
                        <motion.div
                            className="h-px bg-gradient-to-r from-sky-500/20 via-violet-500/20 to-amber-500/20"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                            transition={{ duration: 1.2, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 relative">
                        {PILLARS.map((pillar, i) => (
                            <motion.div
                                key={pillar.step}
                                initial={{ opacity: 0, y: 14 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.55,
                                    delay: 0.25 + i * 0.08,
                                    ease: [0.23, 1, 0.32, 1],
                                }}
                                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.45)] transition-colors duration-300 hover:bg-white/[0.03] md:mx-2`}
                            >
                                {/* Connection dot for desktop */}
                                <motion.div
                                    className="absolute top-[44px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20 hidden md:block"
                                    initial={{ scale: 0 }}
                                    animate={isInView ? { scale: 1 } : {}}
                                    transition={{ duration: 0.3, delay: 1 + i * 0.2 }}
                                />

                                {/* Top glow on hover */}
                                <motion.div 
                                    className={`pointer-events-none absolute -top-12 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${pillar.style.glow}`}
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                />

                                <div className="relative">
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02]">
                                                <pillar.icon className={`h-5 w-5 ${pillar.style.icon}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-300/80">
                                                        {pillar.step}
                                                    </span>
                                                    <span className="text-[10px] font-medium tracking-[0.12em] text-zinc-600">
                                                        Weight
                                                        <span className="ml-1 text-zinc-500">{pillar.weight}</span>
                                                    </span>
                                                </div>
                                                <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-zinc-200">
                                                    {pillar.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <motion.div
                                            className={`h-1.5 w-1.5 shrink-0 rounded-full opacity-70 ${pillar.style.dot} transition-opacity duration-300 group-hover:opacity-100 mt-1.5`}
                                            animate={{ opacity: [0.55, 0.85, 0.55] }}
                                            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.25 }}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                                            <motion.div
                                                className={`h-full rounded-full bg-gradient-to-r ${pillar.style.bar}`}
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={isInView ? { width: pillar.weight, opacity: 1 } : {}}
                                                transition={{ duration: 0.85, delay: 0.5 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                                            />
                                        </div>
                                    </div>

                                    {/* Animated separator */}
                                    <motion.div 
                                        className={`mb-4 h-px bg-gradient-to-r ${pillar.style.line} to-transparent`}
                                        initial={{ scaleX: 0, opacity: 0 }}
                                        animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                                        transition={{ duration: 0.7, delay: 0.45 + i * 0.08 }}
                                    />
                                    <p className="text-[12.5px] leading-[1.65] text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500">
                                        {pillar.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
