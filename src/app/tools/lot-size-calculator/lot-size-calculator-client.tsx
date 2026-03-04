"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Calculator, ChevronDown, TrendingUp,
    Info, AlertTriangle, Zap, RotateCcw, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

/* ── Pip value config per pair (USD per pip for 1 standard lot) ── */
const PAIRS: Record<string, {
    label: string;
    pipValue: number;      // USD per pip, 1 standard lot
    pipSize: number;       // e.g. 0.0001 for most, 0.01 for JPY
    category: string;
    emoji: string;
}> = {
    "EURUSD": { label: "EUR/USD", pipValue: 10, pipSize: 0.0001, category: "Major", emoji: "🇪🇺" },
    "GBPUSD": { label: "GBP/USD", pipValue: 10, pipSize: 0.0001, category: "Major", emoji: "🇬🇧" },
    "AUDUSD": { label: "AUD/USD", pipValue: 10, pipSize: 0.0001, category: "Major", emoji: "🇦🇺" },
    "NZDUSD": { label: "NZD/USD", pipValue: 10, pipSize: 0.0001, category: "Major", emoji: "🇳🇿" },
    "USDCAD": { label: "USD/CAD", pipValue: 7.69, pipSize: 0.0001, category: "Major", emoji: "🇨🇦" },
    "USDCHF": { label: "USD/CHF", pipValue: 10, pipSize: 0.0001, category: "Major", emoji: "🇨🇭" },
    "USDJPY": { label: "USD/JPY", pipValue: 9.09, pipSize: 0.01, category: "Major", emoji: "🇯🇵" },
    "EURJPY": { label: "EUR/JPY", pipValue: 9.09, pipSize: 0.01, category: "Cross", emoji: "🇪🇺" },
    "GBPJPY": { label: "GBP/JPY", pipValue: 9.09, pipSize: 0.01, category: "Cross", emoji: "🇬🇧" },
    "EURGBP": { label: "EUR/GBP", pipValue: 12.50, pipSize: 0.0001, category: "Cross", emoji: "🇪🇺" },
    "XAUUSD": { label: "XAU/USD", pipValue: 10, pipSize: 0.01, category: "Metals", emoji: "🥇" },
    "XAGUSD": { label: "XAG/USD", pipValue: 50, pipSize: 0.001, category: "Metals", emoji: "🥈" },
};

const RISK_PRESETS = [0.5, 1, 1.5, 2, 3];

