"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
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

const COLORS: Record<string, { icon: string; glow: string; border: string; gradient: string }> = {
    emerald: {
        icon: "group-hover:text-emerald-400/80",
        glow: "group-hover:bg-emerald-500/[0.04]",
        border: "group-hover:border-emerald-500/10",
        gradient: "from-emerald-500/10 via-transparent to-transparent",
    },
    sky: {
        icon: "group-hover:text-sky-400/80",
        glow: "group-hover:bg-sky-500/[0.04]",
        border: "group-hover:border-sky-500/10",
        gradient: "from-sky-500/10 via-transparent to-transparent",
    },
    violet: {
        icon: "group-hover:text-violet-400/80",
        glow: "group-hover:bg-violet-500/[0.04]",
        border: "group-hover:border-violet-500/10",
        gradient: "from-violet-500/10 via-transparent to-transparent",
    },
    amber: {
        icon: "group-hover:text-amber-400/80",
        glow: "group-hover:bg-amber-500/[0.04]",
        border: "group-hover:border-amber-500/10",
        gradient: "from-amber-500/10 via-transparent to-transparent",
    },
    rose: {
        icon: "group-hover:text-rose-400/80",
        glow: "group-hover:bg-rose-500/[0.04]",
        border: "group-hover:border-rose-500/10",
        gradient: "from-rose-500/10 via-transparent to-transparent",
    },
    cyan: {
        icon: "group-hover:text-cyan-400/80",
        glow: "group-hover:bg-cyan-500/[0.04]",
        border: "group-hover:border-cyan-500/10",
        gradient: "from-cyan-500/10 via-transparent to-transparent",
    },
};

// 3D Tilt Card Component
function TiltCard({
    feature,
    index,
}: {
    feature: (typeof FEATURES)[number];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const Icon = feature.icon;
    const style = COLORS[feature.color];

    // Mouse position for 3D tilt
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 300, damping: 30 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width);
        y.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.23, 1, 0.32, 1],
            }}
            style={{
                rotateX: isInView ? rotateX : 0,
                rotateY: isInView ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6 transition-colors duration-500 hover:bg-white/[0.02] ${style.border} cursor-pointer`}
        >
            {/* Dynamic glow following cursor */}
            <div
                className={`pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 ${style.glow}`}
            />

            {/* Top gradient border glow */}
            <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />

            {/* Corner accent */}
            <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${style.glow}`} />

            <div className="relative" style={{ transform: "translateZ(20px)" }}>
                <motion.div 
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] transition-all duration-300 group-hover:border-white/[0.08] group-hover:bg-white/[0.04]`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <Icon className={`h-5 w-5 text-zinc-500 transition-colors duration-300 ${style.icon}`} />
                </motion.div>

                <h3 className="mb-2 text-[15px] font-semibold tracking-tight text-zinc-300 transition-colors duration-300 group-hover:text-zinc-200">
                    {feature.title}
                </h3>
                <p className="text-[12.5px] leading-[1.7] text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500">
                    {feature.description}
                </p>
            </div>

            {/* Gradient overlay on hover */}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                >
                    <motion.p 
                        className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Platform
                    </motion.p>
                    <motion.h2 
                        className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Everything a trader needs
                    </motion.h2>
                    <motion.p 
                        className="mx-auto mt-3 max-w-md text-[14px] text-zinc-600"
                        initial={{ opacity: 0, y: 15 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                        AI-powered analysis across every dimension of the market,
                        unified in a single terminal.
                    </motion.p>
                </motion.div>

                <div 
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    style={{ perspective: "1000px" }}
                >
                    {FEATURES.map((feature, i) => (
                        <TiltCard key={feature.title} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
