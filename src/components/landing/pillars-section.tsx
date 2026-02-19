"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BadgeCheck, CalendarClock, ShieldAlert, Activity } from "lucide-react";

const DASHBOARD_BLOCKS = [
    {
        title: "Bias Card",
        subtitle: "Direction + confidence",
        description: "Clear bullish, bearish, or neutral call with confidence scoring for quick execution.",
        icon: BadgeCheck,
    },
    {
        title: "Day Overview",
        subtitle: "Market context",
        description: "Summarized session outlook combining live news impact, volatility profile, and risk tone.",
        icon: CalendarClock,
    },
    {
        title: "No-Trade Day Banner",
        subtitle: "Risk filter",
        description: "Automatically flags high-risk days such as major macro events and low-quality market structure.",
        icon: ShieldAlert,
    },
    {
        title: "Pair Intelligence",
        subtitle: "EUR/USD, GBP/USD, USD/JPY, XAU/USD",
        description: "Track pair-specific behavior, momentum shifts, and support/resistance context in one view.",
        icon: Activity,
    },
];

export function PillarsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });

    return (
        <section id="inside-dashboard" className="relative border-t border-white/[0.05] bg-black">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute right-1/4 top-1/3 h-[540px] w-[540px] rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl" />
                <div className="absolute left-1/4 bottom-0 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-blue-500/12 via-indigo-500/8 to-transparent blur-3xl" />
            </div>

            <div ref={ref} className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
                <motion.div
                    className="mb-14 text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                >
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600">Inside the Dashboard</p>
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-[34px]">Everything you need, right where decisions happen</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-[14px] text-zinc-400">
                        Replace scattered tools with one focused workspace for bias, context, and risk-aware execution.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {DASHBOARD_BLOCKS.map((block, i) => {
                        const Icon = block.icon;
                        return (
                            <motion.div
                                key={block.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                                whileHover={{ y: -4, scale: 1.01 }}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl shadow-2xl shadow-black/30 transition-all duration-300 hover:border-indigo-400/30"
                            >
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="relative">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                                            <Icon className="h-4 w-4 text-indigo-300" />
                                        </div>
                                        <span className="rounded-full border border-indigo-400/25 bg-indigo-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-indigo-200">
                                            Live
                                        </span>
                                    </div>
                                    <h3 className="text-[17px] font-semibold tracking-tight text-zinc-100">{block.title}</h3>
                                    <p className="mt-1 text-[12px] text-zinc-500">{block.subtitle}</p>
                                    <p className="mt-3 text-[13px] leading-6 text-zinc-400">{block.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
