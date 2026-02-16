"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative border-t border-white/[0.03]">
            {/* Background glow — barely visible */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-zinc-500/[0.025] blur-[100px]"
                    animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.3, 0.45, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            <div
                ref={ref}
                className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-32"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]">
                        Ready to trade smarter?
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[14px] text-zinc-600">
                        Access the AlphaDesk terminal and get AI-powered analysis
                        for every trade decision.
                    </p>

                    <div className="mt-10 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center">
                        <Link
                            href="/dashboard"
                            className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 px-8 py-3.5 text-[14px] font-semibold text-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3),0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:from-white hover:to-zinc-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.35),0_16px_48px_rgba(0,0,0,0.25)] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                            <span className="relative">Access Terminal</span>
                            <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>

                        <Link
                            href="/disclaimer"
                            className="text-[12px] text-zinc-700 transition-colors duration-300 hover:text-zinc-500"
                        >
                            Read risk disclaimer →
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
