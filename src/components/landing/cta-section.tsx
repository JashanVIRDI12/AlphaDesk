"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });

    return (
        <section className="relative border-t border-white/[0.05] overflow-hidden bg-black">
            {/* Liquid gradient background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute bottom-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-t from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl"
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-0 right-1/4 h-[400px] w-[500px] rounded-full bg-gradient-to-tl from-purple-500/15 via-indigo-500/10 to-transparent blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -30, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
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
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* Badge */}
                    <motion.div
                        className="mb-6 flex justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: 0.02 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-1.5 backdrop-blur-xl">
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            <span className="text-[11px] font-medium tracking-wide text-indigo-300">
                                Start Trading Smarter
                            </span>
                        </div>
                    </motion.div>

                    <motion.h2 
                        className="text-2xl font-bold tracking-tight text-white md:text-[32px]"
                        initial={{ opacity: 0, y: 8 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.35, delay: 0.03, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Ready to trade smarter?
                    </motion.h2>
                    <motion.p 
                        className="mx-auto mt-3 max-w-md text-[14px] text-zinc-400"
                        initial={{ opacity: 0, y: 8 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.35, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
                    >
                        Access the GetTradingBias terminal and get AI-powered analysis
                        for every trade decision.
                    </motion.p>

                    <motion.div 
                        className="mt-10 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center"
                        initial={{ opacity: 0, y: 8 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.35, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                href="/dashboard"
                                className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-500/80 via-purple-500/80 to-indigo-500/80 px-8 py-4 text-[15px] font-semibold text-white shadow-2xl shadow-indigo-500/50 backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:shadow-indigo-500/60"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <span className="relative">Access Terminal</span>
                                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Link
                                href="/disclaimer"
                                className="group flex items-center gap-1.5 text-[12px] text-zinc-500 transition-colors duration-300 hover:text-zinc-400"
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
