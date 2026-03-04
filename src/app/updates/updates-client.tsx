"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, Trash2, Wrench } from "lucide-react";
import { motion, Variants } from "framer-motion";

export type UpdateItem = {
    date: string;
    title: string;
    improved: string[];
    removed?: string[];
    fixed?: string[];
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
};

function UpdateCard({ item }: { item: UpdateItem }) {
    return (
        <motion.div variants={itemVariants} className="relative pl-8 md:pl-0">
            {/* Timeline connector (Mobile: left edge, Desktop: hidden or same) */}
            <div className="md:hidden absolute left-0 top-6 bottom-0 w-px bg-white/[0.08]" />
            <div className="md:hidden absolute left-[-4px] top-6 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] ring-4 ring-indigo-500/20" />

            <article className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-indigo-500/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_60px_rgba(99,102,241,0.15)] hover:-translate-y-1">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[16px] font-semibold tracking-tight text-zinc-100">{item.title}</h2>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] tracking-wide text-zinc-400 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-colors">
                        {item.date}
                    </span>
                </div>

                <div className="space-y-4 text-[13px] leading-6 text-zinc-300">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            Improved
                        </div>
                        <ul className="space-y-1.5">
                            {item.improved.map((line) => (
                                <li key={line} className="flex gap-2">
                                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {item.removed?.length ? (
                        <div>
                            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-300">
                                <Trash2 className="h-3.5 w-3.5" />
                                Removed
                            </div>
                            <ul className="space-y-1.5">
                                {item.removed.map((line) => (
                                    <li key={line} className="flex gap-2">
                                        <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-rose-300/70" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {item.fixed?.length ? (
                        <div>
                            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                                <Wrench className="h-3.5 w-3.5" />
                                Fixed
                            </div>
                            <ul className="space-y-1.5">
                                {item.fixed.map((line) => (
                                    <li key={line} className="flex gap-2">
                                        <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-amber-300/70" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </article>
        </motion.div>
    );
}

export function UpdatesClient({ updates }: { updates: UpdateItem[] }) {
    return (
        <div className="min-h-screen bg-[#06060a] bg-[radial-gradient(1200px_620px_at_50%_-15%,rgba(129,140,248,0.14),transparent_62%),radial-gradient(900px_420px_at_0%_8%,rgba(139,92,246,0.10),transparent_60%),radial-gradient(900px_500px_at_100%_12%,rgba(99,102,241,0.10),transparent_58%)] text-zinc-100">
            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Changelog</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Product Updates</h1>
                        <p className="mt-2 text-[13px] text-zinc-400">
                            Track improvements, UI changes, and removals over time.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex self-start md:self-auto items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-300 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Home
                    </Link>
                </motion.div>

                <div className="relative">
                    {/* Desktop continuous timeline line */}
                    <div className="hidden md:block absolute left-4 top-4 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-white/[0.08] to-transparent" />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-6 md:space-y-8 md:pl-12"
                    >
                        {updates.map((item) => (
                            <div key={`${item.date}-${item.title}`} className="relative">
                                {/* Desktop pulse node for timeline */}
                                <motion.div
                                    variants={itemVariants}
                                    className="hidden md:block absolute -left-12 top-6 h-2 w-2 -translate-x-[4.5px] rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] ring-4 ring-indigo-500/20"
                                />
                                <UpdateCard item={item} />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
