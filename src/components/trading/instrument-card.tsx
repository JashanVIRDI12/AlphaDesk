"use client";

import * as React from "react";
import {
  ExternalLink,
  X,
  Newspaper,
  BarChart3,
  Landmark,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/* ── Types ── */
export type InstrumentData = {
  symbol: string;
  displayName: string;
  bias: "Bullish" | "Bearish";
  confidence: number;
  summary: string;
  newsDriver?: string;
  technicalLevels?: string;
  macroBackdrop?: string;
};

/* ── TradingView links & widget symbols ── */
const TV_CHART_LINKS: Record<string, string> = {
  EURUSD: "https://www.tradingview.com/chart/?symbol=FX:EURUSD",
  GBPUSD: "https://www.tradingview.com/chart/?symbol=FX:GBPUSD",
  USDJPY: "https://www.tradingview.com/chart/?symbol=FX:USDJPY",
};

const TV_WIDGET_SYMBOLS: Record<string, string> = {
  EURUSD: "FX:EURUSD",
  GBPUSD: "FX:GBPUSD",
  USDJPY: "FX:USDJPY",
};

/* ── Mini TradingView Chart ── */
function MiniChart({ symbol, tone }: { symbol: string; tone: "up" | "down" }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetSymbol = TV_WIDGET_SYMBOLS[symbol] ?? `FX:${symbol}`;

  React.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.type = "text/javascript";

    const lineColor =
      tone === "up" ? "rgba(52, 211, 153, 1)" : "rgba(248, 113, 113, 1)";
    const bottomColor =
      tone === "up"
        ? "rgba(52, 211, 153, 0.08)"
        : "rgba(248, 113, 113, 0.08)";
    const topColor =
      tone === "up"
        ? "rgba(52, 211, 153, 0.25)"
        : "rgba(248, 113, 113, 0.25)";

    script.textContent = JSON.stringify({
      symbol: widgetSymbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: false,
      autosize: true,
      largeChartUrl: "",
      chartOnly: false,
      noTimeScale: false,
      trendLineColor: lineColor,
      underLineColor: bottomColor,
      underLineBottomColor: bottomColor,
      lineColorGrowing: lineColor,
      lineColorFalling: lineColor,
      topColor: topColor,
      bottomColor: bottomColor,
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    container.appendChild(wrapper);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [widgetSymbol, tone]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container h-[180px] w-full overflow-hidden rounded-lg"
    />
  );
}

/* ── Confidence Gauge (radial) ── */
function ConfidenceGauge({
  value,
  size = 48,
}: {
  value: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70
      ? "stroke-emerald-400"
      : clamped >= 55
        ? "stroke-amber-400"
        : "stroke-rose-400";

  const glowColor =
    clamped >= 70
      ? "drop-shadow(0 0 4px rgba(52,211,153,0.4))"
      : clamped >= 55
        ? "drop-shadow(0 0 4px rgba(251,191,36,0.4))"
        : "drop-shadow(0 0 4px rgba(248,113,113,0.4))";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ filter: glowColor }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold tabular-nums text-zinc-200">
          {clamped}
        </span>
      </div>
    </div>
  );
}

/* ── Confidence Bar (linear, for detail modal) ── */
function ConfidenceBarLinear({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const segments = 20;
  const active = Math.round((clamped / 100) * segments);

  const tone = clamped >= 70 ? "strong" : clamped >= 55 ? "medium" : "weak";
  const toneClasses =
    tone === "strong"
      ? "from-emerald-400/80 to-emerald-300/50"
      : tone === "medium"
        ? "from-amber-400/80 to-amber-300/50"
        : "from-rose-400/80 to-rose-300/50";

  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: segments }).map((_, idx) => {
        const on = idx < active;
        return (
          <div
            key={idx}
            className={cn(
              "h-1.5 flex-1 rounded-[2px]",
              on
                ? `bg-gradient-to-b ${toneClasses}`
                : "bg-white/[0.04]",
            )}
          />
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DETAIL MODAL — Full AI analysis popup
   ════════════════════════════════════════════════════════════ */
function InstrumentDetailModal({
  instrument,
  onClose,
}: {
  instrument: InstrumentData;
  onClose: () => void;
}) {
  const isBullish = instrument.bias === "Bullish";
  const chartLink = TV_CHART_LINKS[instrument.symbol] ?? "#";

  // Close on escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const sections = [
    {
      icon: Newspaper,
      label: "NEWS DRIVER",
      content: instrument.newsDriver,
      color: "text-sky-400",
      borderColor: "border-sky-500/10",
      bgColor: "bg-sky-500/[0.03]",
    },
    {
      icon: BarChart3,
      label: "TECHNICAL LEVELS",
      content: instrument.technicalLevels,
      color: "text-violet-400",
      borderColor: "border-violet-500/10",
      bgColor: "bg-violet-500/[0.03]",
    },
    {
      icon: Landmark,
      label: "MACRO BACKDROP",
      content: instrument.macroBackdrop,
      color: "text-amber-400",
      borderColor: "border-amber-500/10",
      bgColor: "bg-amber-500/[0.03]",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl shadow-black/50">
          {/* Top glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div
            className={cn(
              "pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full blur-3xl",
              isBullish ? "bg-emerald-500/8" : "bg-rose-500/8",
            )}
          />

          {/* Header */}
          <div className="relative flex items-start justify-between border-b border-white/[0.06] px-5 pb-4 pt-5">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border",
                  isBullish
                    ? "border-emerald-500/20 bg-emerald-500/[0.08]"
                    : "border-rose-500/20 bg-rose-500/[0.08]",
                )}
              >
                {isBullish ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-medium tracking-wider text-zinc-500">
                  {instrument.displayName}
                </div>
                <div className="text-xl font-bold tracking-tight text-zinc-100">
                  {instrument.symbol}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bias pill */}
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5",
                  isBullish
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-300",
                )}
              >
                {isBullish ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span className="text-[11px] font-semibold tracking-wider">
                  {instrument.bias.toUpperCase()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 px-5 py-5">
            {/* Confidence row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                  Confidence
                </span>
                <span className="text-[13px] font-bold tabular-nums text-zinc-200">
                  {instrument.confidence}%
                </span>
              </div>
              <ConfidenceBarLinear value={instrument.confidence} />
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">
                Summary
              </div>
              <p className="text-[13px] leading-relaxed text-zinc-300">
                {instrument.summary}
              </p>
            </div>

            {/* Three pillars */}
            {sections.map((sec) =>
              sec.content ? (
                <div
                  key={sec.label}
                  className={cn(
                    "rounded-xl border px-4 py-3",
                    sec.borderColor,
                    sec.bgColor,
                  )}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <sec.icon className={cn("h-3.5 w-3.5", sec.color)} />
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.15em]",
                        sec.color,
                      )}
                    >
                      {sec.label}
                    </span>
                  </div>
                  <p className="text-[12px] leading-relaxed text-zinc-400">
                    {sec.content}
                  </p>
                </div>
              ) : null,
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
            <span className="text-[10px] text-zinc-600">
              AI-generated · Click away or press Esc to close
            </span>
            <a
              href={chartLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-zinc-100"
            >
              Open in TradingView
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   INSTRUMENT CARD — Premium glassmorphic design
   ════════════════════════════════════════════════════════════ */
export function InstrumentCard({
  instrument,
}: {
  instrument: InstrumentData;
}) {
  const [showDetail, setShowDetail] = React.useState(false);
  const isBullish = instrument.bias === "Bullish";

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-xl"
      >
        <Card className="group relative overflow-hidden border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_70px_rgba(0,0,0,0.55)] cursor-pointer">
          {/* Edge highlights */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          {/* Bias-colored side strip */}
          <div
            className={cn(
              "pointer-events-none absolute left-0 top-3 bottom-3 w-[2px] rounded-full transition-all duration-300",
              isBullish
                ? "bg-gradient-to-b from-emerald-400/60 to-emerald-400/10"
                : "bg-gradient-to-b from-rose-400/60 to-rose-400/10",
            )}
          />

          {/* Subtle glow */}
          <div
            className={cn(
              "pointer-events-none absolute -bottom-16 left-1/2 h-28 w-[18rem] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-300 opacity-40 group-hover:opacity-60",
              isBullish ? "bg-emerald-500/8" : "bg-rose-500/8",
            )}
          />

          <CardHeader className="pb-1 pl-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                  {instrument.displayName}
                </div>
                <div className="text-[17px] font-bold tracking-tight text-zinc-100">
                  {instrument.symbol}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Bias badge */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1",
                    isBullish
                      ? "border-emerald-500/15 bg-emerald-500/[0.06]"
                      : "border-rose-500/15 bg-rose-500/[0.06]",
                  )}
                >
                  {isBullish ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-rose-400" />
                  )}
                  <span
                    className={cn(
                      "text-[10px] font-semibold tracking-wider",
                      isBullish ? "text-emerald-300" : "text-rose-300",
                    )}
                  >
                    {instrument.bias.toUpperCase()}
                  </span>
                </div>

                {/* Confidence gauge */}
                <ConfidenceGauge value={instrument.confidence} size={42} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pl-5 pt-0">
            {/* TradingView Mini Chart */}
            <div className="relative -mx-1 overflow-hidden rounded-lg border border-white/[0.04] bg-black/30">
              <MiniChart
                symbol={instrument.symbol}
                tone={isBullish ? "up" : "down"}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Summary */}
            <p className="text-[12px] leading-relaxed text-zinc-400 line-clamp-2 min-h-[36px]">
              {instrument.summary}
            </p>

            {/* Tap hint */}
            <div className="flex items-center justify-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-[9px] font-medium tracking-wider text-zinc-600">
                CLICK FOR FULL ANALYSIS
              </span>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Detail Modal */}
      {showDetail && (
        <InstrumentDetailModal
          instrument={instrument}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
