"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft, ExternalLink, Share2, Download,
    TrendingUp, TrendingDown, Newspaper, BarChart3, Landmark, MessageCircle,
    ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInstruments } from "@/hooks/use-dashboard-data";
import { DashboardShell } from "@/components/trading/dashboard-shell";
import { AuthGate } from "@/components/auth/auth-gate";
import type { InstrumentData } from "@/components/trading/instrument-card";

/* ── TradingView symbols ── */
const TV_CHART_LINKS: Record<string, string> = {
    EURUSD: "https://www.tradingview.com/chart/?symbol=FX:EURUSD",
    GBPUSD: "https://www.tradingview.com/chart/?symbol=FX:GBPUSD",
    USDJPY: "https://www.tradingview.com/chart/?symbol=FX:USDJPY",
    XAUUSD: "https://www.tradingview.com/chart/?symbol=OANDA:XAUUSD",
};

const TV_WIDGET_SYMBOLS: Record<string, string> = {
    EURUSD: "FX:EURUSD",
    GBPUSD: "FX:GBPUSD",
    USDJPY: "FX:USDJPY",
    XAUUSD: "OANDA:XAUUSD",
};

const PAIR_DISPLAY: Record<string, { name: string; desc: string }> = {
    EURUSD: { name: "Euro / US Dollar", desc: "The world's most traded currency pair" },
    GBPUSD: { name: "British Pound / Dollar", desc: "The original major — Cable" },
    USDJPY: { name: "Dollar / Japanese Yen", desc: "The premier carry-trade pair" },
    XAUUSD: { name: "Gold / US Dollar", desc: "Ultimate safe-haven & macro barometer" },
};

/* ── Full TradingView advanced chart ── */
function AdvancedChart({ symbol, bullish }: { symbol: string; bullish: boolean }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const widgetSymbol = TV_WIDGET_SYMBOLS[symbol] ?? `FX:${symbol}`;

    React.useEffect(() => {
        if (!ref.current) return;
        const container = ref.current;
        container.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.async = true;
        script.type = "text/javascript";
        script.textContent = JSON.stringify({
            symbol: widgetSymbol,
            interval: "H1",
            timezone: "Asia/Kolkata",
            theme: "dark",
            style: "1",
            locale: "en",
            backgroundColor: "rgba(13,13,15,0)",
            gridColor: "rgba(255,255,255,0.04)",
            allow_symbol_change: false,
            calendar: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            withdateranges: true,
            width: "100%",
            height: "100%",
        });

        const wrapper = document.createElement("div");
        wrapper.className = "tradingview-widget-container__widget";
        wrapper.style.height = "100%";
        container.appendChild(wrapper);
        container.appendChild(script);

        return () => { container.innerHTML = ""; };
    }, [widgetSymbol]);

    return (
        <div
            ref={ref}
            className="tradingview-widget-container h-full w-full overflow-hidden rounded-2xl"
        />
    );
}

/* ── Confidence bar ── */
function ConfidenceBar({ value }: { value: number }) {
    const segs = 20;
    const active = Math.round((Math.min(100, Math.max(0, value)) / 100) * segs);
    const isHigh = value >= 70;
    const isMed = value >= 55;
    const gradFrom = isHigh ? "from-emerald-400" : isMed ? "from-amber-400" : "from-rose-400";
    const gradTo = isHigh ? "to-emerald-300/50" : isMed ? "to-amber-300/50" : "to-rose-300/50";

    return (
        <div className="flex items-center gap-[3px]">
            {Array.from({ length: segs }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-2 flex-1 rounded-sm transition-all duration-700",
                        i < active ? `bg-gradient-to-b ${gradFrom} ${gradTo}` : "bg-white/[0.04]"
                    )}
                    style={{ transitionDelay: `${i * 20}ms` }}
                />
            ))}
        </div>
    );
}

