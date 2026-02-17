"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, BarChart3, Globe } from "lucide-react";
import { useRef, useEffect, useState, useMemo } from "react";

const PAIRS = [
    { label: "EUR/USD", icon: TrendingUp },
    { label: "GBP/USD", icon: BarChart3 },
    { label: "USD/JPY", icon: Globe },
];

// Floating particles for background
function FloatingParticles() {
    const particles = useMemo(() => {
        function mulberry32(seed: number) {
            return function () {
                let t = (seed += 0x6d2b79f5);
                t = Math.imul(t ^ (t >>> 15), t | 1);
                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        }

        const rand = mulberry32(1337);
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: rand() * 100,
            y: rand() * 100,
            size: rand() * 4 + 2,
            duration: rand() * 20 + 15,
            delay: rand() * 5,
        }));
    }, []);

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-emerald-400/20"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [-30, 30, -30],
                        x: [-10, 10, -10],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
// Enhanced animated gradient mesh
function BackgroundMesh() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Primary glow — top center */}
            <motion.div
                className="absolute left-1/2 top-0 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-b from-emerald-500/[0.05] via-zinc-500/[0.02] to-transparent blur-[100px]"
                animate={{
                    scale: [1, 1.05, 1.02, 1],
                    opacity: [0.4, 0.6, 0.5, 0.4],
                    x: ["-50%", "-48%", "-52%", "-50%"],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary violet glow */}
            <motion.div
                className="absolute -right-32 top-20 h-[600px] w-[600px] rounded-full bg-violet-500/[0.025] blur-[120px]"
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Tertiary sky glow */}
            <motion.div
                className="absolute -left-32 top-40 h-[500px] w-[500px] rounded-full bg-sky-500/[0.02] blur-[100px]"
                animate={{
                    scale: [1, 1.08, 1],
                    x: [0, -20, 0],
                    y: [0, 30, 0],
                    opacity: [0.15, 0.35, 0.15],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            />

            {/* Bottom glow */}
            <motion.div
                className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500/[0.03] blur-[80px]"
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Animated grid lines */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Noise texture */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
            />

            <FloatingParticles />
        </div>
    );
}

// Magnetic button component
function MagneticButton({
    children,
    href,
    variant = "primary",
}: {
    children: React.ReactNode;
    href: string;
    variant?: "primary" | "secondary";
}) {
    const ref = useRef<HTMLAnchorElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        x.set(distanceX * 0.15);
        y.set(distanceY * 0.15);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const baseClasses = variant === "primary"
        ? "group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 px-7 py-3 text-[14px] font-semibold text-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3),0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:from-white hover:to-zinc-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.35)]"
        : "group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-7 py-3 text-[14px] font-medium text-zinc-500 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03] hover:text-zinc-300";

    return (
        <motion.div
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <Link href={href} className={baseClasses} ref={ref}>
                {variant === "primary" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                )}
                <span className="relative">{children}</span>
                {variant === "primary" && (
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                )}
                {variant === "secondary" && (
                    <span className="text-zinc-700 transition-colors duration-300 group-hover:text-zinc-500">→</span>
                )}
            </Link>
        </motion.div>
    );
}

// Animated badge with glow
function AnimatedBadge() {
    return (
        <motion.div
            className="mb-8 flex justify-center"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
            <motion.div
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-1.5"
                whileHover={{ scale: 1.02, borderColor: "rgba(16, 185, 129, 0.2)" }}
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                    <Zap className="h-3 w-3 text-emerald-500/60" />
                </motion.div>
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-emerald-400/60">
                    AI-Powered Trading Intelligence
                </span>
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            </motion.div>
        </motion.div>
    );
}

// Split text animation component
function SplitText({ text, className }: { text: string; className?: string }) {
    const words = text.split(" ");
    
    return (
        <motion.span className={className}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-[0.25em]"
                    initial={{ opacity: 0, y: 20, rotateX: -40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                        duration: 0.6,
                        delay: 0.3 + i * 0.08,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.span>
    );
}

export function HeroSection() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <section className="relative min-h-[95vh] flex items-center overflow-hidden">
            <BackgroundMesh />

            <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
                <AnimatedBadge />

                {/* Headline with enhanced animations */}
                <div className="relative">
                    {/* Floating glow behind text */}
                    <motion.div
                        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.03] blur-[100px]"
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <h1 className="relative mx-auto max-w-4xl text-center text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.03em] perspective-[1000px]">
                        <span className="bg-gradient-to-b from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                            {mounted ? <SplitText text="The Terminal Built" /> : "The Terminal Built"}
                        </span>
                        <br className="hidden sm:block" />
                        <motion.span
                            className="bg-gradient-to-r from-zinc-200 via-emerald-200/70 to-zinc-300 bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        >
                            for Serious Traders
                        </motion.span>
                    </h1>
                </div>

                {/* Subheadline */}
                <motion.p
                    className="mx-auto mt-6 max-w-lg text-center text-[15px] leading-relaxed text-zinc-500 md:text-[16px] md:leading-7"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 1.2, ease: [0.23, 1, 0.32, 1] }}
                >
                    Real-time news, 1H/4H technical analysis, and macro
                    fundamentals — unified by AI into a single institutional dashboard.
                </motion.p>

                {/* CTA buttons with magnetic effect */}
                <motion.div
                    className="mt-10 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 1.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    <MagneticButton href="/dashboard" variant="primary">
                        Access Terminal
                    </MagneticButton>
                    <MagneticButton href="#features" variant="secondary">
                        Explore Features
                    </MagneticButton>
                </motion.div>

                {/* Instrument chips with enhanced hover */}
                <div className="mt-16 flex items-center justify-center gap-3 flex-wrap">
                    {PAIRS.map((pair, i) => {
                        const Icon = pair.icon;
                        return (
                            <motion.div
                                key={pair.label}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: 1.6 + i * 0.1,
                                    ease: [0.23, 1, 0.32, 1],
                                }}
                                whileHover={{ 
                                    scale: 1.05, 
                                    y: -2,
                                    transition: { duration: 0.2 }
                                }}
                                className="group flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-2.5 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.025] cursor-default"
                            >
                                <motion.div
                                    className="relative h-1.5 w-1.5"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                >
                                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                                    <div className="absolute inset-0 rounded-full bg-emerald-400/60" />
                                </motion.div>
                                <Icon className="h-3.5 w-3.5 text-zinc-600 transition-colors duration-300 group-hover:text-emerald-400/70" />
                                <span className="text-[12px] font-mono font-semibold tracking-wide text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
                                    {pair.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Trust line */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 2 }}
                >
                    <motion.p
                        className="text-[11px] tracking-[0.12em] uppercase text-zinc-700"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 2.2 }}
                    >
                        Built for institutional-grade FX analysis
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