const RISK_PROFILES = [
    { max: 0.5, label: "Conservative", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { max: 1.5, label: "Moderate", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
    { max: 2.5, label: "Aggressive", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { max: 100, label: "High Risk", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
];

function getRiskProfile(risk: number) {
    return RISK_PROFILES.find((p) => risk <= p.max) ?? RISK_PROFILES[RISK_PROFILES.length - 1];
}

/* ── Pair selector dropdown ── */
function PairSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const selected = PAIRS[value];

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const grouped = Object.entries(PAIRS).reduce<Record<string, typeof PAIRS[string][] & { key: string }[]>>((acc, [key, val]) => {
        if (!acc[val.category]) acc[val.category] = [] as unknown as typeof acc[string];
        (acc[val.category] as unknown as Array<typeof val & { key: string }>).push({ ...val, key });
        return acc;
    }, {});

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                id="pair-selector"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#111115] px-4 py-3 text-sm font-medium text-zinc-100 transition-all hover:border-white/[0.14] focus:outline-none focus:border-indigo-500/50"
            >
                <span className="flex items-center gap-2.5">
                    <span className="text-base">{selected.emoji}</span>
                    <span>{selected.label}</span>
                    <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                        {selected.category}
                    </span>
                </span>
                <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform duration-200", open && "rotate-180")} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/[0.1] bg-[#111115] shadow-2xl shadow-black/60"
                    >
                        {Object.entries(grouped).map(([category, items]) => (
                            <div key={category}>
                                <div className="border-b border-white/[0.05] px-3 py-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">{category}</span>
                                </div>
                                {(items as unknown as Array<{ key: string; label: string; emoji: string; pipValue: number }>).map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => { onChange(item.key); setOpen(false); }}
                                        className={cn(
                                            "flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-white/[0.04]",
                                            value === item.key ? "text-indigo-300 bg-indigo-500/[0.06]" : "text-zinc-300"
                                        )}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <span>{item.emoji}</span>
                                            <span className="font-medium">{item.label}</span>
                                        </span>
                                        <span className="text-[11px] text-zinc-600">
                                            ${item.pipValue.toFixed(2)}/pip
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Animated number display ── */
function AnimatedValue({ value, prefix = "", suffix = "", decimals = 2, className = "" }: {
    value: number; prefix?: string; suffix?: string; decimals?: number; className?: string;
}) {
    return (
        <motion.span
            key={value.toFixed(decimals)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={className}
        >
            {prefix}{isFinite(value) ? value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "—"}{suffix}
        </motion.span>
    );
}

/* ── Segmented risk bar ── */
function RiskBar({ value }: { value: number }) {
    const max = 5;
    const clamped = Math.min(value, max);
    const pct = (clamped / max) * 100;
    const profile = getRiskProfile(value);

    return (
        <div className="space-y-1.5">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                <motion.div
                    className={cn(
                        "absolute left-0 top-0 h-full rounded-full",
                        value <= 0.5 ? "bg-emerald-400" :
                            value <= 1.5 ? "bg-sky-400" :
                                value <= 2.5 ? "bg-amber-400" : "bg-rose-400"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Risk markers */}
                {[1, 2, 3].map((m) => (
                    <div key={m} className="absolute top-0 h-full w-px bg-white/[0.12]" style={{ left: `${(m / max) * 100}%` }} />
                ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-600">
                <span>0%</span>
                <span className={cn("font-semibold", profile.color)}>{profile.label}</span>
                <span>5%+</span>
            </div>
        </div>
    );
}

/* ── Input field ── */
function CalcInput({
    id, label, value, onChange, prefix, suffix, step = "any", min = "0", hint,
}: {
    id: string; label: string; value: string; onChange: (v: string) => void;
    prefix?: string; suffix?: string; step?: string; min?: string; hint?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    {label}
                </label>
                {hint && (
                    <span className="text-[10px] text-zinc-700">{hint}</span>
                )}
            </div>
            <div className="relative">
                {prefix && (
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
                        {prefix}
                    </span>
                )}
                <input
                    id={id}
                    type="number"
                    step={step}
                    min={min}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        "w-full rounded-xl border border-white/[0.07] bg-[#111115] py-3 text-sm font-medium text-zinc-100 outline-none transition-all",
                        "focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20",
                        "placeholder:text-zinc-700",
                        prefix ? "pl-8 pr-4" : "px-4",
                        suffix ? "pr-12" : ""
                    )}
                />
                {suffix && (
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-zinc-600">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ── Result card ── */
function ResultCard({
    label, value, sub, accent = false, large = false, className = "",
}: {
    label: string; value: React.ReactNode; sub?: string; accent?: boolean; large?: boolean; className?: string;
}) {
    return (
        <div className={cn(
            "flex flex-col gap-1 rounded-xl border p-4",
            accent
                ? "border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent"
                : "border-white/[0.06] bg-white/[0.02]",
            className
        )}>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">{label}</span>
            <span className={cn("font-mono font-bold tabular-nums", large ? "text-3xl" : "text-xl",
                accent ? "text-indigo-200" : "text-zinc-100"
            )}>
                {value}
            </span>
            {sub && <span className="text-[11px] text-zinc-600">{sub}</span>}
        </div>
    );
}

/* ════════════════════════════════════
   MAIN CLIENT COMPONENT
═══════════════════════════════════════ */
export function LotSizeCalculatorClient() {
    // Inputs
    const [accountSize, setAccountSize] = React.useState("10000");
    const [riskPercent, setRiskPercent] = React.useState("1.0");
    const [stopLoss, setStopLoss] = React.useState("20");
    const [takeProfit, setTakeProfit] = React.useState("40");
    const [pair, setPair] = React.useState("EURUSD");

    // Derived
    const account = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const pairInfo = PAIRS[pair];
    const pipValue = pairInfo.pipValue; // USD per pip per standard lot

    const riskAmount = (account * risk) / 100;
    const standardLots = sl > 0 ? riskAmount / (sl * pipValue) : 0;
    const miniLots = standardLots * 10;
    const microLots = standardLots * 100;
    const rrRatio = tp > 0 && sl > 0 ? tp / sl : 0;
    const potentialProfit = standardLots * tp * pipValue;
    const profile = getRiskProfile(risk);
    const pipValueDisplay = (standardLots * pipValue).toFixed(2);

    const handleReset = () => {
        setAccountSize("10000");
        setRiskPercent("1.0");
        setStopLoss("20");
        setTakeProfit("40");
        setPair("EURUSD");
    };

    return (
        <div className="min-h-screen bg-[#06060a] text-zinc-100">
            {/* Ambient background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-0 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/[0.05] blur-[120px]" />
                <div className="absolute right-1/4 top-1/3 h-[400px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
            </div>

            <div className="relative">
                <LandingNav />

                <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">

                    {/* ── Breadcrumb ── */}
                    <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[11px] text-zinc-600">
                        <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/tools" className="hover:text-zinc-400 transition-colors">Tools</Link>
                        <span>/</span>
                        <span className="text-zinc-400">Lot Size Calculator</span>
                    </nav>

                    {/* ── Page header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
                    >
                        <div>
                            <div className="mb-3 flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                                    <Calculator className="h-5 w-5 text-indigo-400" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Free Tool</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">
                                Forex Lot Size Calculator
                            </h1>
                            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-zinc-500">
                                Calculate the exact lot size for any forex trade instantly. Enter your account details and stop loss to get precise position sizing across all major pairs.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 self-start rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-[12px] font-medium text-zinc-400 transition-all hover:border-white/[0.12] hover:text-zinc-200 md:self-auto"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </button>
                    </motion.div>

                    {/* ── Main grid ── */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

                        {/* LEFT: Inputs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col gap-5"
                        >
                            {/* Input card */}
                            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0d0d12] to-[#0a0a0f] p-6">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                                <div className="pointer-events-none absolute -top-24 left-1/3 h-48 w-72 -translate-x-1/2 rounded-full bg-indigo-500/[0.06] blur-[80px]" />

                                <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    {/* Account Balance */}
                                    <CalcInput
                                        id="account-size"
                                        label="Account Balance"
                                        value={accountSize}
                                        onChange={setAccountSize}
                                        prefix="$"
                                        hint="USD"
                                        step="100"
                                    />

                                    {/* Currency Pair */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                            Currency Pair
                                        </label>
                                        <PairSelector value={pair} onChange={setPair} />
                                    </div>

                                    {/* Risk % */}
                                    <div className="space-y-2 sm:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="risk-pct" className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                                                Risk Percentage
                                            </label>
                                            <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", profile.bg, profile.color)}>
                                                {profile.label}
                                            </span>
                                        </div>
                                        {/* Preset pills */}
                                        <div className="flex flex-wrap gap-2">
                                            {RISK_PRESETS.map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setRiskPercent(String(p))}
                                                    className={cn(
                                                        "rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all",
                                                        riskPercent === String(p)
                                                            ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                                                            : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
                                                    )}
                                                >
                                                    {p}%
                                                </button>
                                            ))}
                                            <div className="relative flex-1 min-w-[80px]">
                                                <input
                                                    id="risk-pct"
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    value={riskPercent}
                                                    onChange={(e) => setRiskPercent(e.target.value)}
                                                    className="w-full rounded-lg border border-white/[0.07] bg-[#111115] py-1.5 pl-3 pr-8 text-[12px] font-medium text-zinc-100 outline-none transition-all focus:border-indigo-500/50"
                                                />
                                                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600">%</span>
                                            </div>
                                        </div>
                                        <RiskBar value={risk} />
                                    </div>

                                    {/* Stop Loss */}
                                    <CalcInput
                                        id="stop-loss"
                                        label="Stop Loss"
                                        value={stopLoss}
                                        onChange={setStopLoss}
                                        suffix="pips"
                                        step="1"
                                        hint={`1 pip = ${pairInfo.pipSize}`}
                                    />

                                    {/* Take Profit */}
                                    <CalcInput
                                        id="take-profit"
                                        label="Take Profit (optional)"
                                        value={takeProfit}
                                        onChange={setTakeProfit}
                                        suffix="pips"
                                        step="1"
                                        hint="for R:R ratio"
                                    />
                                </div>

                                {/* Pip value info chip */}
                                <div className="relative mt-5 flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                                    <Info className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                                    <p className="text-[11px] leading-relaxed text-zinc-600">
                                        <span className="text-zinc-400">{pairInfo.label}</span>: pip value is{" "}
                                        <span className="font-semibold text-zinc-300">${pipValue.toFixed(2)}</span> per pip per standard lot.
                                        Pip size: <span className="font-mono text-zinc-400">{pairInfo.pipSize}</span>.
                                    </p>
                                </div>
                            </div>

                            {/* ── Mobile results (visible below inputs on small screens) ── */}
                            <div className="lg:hidden">
                                <ResultsPanel
                                    riskAmount={riskAmount}
                                    standardLots={standardLots}
                                    miniLots={miniLots}
                                    microLots={microLots}
                                    rrRatio={rrRatio}
                                    potentialProfit={potentialProfit}
                                    pipValueDisplay={pipValueDisplay}
                                    risk={risk}
                                    profile={profile}
                                    sl={sl}
                                    tp={tp}
                                    pairLabel={pairInfo.label}
                                />
                            </div>

                            {/* ── FAQ / Explainer ── */}
                            <FaqSection />
                        </motion.div>

                        {/* RIGHT: Results (sticky on desktop) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="sticky top-24">
                                <ResultsPanel
                                    riskAmount={riskAmount}
                                    standardLots={standardLots}
                                    miniLots={miniLots}
                                    microLots={microLots}
                                    rrRatio={rrRatio}
                                    potentialProfit={potentialProfit}
                                    pipValueDisplay={pipValueDisplay}
                                    risk={risk}
                                    profile={profile}
                                    sl={sl}
                                    tp={tp}
                                    pairLabel={pairInfo.label}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* ── CTA ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-12 rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.06] via-purple-500/[0.03] to-transparent p-8 text-center md:p-12"
                    >
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                            <Zap className="h-6 w-6 text-indigo-400" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-zinc-100">Know your lot size. Now know your bias.</h2>
                        <p className="mx-auto mb-6 max-w-md text-[14px] leading-relaxed text-zinc-500">
                            Use our AI-powered terminal to get the trading direction — then use this calculator through the dashboard's built-in Risk Manager to size your position.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-[14px] font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] hover:brightness-110"
                        >
                            Open AI Trading Terminal
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                </main>

                <LandingFooter />
            </div>
        </div>
    );
}

/* ── Results Panel (shared between mobile/desktop) ── */
function ResultsPanel({
    riskAmount, standardLots, miniLots, microLots,
    rrRatio, potentialProfit, pipValueDisplay,
    risk, profile, sl, tp, pairLabel,
}: {
    riskAmount: number; standardLots: number; miniLots: number; microLots: number;
    rrRatio: number; potentialProfit: number; pipValueDisplay: string;
    risk: number; profile: { label: string; color: string; bg: string };
    sl: number; tp: number; pairLabel: string;
}) {
    const isValidInput = riskAmount > 0 && standardLots > 0 && isFinite(standardLots);
    const hasTP = tp > 0;

    return (
        <div className="flex flex-col gap-4">
            {/* Main result */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 via-indigo-500/[0.04] to-transparent p-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
                <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[60px]" />

                <div className="relative mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                    Recommended Lot Size
                </div>
                <div className="relative flex items-end gap-3 py-2">
                    <AnimatedValue
                        value={isValidInput ? standardLots : 0}
                        decimals={2}
                        className="font-mono text-5xl font-black tracking-tight text-white"
                    />
                    <span className="mb-1 text-lg font-semibold text-indigo-300/60">lots</span>
                </div>
                <div className="relative text-[12px] text-indigo-300/50">
                    {pairLabel} · Standard Lots
                </div>
            </div>

            {/* Risk amount + profile */}
            <div className="grid grid-cols-2 gap-3">
                <ResultCard
                    label="Risk Amount"
                    value={
                        <AnimatedValue
                            value={riskAmount}
                            prefix="$"
                            decimals={2}
                            className="font-mono text-xl font-bold text-rose-300"
                        />
                    }
                    sub={`${risk}% of account`}
                />
                <ResultCard
                    label="Risk Profile"
                    value={<span className={cn("text-xl font-bold", profile.color)}>{profile.label}</span>}
                    sub={`at ${risk}% risk`}
                />
            </div>

            {/* Lot breakdown */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">Lot Size Breakdown</div>
                <div className="space-y-2.5">
                    {[
                        { label: "Standard Lot (1.0)", value: standardLots, decimals: 2, color: "text-zinc-100" },
                        { label: "Mini Lot (0.10)", value: miniLots, decimals: 1, color: "text-zinc-400" },
                        { label: "Micro Lot (0.01)", value: microLots, decimals: 0, color: "text-zinc-500" },
                    ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                            <span className="text-[12px] text-zinc-500">{row.label}</span>
                            <AnimatedValue
                                value={isValidInput ? row.value : 0}
                                decimals={row.decimals}
                                className={cn("font-mono text-[14px] font-bold tabular-nums", row.color)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pip value */}
            <div className="grid grid-cols-2 gap-3">
                <ResultCard
                    label="Pip Value"
                    value={
                        <AnimatedValue
                            value={parseFloat(pipValueDisplay) || 0}
                            prefix="$"
                            decimals={2}
                            className="font-mono text-xl font-bold text-sky-300"
                        />
                    }
                    sub="per pip on this size"
                />
                {hasTP && (
                    <ResultCard
                        label="R:R Ratio"
                        value={
                            <AnimatedValue
                                value={rrRatio}
                                prefix="1:"
                                decimals={1}
                                className={cn("font-mono text-xl font-bold", rrRatio >= 2 ? "text-emerald-300" : rrRatio >= 1 ? "text-amber-300" : "text-rose-300")}
                            />
                        }
                        sub={rrRatio >= 2 ? "Good R:R ✓" : rrRatio >= 1 ? "Acceptable" : "Low R:R"}
                    />
                )}
            </div>

            {/* Potential profit */}
            {hasTP && isValidInput && (
                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-500/70">
                        Potential Profit at TP
                    </div>
                    <AnimatedValue
                        value={potentialProfit}
                        prefix="$"
                        decimals={2}
                        className="font-mono text-2xl font-bold text-emerald-300"
                    />
                    <div className="mt-0.5 text-[11px] text-emerald-500/50">
                        {tp} pips × ${(parseFloat(pipValueDisplay) / sl * 1 || 0).toFixed(2)}/pip
                    </div>
                </div>
            )}

            {/* Warning for bad inputs */}
            {!isValidInput && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/[0.05] p-3">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" />
                    <p className="text-[11px] leading-relaxed text-amber-400/70">
                        Enter your account balance, risk %, and stop loss to calculate lot size.
                    </p>
                </div>
            )}
        </div>
    );
}

/* ── FAQ accordion ── */
const FAQ_ITEMS = [
    {
        q: "How is lot size calculated?",
        a: "Lot Size = (Account Balance × Risk%) ÷ (Stop Loss Pips × Pip Value per Lot). For EUR/USD, the pip value is $10 per standard lot. So a $10,000 account risking 1% ($100) with a 20-pip stop = $100 ÷ (20 × $10) = 0.50 lots.",
    },
    {
        q: "What's the difference between standard, mini, and micro lots?",
        a: "A standard lot is 100,000 units of the base currency. A mini lot is 10,000 units (0.10 standard). A micro lot is 1,000 units (0.01 standard). Most retail brokers support micro lots, making it easier to trade small accounts with proper risk management.",
    },
    {
        q: "Why does pip value differ between pairs?",
        a: "Pip value depends on the quote currency. For USD-quoted pairs (EUR/USD, GBP/USD), 1 pip = $10 per standard lot. For JPY pairs (USD/JPY), 1 pip = 0.01 and pip value ≈ $9.09. For XAU/USD (gold), pip = $0.01 with a $10 pip value.",
    },
    {
        q: "What risk percentage should I use?",
        a: "Professional traders risk 0.5%–2% per trade. Under 1% is conservative, 1%–2% is standard, above 2% is aggressive. Risking more than 5% per trade is generally unsustainable — a 10-trade losing streak would decimate your account.",
    },
];

function FaqSection() {
    const [open, setOpen] = React.useState<number | null>(null);

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6">
            <h2 className="mb-5 text-[13px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                How it works
            </h2>
            <div className="space-y-2">
                {FAQ_ITEMS.map((item, idx) => (
                    <div key={idx} className="overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.02]">
                        <button
                            type="button"
                            onClick={() => setOpen(open === idx ? null : idx)}
                            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
                        >
                            <span className="text-[13px] font-medium text-zinc-300">{item.q}</span>
                            <ChevronDown className={cn(
                                "ml-3 h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200",
                                open === idx && "rotate-180"
                            )} />
                        </button>
                        <AnimatePresence initial={false}>
                            {open === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <p className="border-t border-white/[0.04] px-4 py-3.5 text-[12px] leading-relaxed text-zinc-500">
                                        {item.a}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
