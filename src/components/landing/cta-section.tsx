"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative border-t border-white/[0.03] overflow-hidden">
            {/* Animated background glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute bottom-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500/[0.03] blur-[120px]"
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/4 h-[300px] w-[400px] rounded-full bg-violet-500/[0.02] blur-[100px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 30, 0],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />
            </div>

            <div
                ref={ref}
                className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-32"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* Badge */}
                    <motion.div
                        className="mb-6 flex justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
                            <Sparkles className="h-3 w-3 text-zinc-500" />
                            <span className="text-[11px] font-medium tracking-wide text-zinc-500">
                                Start Trading Smarter
                            </span>
                        </div>
                    </motion.div>

                    <motion.h2 
                        className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Ready to trade smarter?
                    </motion.h2>
                    <motion.p 
                        className="mx-auto mt-3 max-w-md text-[14px] text-zinc-600"
                        initial={{ opacity: 0, y: 15 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Access the GetTradingBias terminal and get AI-powered analysis
                        for every trade decision.
                    </motion.p>

                    <motion.div 
                        className="mt-10 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                href="/dashboard"
                                className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 px-8 py-3.5 text-[14px] font-semibold text-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3),0_12px_40px_rgba(0,0,0,0.2)] transition-all duration-300 hover:from-white hover:to-zinc-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.35),0_16px_48px_rgba(0,0,0,0.25)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                                {/* Pulse ring */}
                                <span className="absolute -inset-1 rounded-xl bg-emerald-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative">Access Terminal</span>
                                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                href="/disclaimer"
                                className="group flex items-center gap-1.5 text-[12px] text-zinc-700 transition-colors duration-300 hover:text-zinc-500"
                            >
                                <span>Read risk disclaimer</span>
                                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
