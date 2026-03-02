"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useNews } from "@/hooks/use-dashboard-data";

/* ── Topic config ── */
const TOPIC_COLORS: Record<string, { tag: string; label: string }> = {
    USD: { tag: "text-sky-400", label: "USD" },
    EUR: { tag: "text-indigo-400", label: "EUR" },
    GBP: { tag: "text-violet-400", label: "GBP" },
    JPY: { tag: "text-teal-400", label: "JPY" },
    GEO: { tag: "text-amber-400", label: "GEO" },
    FX: { tag: "text-emerald-400", label: "FX" },
};

const HIGH_IMPACT_TERMS = [
    "cpi", "inflation", "nfp", "nonfarm", "fomc", "federal reserve", "fed",
    "boj", "bank of japan", "boe", "bank of england", "ecb", "interest rate",
    "rate decision", "intervention", "payroll", "gdp", "pmi",
];
function isHigh(title: string) {
    const l = title.toLowerCase();
    return HIGH_IMPACT_TERMS.some((t) => l.includes(t));
}

type Headline = { title: string; topic?: string; source?: string; url: string };

/* ── Single ticker item ── */
function TickerItem({ h }: { h: Headline }) {
    const topic = h.topic ?? "FX";
    const cfg = TOPIC_COLORS[topic] ?? TOPIC_COLORS.FX;
    const high = isHigh(h.title);

    return (
        <a
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2.5 px-5 group"
        >
            {/* Source tag */}
            <span className={cn("text-[9px] font-black tracking-[0.18em] uppercase shrink-0", cfg.tag)}>
                {cfg.label}
            </span>

            {/* HIGH badge */}
            {high && (
                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1 py-0.5 text-[8px] font-bold text-amber-400 shrink-0">
                    ⚡ HIGH
                </span>
            )}

            {/* Headline */}
            <span className="text-[11px] font-medium text-zinc-300 whitespace-nowrap group-hover:text-white transition-colors duration-150">
                {h.title}
            </span>

            {/* Separator dot */}
            <span className="text-zinc-700 text-xs shrink-0 ml-2">◆</span>
        </a>
    );
}

/* ── Main ticker component ── */
export function NewsTicker() {
    const { data, isLoading } = useNews();
    const [paused, setPaused] = React.useState(false);
    const trackRef = React.useRef<HTMLDivElement>(null);

    const headlines = (data?.headlines ?? []) as Headline[];

    // No render while loading or empty
    if (isLoading || headlines.length === 0) return null;

    // Duplicate the array so the loop appears seamless
    const doubled = [...headlines, ...headlines];

    // Scroll speed: ~60px/s (adjust via CSS custom property)
    const durationSecs = headlines.length * 14; // ~14s per headline — slow & readable

    return (
        <div
            className="relative w-full border-b border-white/[0.05] bg-[#080809] overflow-hidden"
            style={{ height: "32px" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Left fade + LIVE badge */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 flex items-center pl-3 pr-10 bg-gradient-to-r from-[#080809] via-[#080809]/90 to-transparent w-40">
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                    <span className="text-[8px] font-black tracking-[0.2em] text-rose-400 uppercase">Live</span>
                </div>
            </div>

            {/* Right fade */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-[#080809] to-transparent" />

            {/* Scrolling track */}
            <div
                ref={trackRef}
                className="absolute top-0 left-0 flex items-center h-full will-change-transform"
                style={{
                    animation: `ticker-scroll ${durationSecs}s linear infinite`,
                    animationPlayState: paused ? "paused" : "running",
                    paddingLeft: "10rem", // clear the LIVE badge
                }}
            >
                {doubled.map((h, i) => (
                    <TickerItem key={`${h.url}-${i}`} h={h} />
                ))}
            </div>

            {/* Inject the keyframe animation via a style tag */}
            <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}
