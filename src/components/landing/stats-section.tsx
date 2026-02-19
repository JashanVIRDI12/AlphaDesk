"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Users, Zap, Globe } from "lucide-react";

const STATS = [
    {
        icon: TrendingUp,
        value: "98%",
        label: "Uptime reliability",
        color: "emerald",
    },
    {
        icon: Users,
        value: "2.5K+",
        label: "Active traders",
        color: "sky",
    },
    {
        icon: Zap,
        value: "<1s",
        label: "Data refresh rate",
        color: "violet",
    },
    {
        icon: Globe,
        value: "24/5",
        label: "Market coverage",
        color: "amber",
    },
];

export function StatsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative border-t border-white/[0.03] py-20 md:py-28">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.008] to-transparent" />
            
            <div ref={ref} className="relative mx-auto max-w-6xl px-6">
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]">
                        Built for performance
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[14px] text-zinc-600">
                        Real-time data, institutional reliability, and lightning-fast execution.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    {STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.1,
                                    ease: [0.23, 1, 0.32, 1],
                                }}
                                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03]"
                            >
                                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/[0.03] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                                
                                <div className="relative">
                                    <div className="mb-4 flex justify-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02]">
                                            <Icon className="h-5 w-5 text-zinc-500" />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-2 text-3xl font-bold text-zinc-100 md:text-4xl">
                                        {stat.value}
                                    </div>
                                    
                                    <div className="text-[13px] text-zinc-600">
                                        {stat.label}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
