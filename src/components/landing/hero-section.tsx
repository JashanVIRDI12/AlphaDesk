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
// Liquid glass gradient background
function BackgroundMesh() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Liquid gradient orbs */}
            <motion.div
                className="absolute left-1/4 top-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-transparent blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute right-1/4 top-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-blue-500/25 via-indigo-500/15 to-transparent blur-3xl"
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-t from-purple-600/20 via-indigo-600/10 to-transparent blur-3xl"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)",
                    backgroundSize: "100px 100px",
                }}
            />
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
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 px-4 py-1.5 backdrop-blur-xl"
                whileHover={{ scale: 1.02, borderColor: "rgba(99, 102, 241, 0.3)" }}
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                    <Zap className="h-3 w-3 text-indigo-400/80" />
                </motion.div>
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-indigo-300/90">
                    AI-Powered Forex Trading Intelligence
                </span>
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
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
        <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
            <BackgroundMesh />

            <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-40">
                <AnimatedBadge />

                {/* Headline with dramatic typography */}
                <div className="relative text-center">
                    <motion.h1 
                        className="mx-auto max-w-5xl text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[1.05] tracking-[-0.05em]"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                            Forex intelligence, built{" "}
                        </span>
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            for the next generation
                        </span>
                        <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                            .
                        </span>
                    </motion.h1>
                </div>

                {/* Subheadline */}
                <motion.p
                    className="mx-auto mt-8 max-w-2xl text-center text-[17px] leading-relaxed text-zinc-400 md:text-[18px] md:leading-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
                >
                    Real-time insights, powerful analytics, and complete control over your forex trading — all in one secure platform.
                </motion.p>


                {/* Glassmorphic CTA buttons */}
                <motion.div
                    className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
                >
                    <Link
                        href="/dashboard"
                        className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-500/80 via-purple-500/80 to-indigo-500/80 px-8 py-4 text-[15px] font-semibold text-white shadow-2xl shadow-indigo-500/50 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-white/30 hover:shadow-indigo-500/60"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <span className="relative z-10">Start Managing Smarter</span>
                    </Link>
                    <Link
                        href="#features"
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-[15px] font-medium text-zinc-200 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-white/20 hover:bg-white/10"
                    >
                        <span className="relative z-10">Explore The Platform</span>
                    </Link>
                </motion.div>

                {/* Glassmorphic stats cards */}
                <motion.div
                    className="mt-24 md:mt-32"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="relative mx-auto max-w-5xl">
                        {/* Liquid glass card */}
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-1 backdrop-blur-2xl shadow-2xl shadow-black/50">
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10" />
                            
                            {/* Subtle grid */}
                            <div
                                className="absolute inset-0 opacity-[0.08]"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)",
                                    backgroundSize: "50px 50px",
                                }}
                            />
                            
                            <div className="relative grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] md:grid-cols-3">
                                {/* Currency Pairs */}
                                <div className="bg-black/40 p-8 text-center backdrop-blur-xl">
                                    <div className="mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
                                        Currency Pairs
                                    </div>
                                    <div className="mb-1 text-5xl font-bold">
                                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                            4+
                                        </span>
                                    </div>
                                    <div className="text-[13px] text-zinc-600">
                                        EUR/USD, GBP/USD, USD/JPY, XAU/USD
                                    </div>
                                </div>

                                {/* Data Refresh */}
                                <div className="bg-black/40 p-8 text-center backdrop-blur-xl">
                                    <div className="mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
                                        Data Refresh
                                    </div>
                                    <div className="mb-1 text-5xl font-bold">
                                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                            1min
                                        </span>
                                    </div>
                                    <div className="text-[13px] text-zinc-600">
                                        Real-time news & market data
                                    </div>
                                </div>

                                {/* AI Models */}
                                <div className="bg-black/40 p-8 text-center backdrop-blur-xl">
                                    <div className="mb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
                                        AI Models
                                    </div>
                                    <div className="mb-1 text-5xl font-bold">
                                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                            3+
                                        </span>
                                    </div>
                                    <div className="text-[13px] text-zinc-600">
                                        GPT-5, Gemini, Claude analysis
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
