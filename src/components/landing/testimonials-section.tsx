"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
    {
        quote: "GetTradingBias is a reliable platform for secure & fast transfers. I trust GetTradingBias because it adheres to the highest security standards.",
        author: "Marcus Chen",
        role: "Professional FX Trader",
        rating: 5,
    },
    {
        quote: "The AI analysis combining news, technicals, and macro data has completely changed how I approach EUR/USD trading. Game changer.",
        author: "Sarah Williams",
        role: "Institutional Trader",
        rating: 5,
    },
    {
        quote: "Real-time updates and institutional-grade insights in one platform. Finally, a terminal built for serious forex traders.",
        author: "David Kumar",
        role: "Hedge Fund Manager",
        rating: 5,
    },
];

export function TestimonialsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative border-t border-white/[0.03] py-20 md:py-28">
            <div ref={ref} className="relative mx-auto max-w-6xl px-6">
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
                        Testimonials
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-200 md:text-[32px]">
                        Hear it from the traders
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {TESTIMONIALS.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                duration: 0.5,
                                delay: i * 0.1,
                                ease: [0.23, 1, 0.32, 1],
                            }}
                            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03]"
                        >
                            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/[0.03] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                            
                            <div className="relative">
                                <Quote className="mb-4 h-8 w-8 text-emerald-500/20" />
                                
                                <p className="mb-6 text-[14px] leading-relaxed text-zinc-400">
                                    {testimonial.quote}
                                </p>
                                
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                                        <span className="text-[13px] font-semibold text-emerald-400/80">
                                            {testimonial.author.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-semibold text-zinc-300">
                                            {testimonial.author}
                                        </div>
                                        <div className="text-[12px] text-zinc-600">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex gap-0.5">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <svg
                                            key={i}
                                            className="h-4 w-4 fill-emerald-500/60"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
