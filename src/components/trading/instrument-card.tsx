"use client";

import * as React from "react";
import {
  ExternalLink,
  X,
  Share2,
  Download,
  Newspaper,
  BarChart3,
  Landmark,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/* ── Types ── */
export type InstrumentData = {
  symbol: string;
  displayName: string;
  bias: "Bullish" | "Bearish" | "Neutral";
  confidence: number;
  summary: string;
  newsDriver?: string;
  technicalLevels?: string;
  macroBackdrop?: string;
  redditSentiment?: string;
};

function compactText(input?: string, limit = 78): string {
  if (!input) return "";
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1).trimEnd()}…`;
}

function confidenceReason(instrument: InstrumentData): string {
  const availableDrivers = [instrument.newsDriver, instrument.technicalLevels, instrument.macroBackdrop].filter(Boolean).length;
  if (instrument.confidence >= 80) {
    return "High confidence due to aligned news, technical and macro signals.";
  }
  if (instrument.confidence >= 65) {
    return availableDrivers >= 3
      ? "Moderate-high confidence with broad cross-signal confirmation."
      : "Moderate-high confidence with partial cross-signal confirmation.";
  }
  return "Cautious confidence: mixed or weaker signal alignment across drivers.";
}

/* ── TradingView links & widget symbols ── */
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

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 4) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = `${line}${line ? " " : ""}${words[i]}`;
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      lines += 1;
      line = words[i];
      if (lines >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }

  if (lines < maxLines) {
    ctx.fillText(line, x, y + lines * lineHeight);
  }
}

async function makeBiasCardBlob(instrument: InstrumentData): Promise<Blob> {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const bullish = instrument.bias === "Bullish";

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#05070d");
  bg.addColorStop(1, "#0a0f1a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.5, 280, 80, width * 0.5, 280, 520);
  glow.addColorStop(0, bullish ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.22)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(64, 64, width - 128, height - 128);

  ctx.fillStyle = "#d4d4d8";
  ctx.font = "600 38px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("GetTradingBias", 104, 150);

  ctx.fillStyle = bullish ? "#34d399" : "#fb7185";
  ctx.font = "700 88px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(instrument.symbol, 104, 280);

  ctx.fillStyle = bullish ? "#6ee7b7" : "#fda4af";
  ctx.font = "700 52px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(`${instrument.bias.toUpperCase()} · ${instrument.confidence}%`, 104, 360);

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "600 30px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(instrument.displayName, 104, 418);

  let yPos = 520;

  ctx.fillStyle = "#71717a";
  ctx.font = "600 28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("SUMMARY", 104, yPos);
  yPos += 50;

  ctx.fillStyle = "#e4e4e7";
  ctx.font = "500 40px system-ui, -apple-system, Segoe UI, sans-serif";
  drawWrappedText(ctx, instrument.summary, 104, yPos, width - 208, 56, 4);
  yPos += 56 * 4 + 60;

  if (instrument.newsDriver) {
    ctx.fillStyle = "#71717a";
    ctx.font = "600 28px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("NEWS DRIVER", 104, yPos);
    yPos += 50;

    ctx.fillStyle = "#e4e4e7";
    ctx.font = "500 36px system-ui, -apple-system, Segoe UI, sans-serif";
    drawWrappedText(ctx, instrument.newsDriver, 104, yPos, width - 208, 52, 3);
    yPos += 52 * 3 + 50;
  }

  if (instrument.technicalLevels) {
    ctx.fillStyle = "#71717a";
    ctx.font = "600 28px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("TECHNICAL LEVELS", 104, yPos);
    yPos += 50;

    ctx.fillStyle = "#e4e4e7";
    ctx.font = "500 36px system-ui, -apple-system, Segoe UI, sans-serif";
    drawWrappedText(ctx, instrument.technicalLevels, 104, yPos, width - 208, 52, 3);
    yPos += 52 * 3 + 50;
  }

  if (instrument.macroBackdrop) {
    ctx.fillStyle = "#71717a";
    ctx.font = "600 28px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("MACRO BACKDROP", 104, yPos);
    yPos += 50;

    ctx.fillStyle = "#e4e4e7";
    ctx.font = "500 36px system-ui, -apple-system, Segoe UI, sans-serif";
    drawWrappedText(ctx, instrument.macroBackdrop, 104, yPos, width - 208, 52, 3);
  }

  const now = new Date();
  const stamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  ctx.fillStyle = "#71717a";
  ctx.font = "500 28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(`AI Snapshot · ${stamp}`, 104, height - 190);
  ctx.fillText("Share to Instagram Story", 104, height - 140);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Failed to generate image"));
      resolve(blob);
    }, "image/png");
  });
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
  const isBearish = instrument.bias === "Bearish";
  const chartLink = TV_CHART_LINKS[instrument.symbol] ?? "#";
  const [sharing, setSharing] = React.useState(false);
  const [shareNote, setShareNote] = React.useState<string | null>(null);

  const handleShareBiasCard = React.useCallback(async () => {
    try {
      setSharing(true);
      setShareNote(null);
      const blob = await makeBiasCardBlob(instrument);
      const file = new File([blob], `${instrument.symbol.toLowerCase()}-bias-card.png`, {
        type: "image/png",
      });

      const canShareFiles =
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        (navigator as Navigator & { canShare?: (data?: ShareData) => boolean }).canShare?.({ files: [file] });

      if (canShareFiles && navigator.share) {
        await navigator.share({
          files: [file],
          title: `${instrument.symbol} Bias Card`,
          text: `${instrument.symbol} ${instrument.bias} (${instrument.confidence}%) · GetTradingBias`,
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${instrument.symbol.toLowerCase()}-bias-card.png`;
      a.click();
      URL.revokeObjectURL(url);
      setShareNote("Card downloaded. Upload it in Instagram Story.");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setShareNote("Unable to share right now. Please try again.");
    } finally {
      setSharing(false);
    }
  }, [instrument]);

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
    {
      icon: MessageCircle,
      label: "REDDIT SENTIMENT",
      content: instrument.redditSentiment,
      color: "text-orange-400",
      borderColor: "border-orange-500/10",
      bgColor: "bg-orange-500/[0.03]",
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
        <div className="relative max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl shadow-black/80">
          {/* Top glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div
            className={cn(
              "pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full blur-[80px]",
              isBullish ? "bg-emerald-500/10" : isBearish ? "bg-rose-500/10" : "bg-zinc-500/10",
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
                    : isBearish
                      ? "border-rose-500/20 bg-rose-500/[0.08]"
                      : "border-zinc-500/20 bg-zinc-500/[0.08]",
                )}
              >
                {isBullish ? (
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                ) : isBearish ? (
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-0.5">
                  {instrument.displayName}
                </div>
                <div className="text-2xl font-bold tracking-tight text-white leading-none">
                  {instrument.symbol}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Bias pill */}
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-3 py-1.5",
                  isBullish
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : isBearish
                      ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                      : "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
                )}
              >
                {isBullish ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : isBearish ? (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                ) : null}
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  {instrument.bias}
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
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto overscroll-contain space-y-4 px-5 py-5">
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
          <div className="space-y-2 border-t border-white/[0.06] px-5 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-zinc-600">
                AI-generated · Click away or press Esc to close
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareBiasCard}
                  disabled={sharing}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition-all hover:bg-white/[0.06] disabled:opacity-50"
                >
                  {sharing ? <Download className="h-3 w-3 animate-pulse" /> : <Share2 className="h-3 w-3" />}
                  {sharing ? "Preparing…" : "Share Story"}
                </button>
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
            {shareNote ? (
              <div className="text-[10px] text-zinc-500">{shareNote}</div>
            ) : null}
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
  generatedAt,
}: {
  instrument: InstrumentData;
  generatedAt?: string;
}) {
  const [showDetail, setShowDetail] = React.useState(false);
  const isBullish = instrument.bias === "Bullish";
  const isBearish = instrument.bias === "Bearish";

  const drivers = [
    { label: "NEWS", value: compactText(instrument.newsDriver) },
    { label: "TECH", value: compactText(instrument.technicalLevels) },
    { label: "MACRO", value: compactText(instrument.macroBackdrop) },
  ].filter((d) => d.value).slice(0, 3);

  const glowAccent = isBullish ? "bg-emerald-500/10" : isBearish ? "bg-rose-500/10" : "bg-zinc-500/10";
  const stripAccent = isBullish ? "from-emerald-500/80 to-emerald-500/10" : isBearish ? "from-rose-500/80 to-rose-500/10" : "from-zinc-500/80 to-zinc-500/10";
  const badgeAccent = isBullish ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/10" : isBearish ? "text-rose-300 border-rose-500/20 bg-rose-500/10" : "text-zinc-300 border-zinc-500/20 bg-zinc-500/10";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowDetail(true);
          }
        }}
        className="block w-full cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ring-offset-zinc-950"
      >
        <Card className="group relative overflow-hidden border-white/[0.06] bg-[#0c0c0e] shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_24px_80px_rgba(0,0,0,0.8)] cursor-pointer">
          {/* Subtle glow */}
          <div className={cn("pointer-events-none absolute -bottom-16 left-1/2 h-40 w-full -translate-x-1/2 rounded-full blur-[80px] transition-opacity duration-300 opacity-50 group-hover:opacity-100", glowAccent)} />

          {/* Bias-colored side strip */}
          <div className={cn("pointer-events-none absolute left-0 top-3 bottom-3 w-[3px] rounded-r-lg opacity-80", stripAccent)} />

          <CardHeader className="pb-3 pt-4 pl-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
                  {instrument.displayName}
                </div>
                <div className="text-[19px] font-bold tracking-tight text-zinc-100 mb-1.5">
                  {instrument.symbol}
                </div>
                <div className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5", badgeAccent)}>
                  {isBullish ? <ArrowUpRight className="h-3 w-3" /> : isBearish ? <ArrowDownRight className="h-3 w-3" /> : null}
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    {instrument.bias}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Conviction</span>
                <ConfidenceGauge value={instrument.confidence} size={42} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pl-5 pt-0 pb-4">
            {/* TradingView Mini Chart */}
            <div className="relative -mx-1 overflow-hidden rounded-xl border border-white/[0.04] bg-black/40 h-[140px]">
              <MiniChart
                symbol={instrument.symbol}
                tone={isBullish ? "up" : "down"}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#0c0c0e]/80 to-transparent" />
            </div>

            {/* Default visible Key Highlight */}
            {drivers.length > 0 && (
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] px-3.5 py-3">
                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", isBullish ? "bg-emerald-400" : isBearish ? "bg-rose-400" : "bg-zinc-400")} />
                  Top Driver · {drivers[0].label}
                </div>
                <p className="text-[12px] leading-relaxed text-zinc-400 line-clamp-2">
                  {drivers[0].value}
                </p>
              </div>
            )}

            {/* Tap hint */}
            <div className="flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 mt-1">
              <span className="text-[9px] font-bold tracking-widest text-zinc-600">
                CLICK FOR FULL AI REPORT
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDetail && (
        <InstrumentDetailModal
          instrument={instrument}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
