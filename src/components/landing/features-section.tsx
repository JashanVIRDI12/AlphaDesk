"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    Brain,
    Newspaper,
    BarChart3,
    Globe,
    LineChart,
    Lock,
} from "lucide-react";

const FEATURES = [
    {
        icon: Brain,
        title: "AI Instrument Analysis",
        description:
            "Three-pillar analysis blending live news, 1H/4H technicals, and macro fundamentals for each pair.",
        color: "emerald",
    },
    {
        icon: Newspaper,
        title: "Real-Time News Feed",
        description:
            "Live FX headlines from multiple sources, filtered and scored by relevance. AI-curated for actionable insights.",
        color: "sky",
    },
    {
        icon: BarChart3,
        title: "Live TradingView Charts",
        description:
            "Embedded mini-charts for each instrument. One-click to full chart view for deeper technical analysis.",
        color: "violet",
    },
    {
        icon: Globe,
        title: "AI Macro Desk",
        description:
            "AI-generated macro analysis covering central bank policy, rate differentials, CPI, GDP, and risk sentiment.",
        color: "amber",
    },
    {
        icon: LineChart,
        title: "Economic Calendar",
        description:
            "High-impact events with AI day overview. Automatic 'No Trade Day' detection for bank holidays.",
        color: "rose",
    },
    {
        icon: Lock,
        title: "Secure Terminal Access",
        description:
            "Institutional-grade authentication with encrypted access codes. Your analysis stays private.",
        color: "cyan",
    },
];

const COLORS: Record<string, { icon: string; glow: string; border: string }> = {
    emerald: {
        icon: "group-hover:text-emerald-400/80",
        glow: "group-hover:bg-emerald-500/[0.03]",
        border: "group-hover:border-emerald-500/10",
    },
    sky: {
        icon: "group-hover:text-sky-400/80",
        glow: "group-hover:bg-sky-500/[0.03]",
        border: "group-hover:border-sky-500/10",
    },
    violet: {
        icon: "group-hover:text-violet-400/80",
        glow: "group-hover:bg-violet-500/[0.03]",
        border: "group-hover:border-violet-500/10",
    },
    amber: {
        icon: "group-hover:text-amber-400/80",
        glow: "group-hover:bg-amber-500/[0.03]",
        border: "group-hover:border-amber-500/10",
    },
    rose: {
        icon: "group-hover:text-rose-400/80",
        glow: "group-hover:bg-rose-500/[0.03]",
        border: "group-hover:border-rose-500/10",
    },
    cyan: {
        icon: "group-hover:text-cyan-400/80",
        glow: "group-hover:bg-cyan-500/[0.03]",
        border: "group-hover:border-cyan-500/10",
    },
};

function FeatureCard({
    feature,
    index,
}: {
    feature: (typeof FEATURES)[number];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const Icon = feature.icon;
    const style = COLORS[feature.color];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6 transition-all duration-500 hover:bg-white/[0.02] ${style.border}`}
        >
            {/* Corner glow on hover */}
            <div
                className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 ${style.glow}`}
            />

            {/* Top edge highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] transition-all duration-300 group-hover:border-white/[0.08] group-hover:bg-white/[0.04]`}>
                    <Icon className={`h-[18px] w-[18px] text-zinc-500 transition-colors duration-300 ${style.icon}`} />
                </div>

                <h3 className="mb-2 text-[14px] font-semibold tracking-tight text-zinc-300 transition-colors duration-300 group-hover:text-zinc-200">
                    {feature.title}
                </h3>
                <p className="text-[12.5px] leading-[1.6] text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500">
                    {feature.description}
                </p>
            </div>
        </motion.div>
    );
}

export function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="features"
            className="relative border-t border-white/[0.03]"
        >
            {/* Section separator glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.008] to-transparent" />

            <div ref={ref} className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
                        Platform
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]">
                        Everything a trader needs
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[14px] text-zinc-600">
                        AI-powered analysis across every dimension of the market,
                        unified in a single terminal.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((feature, i) => (
                        <FeatureCard key={feature.title} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