/* ── Analysis pillar section ── */
function PillarSection({
    icon: Icon, label, content, color, border, bg,
}: {
    icon: React.ElementType; label: string; content?: string;
    color: string; border: string; bg: string;
}) {
    if (!content) return null;
    return (
        <div className={cn("rounded-2xl border p-4 sm:p-5", border, bg)}>
            <div className="mb-3 flex items-center gap-2">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", border, bg)}>
                    <Icon className={cn("h-3.5 w-3.5", color)} />
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", color)}>{label}</span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-300">{content}</p>
        </div>
    );
}

/* ── Canvas share card generator ── */
function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineH: number, maxLines = 4) {
    const words = text.split(/\s+/);
    let line = "";
    let lines = 0;
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, y + lines * lineH);
            line = word;
            if (++lines >= maxLines - 1) break;
        } else { line = test; }
    }
    if (lines < maxLines) ctx.fillText(line, x, y + lines * lineH);
}

async function generateShareCard(instrument: InstrumentData): Promise<Blob> {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    const bullish = instrument.bias === "Bullish";
    const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
    bg.addColorStop(0, "#05070d");
    bg.addColorStop(1, "#0a0f1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow = ctx.createRadialGradient(540, 300, 50, 540, 300, 500);
    glow.addColorStop(0, bullish ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.22)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(64, 64, 952, 1792);

    ctx.fillStyle = "#71717a";
    ctx.font = "600 34px system-ui, sans-serif";
    ctx.fillText("GetTradingBias — AI Analysis", 104, 145);

    ctx.fillStyle = bullish ? "#34d399" : "#fb7185";
    ctx.font = "800 96px system-ui, sans-serif";
    ctx.fillText(instrument.symbol, 104, 285);

    ctx.fillStyle = bullish ? "#6ee7b7" : "#fda4af";
    ctx.font = "700 52px system-ui, sans-serif";
    ctx.fillText(`${instrument.bias.toUpperCase()} · ${instrument.confidence}%`, 104, 360);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "500 30px system-ui, sans-serif";
    ctx.fillText(instrument.displayName, 104, 415);

    let y = 510;
    const sections = [
        { label: "SUMMARY", text: instrument.summary },
        { label: "NEWS DRIVER", text: instrument.newsDriver },
        { label: "TECHNICAL LEVELS", text: instrument.technicalLevels },
        { label: "MACRO BACKDROP", text: instrument.macroBackdrop },
    ].filter((s) => s.text);

    for (const sec of sections) {
        ctx.fillStyle = "#52525b";
        ctx.font = "600 26px system-ui, sans-serif";
        ctx.fillText(sec.label, 104, y);
        y += 44;

        ctx.fillStyle = "#e4e4e7";
        ctx.font = "400 36px system-ui, sans-serif";
        drawWrappedText(ctx, sec.text!, 104, y, 872, 50, 3);
        y += 50 * 3 + 44;
        if (y > 1720) break;
    }

    const stamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    ctx.fillStyle = "#52525b";
    ctx.font = "500 26px system-ui, sans-serif";
    ctx.fillText(`Generated ${stamp} · gettradingbias.com`, 104, 1860);

    return new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas failed"))), "image/png")
    );
}

/* ════════════════════════════════════
   MAIN PAGE COMPONENT
   ════════════════════════════════════ */
export default function InstrumentPage() {
    const params = useParams();
    const symbol = (params?.symbol as string ?? "").toUpperCase();
    const { data, isLoading, refetch, isFetching } = useInstruments();
    const [sharing, setSharing] = React.useState(false);
    const [shareNote, setShareNote] = React.useState<string | null>(null);

    const instrument = data?.instruments?.find((i) => i.symbol === symbol);
    const meta = PAIR_DISPLAY[symbol] ?? { name: symbol, desc: "" };
    const bullish = instrument?.bias === "Bullish";
    const bearish = instrument?.bias === "Bearish";

    const accentBg = bullish
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        : bearish
            ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
            : "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";

    const handleShare = React.useCallback(async () => {
        if (!instrument) return;
        try {
            setSharing(true);
            setShareNote(null);
            const blob = await generateShareCard(instrument);
            const file = new File([blob], `${symbol.toLowerCase()}-analysis.png`, { type: "image/png" });
            const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
            if (nav.canShare?.({ files: [file] }) && navigator.share) {
                await navigator.share({ files: [file], title: `${symbol} Bias Card`, text: `${symbol} ${instrument.bias} (${instrument.confidence}%) · GetTradingBias` });
                return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = file.name; a.click();
            URL.revokeObjectURL(url);
            setShareNote("Downloaded! Upload to your Instagram Story.");
        } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return;
            setShareNote("Couldn't share right now.");
        } finally { setSharing(false); }
    }, [instrument, symbol]);

    return (
        <DashboardShell>
            <AuthGate>
                {/* ── Nav bar ── */}
                <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0b]/90 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-zinc-400 transition-all hover:border-white/[0.12] hover:text-zinc-200"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-white/[0.07]" />
                        <span className="text-[11px] text-zinc-600">Instruments</span>
                        <div className="h-4 w-px bg-white/[0.07]" />
                        <span className="text-[11px] font-bold text-zinc-300">{symbol}</span>
                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-zinc-500 transition-all hover:text-zinc-300 disabled:opacity-40"
                            >
                                <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
                                Refresh AI
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col items-center gap-4 py-32 text-center">
                            <div className="relative h-12 w-12">
                                <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/[0.05] border-t-indigo-500/60" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500">AI analysing {symbol}…</p>
                            <p className="text-xs text-zinc-700">Fetching news · technicals · macro · Reddit</p>
                        </div>
                    )}

                    {/* Not found */}
                    {!isLoading && !instrument && (
                        <div className="flex flex-col items-center gap-4 py-32 text-center">
                            <AlertCircle className="h-10 w-10 text-zinc-700" />
                            <h2 className="text-lg font-semibold text-zinc-300">Pair not found</h2>
                            <p className="text-sm text-zinc-600">{symbol} is not in the supported instrument list.</p>
                            <Link href="/dashboard" className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">
                                ← Back to Dashboard
                            </Link>
                        </div>
                    )}

                    {/* Content */}
                    {!isLoading && instrument && (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

                            {/* ── LEFT: Chart + Header ── */}
                            <div className="flex flex-col gap-5">

                                {/* Instrument header */}
                                <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0d0d0f] to-[#111115] p-5 sm:p-6">
                                    {/* Glow */}
                                    <div className={cn(
                                        "pointer-events-none absolute -top-20 left-1/3 h-48 w-80 -translate-x-1/2 rounded-full blur-[80px]",
                                        bullish ? "bg-emerald-500/[0.08]" : bearish ? "bg-rose-500/[0.08]" : "bg-zinc-500/[0.06]"
                                    )} />
                                    {/* Top line */}
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

                                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Icon */}
                                            <div className={cn(
                                                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl font-black",
                                                bullish ? "border-emerald-500/20 bg-emerald-500/[0.08]" : bearish ? "border-rose-500/20 bg-rose-500/[0.08]" : "border-zinc-500/20 bg-zinc-500/[0.08]"
                                            )}>
                                                {bullish ? <TrendingUp className="h-6 w-6 text-emerald-400" /> : bearish ? <TrendingDown className="h-6 w-6 text-rose-400" /> : <TrendingUp className="h-6 w-6 text-zinc-400" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-600 mb-0.5">{meta.name}</p>
                                                <h1 className="text-3xl font-black tracking-tight text-white leading-none">{symbol}</h1>
                                                <p className="mt-1 text-[11px] text-zinc-600">{meta.desc}</p>
                                            </div>
                                        </div>

                                        {/* Bias + confidence */}
                                        <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                                            <div className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2", accentBg)}>
                                                {bullish ? <ArrowUpRight className="h-4 w-4" /> : bearish ? <ArrowDownRight className="h-4 w-4" /> : null}
                                                <span className="text-sm font-bold tracking-widest uppercase">{instrument.bias}</span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2">
                                                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Conviction</span>
                                                <span className="text-sm font-bold tabular-nums text-zinc-100">{instrument.confidence}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confidence bar */}
                                    <div className="relative mt-5">
                                        <ConfidenceBar value={instrument.confidence} />
                                    </div>

                                    {/* Summary */}
                                    {instrument.summary && (
                                        <p className="relative mt-4 text-[13px] leading-relaxed text-zinc-400 border-t border-white/[0.04] pt-4">
                                            {instrument.summary}
                                        </p>
                                    )}

                                    {/* Action buttons */}
                                    <div className="relative mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={handleShare}
                                            disabled={sharing}
                                            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[12px] font-semibold text-zinc-200 transition-all hover:bg-white/[0.06] disabled:opacity-50"
                                        >
                                            {sharing ? <Download className="h-3.5 w-3.5 animate-pulse" /> : <Share2 className="h-3.5 w-3.5" />}
                                            {sharing ? "Preparing…" : "Share Story Card"}
                                        </button>
                                        <a
                                            href={TV_CHART_LINKS[symbol] ?? "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-zinc-200"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Open in TradingView
                                        </a>
                                        {shareNote && <p className="w-full text-[10px] text-zinc-600 mt-1">{shareNote}</p>}
                                    </div>
                                </div>

                                {/* TradingView Chart — tall */}
                                <div className="h-[400px] sm:h-[520px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0f]">
                                    <AdvancedChart symbol={symbol} bullish={bullish} />
                                </div>

                                {/* Analysis pillars — stacked on mobile */}
                                <div className="flex flex-col gap-4 lg:hidden">
                                    <PillarSection icon={Newspaper} label="News Driver" content={instrument.newsDriver} color="text-sky-400" border="border-sky-500/10" bg="bg-sky-500/[0.03]" />
                                    <PillarSection icon={BarChart3} label="Technical Levels" content={instrument.technicalLevels} color="text-violet-400" border="border-violet-500/10" bg="bg-violet-500/[0.03]" />
                                    <PillarSection icon={Landmark} label="Macro Backdrop" content={instrument.macroBackdrop} color="text-amber-400" border="border-amber-500/10" bg="bg-amber-500/[0.03]" />
                                    <PillarSection icon={MessageCircle} label="Reddit Sentiment" content={instrument.redditSentiment} color="text-orange-400" border="border-orange-500/10" bg="bg-orange-500/[0.03]" />
                                </div>
                            </div>

                            {/* ── RIGHT sidebar: Analysis pillars ── */}
                            <aside className="hidden lg:flex flex-col gap-4">
                                <div className="sticky top-24 flex flex-col gap-4">
                                    {/* Timestamp */}
                                    {data?.generatedAt && (
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-700">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
                                            AI generated · {new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    )}
                                    <PillarSection icon={Newspaper} label="News Driver" content={instrument.newsDriver} color="text-sky-400" border="border-sky-500/10" bg="bg-sky-500/[0.03]" />
                                    <PillarSection icon={BarChart3} label="Technical Levels" content={instrument.technicalLevels} color="text-violet-400" border="border-violet-500/10" bg="bg-violet-500/[0.03]" />
                                    <PillarSection icon={Landmark} label="Macro Backdrop" content={instrument.macroBackdrop} color="text-amber-400" border="border-amber-500/10" bg="bg-amber-500/[0.03]" />
                                    <PillarSection icon={MessageCircle} label="Reddit Sentiment" content={instrument.redditSentiment} color="text-orange-400" border="border-orange-500/10" bg="bg-orange-500/[0.03]" />
                                </div>
                            </aside>
                        </div>
                    )}
                </main>
            </AuthGate>
        </DashboardShell>
    );
}
