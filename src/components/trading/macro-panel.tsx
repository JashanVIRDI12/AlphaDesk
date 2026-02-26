"use client";

import * as React from "react";
import { Brain, RefreshCw, Activity, Newspaper, ExternalLink, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMacroDesk, useMacroData, useNews } from "@/hooks/use-dashboard-data";
import type { HighImpactEvent } from "@/data/market";
import { CalendarDesk } from "@/components/trading/fundamentals-panel";

// --- Types ---
type MacroIndicator = {
  rate: string;
  cpi: string;
  gdp: string;
  unemployment: string;
  lastUpdated: string;
};

type Headline = {
  title: string;
  source: string;
  topic?: string;
  url: string;
  publishedAt: string;
  ago: string;
};

type NewsFilter = "ALL" | "USD" | "JPY" | "GBP" | "FED";

// --- Constants ---
const BIAS_STYLES: Record<string, string> = {
  "Risk-on": "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300",
  "Risk-off": "border-red-500/20 bg-red-500/[0.08] text-red-300",
  "Neutral": "border-zinc-400/20 bg-zinc-400/[0.08] text-zinc-300",
  "Risk-on (tactical)": "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300",
  "Risk-off (tactical)": "border-red-500/20 bg-red-500/[0.08] text-red-300",
};

const CURRENCY_CONFIG: Record<string, { label: string; accent: string; accentGlow: string; bank: string }> = {
  USD: { label: "USD", accent: "text-sky-400", accentGlow: "bg-sky-400/10", bank: "FED" },
  EUR: { label: "EUR", accent: "text-indigo-400", accentGlow: "bg-indigo-400/10", bank: "ECB" },
  GBP: { label: "GBP", accent: "text-violet-400", accentGlow: "bg-violet-400/10", bank: "BOE" },
  JPY: { label: "JPY", accent: "text-teal-400", accentGlow: "bg-teal-400/10", bank: "BOJ" },
};

const FILTERS: NewsFilter[] = ["ALL", "USD", "JPY", "GBP", "FED"];
const HIGH_IMPACT_TERMS = ["cpi", "inflation", "nfp", "nonfarm", "fomc", "federal reserve", "fed", "boj", "bank of japan", "boe", "bank of england", "ecb", "interest rate", "rate decision", "intervention", "payroll", "gdp", "pmi"];
const SOURCE_COLORS: Record<string, string> = {
  USD: "text-sky-400/90",
  EUR: "text-indigo-400/90",
  GBP: "text-violet-400/90",
  JPY: "text-teal-400/90",
  GEO: "text-amber-400/90",
  FX: "text-zinc-400/90",
};

// --- Helpers ---
function isFedHeadline(h: Headline): boolean {
  const title = h.title.toLowerCase();
  return h.topic === "USD" || title.includes("federal reserve") || title.includes("fed") || title.includes("fomc");
}

function isHighImpactHeadline(h: Headline): boolean {
  const title = h.title.toLowerCase();
  return HIGH_IMPACT_TERMS.some((term) => title.includes(term));
}

// --- Subcomponents ---
function CurrencyMacroRow({ currency, data }: { currency: string; data: MacroIndicator }) {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return null;
  return (
    <div className="group flex items-center justify-between border-b border-white/[0.04] py-2.5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-md px-2 -mx-2">
      <div className="flex w-[60px] flex-col">
        <span className={cn("text-[11px] font-bold tracking-wider", config.accent)}>{config.label}</span>
        <span className="text-[8px] font-medium tracking-widest text-zinc-600 uppercase mt-0.5">{config.bank}</span>
      </div>
      <div className="flex flex-1 items-center justify-between px-2 sm:px-4">
        <div className="w-12 text-right">
          <span className="text-[11px] font-mono font-medium text-zinc-300 tabular-nums">{data.rate}</span>
        </div>
        <div className="w-12 text-right">
          <span className="text-[11px] font-mono font-medium text-zinc-300 tabular-nums">{data.cpi}</span>
        </div>
        <div className="w-12 text-right">
          <span className="text-[11px] font-mono font-medium text-zinc-300 tabular-nums">{data.gdp}</span>
        </div>
      </div>
    </div>
  );
}

export function MacroPanel({
  riskMode,
  events,
}: {
  riskMode: "Risk-on" | "Risk-off";
  events: HighImpactEvent[];
}) {
  const { data: deskData, isLoading: deskLoading, error: deskError, refetch: refetchDesk } = useMacroDesk();
  const { data: indicatorData, isLoading: indicatorLoading } = useMacroData();
  const { data: newsData, isLoading: newsLoading } = useNews();

  const [activeFilter, setActiveFilter] = React.useState<NewsFilter>("ALL");
  const [highImpactOnly, setHighImpactOnly] = React.useState(false);
  const [, forceTick] = React.useState(0);

  React.useEffect(() => {
    const ticker = window.setInterval(() => forceTick((v) => (v + 1) % 10_000), 60 * 1000);
    return () => window.clearInterval(ticker);
  }, []);

  const loading = deskLoading || indicatorLoading;

  // News calculations
  const filteredHeadlines = React.useMemo(() => {
    const headlines = [...(newsData?.headlines ?? [])];
    const byFilter = activeFilter === "ALL" ? headlines
      : activeFilter === "FED" ? headlines.filter(h => isFedHeadline(h))
        : headlines.filter(h => h.topic === activeFilter);
    const byImpact = highImpactOnly ? byFilter.filter(h => isHighImpactHeadline(h)) : byFilter;
    return byImpact.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [newsData?.headlines, activeFilter, highImpactOnly]);

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-white/[0.08] bg-zinc-950 shadow-2xl">
        <CardHeader className="pb-3"><div className="h-6 w-32 animate-pulse rounded bg-white/[0.06]" /></CardHeader>
        <CardContent className="h-[400px] animate-pulse rounded-xl bg-white/[0.02]" />
      </Card>
    );
  }

  if (deskError && !deskData) {
    return <Card className="border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">Analysis unavailable</Card>;
  }
  if (!deskData) return null;

  const riskSentiment = (deskData.riskSentiment || deskData.bias || "Neutral").trim();
  const riskSentimentLabel = riskSentiment.replace(/\s*\(tactical\)$/i, "").trim();
  const biasStyle = BIAS_STYLES[riskSentiment] ?? "border-zinc-400/20 bg-zinc-400/[0.08] text-zinc-300";

  const analysisThemes = Array.isArray(deskData.keyThemes) ? deskData.keyThemes : Array.isArray(deskData.bullets) ? deskData.bullets : [];
  const topDrivers = analysisThemes.slice(0, 3);
  const summaryText = deskData.brief || deskData.notes || "Global macro conditions are balancing growth signals with inflation data.";

  return (
    <Card className="relative overflow-hidden border-white/[0.08] bg-gradient-to-br from-[#0c0c0e] to-[#121214] shadow-2xl">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(100%_60%_at_50%_0%,black,transparent)]">
        <div className="absolute -top-32 left-1/4 h-64 w-[40rem] rounded-full bg-purple-500/[0.04] blur-[80px]" />
        <div className="absolute -top-32 right-1/4 h-64 w-[30rem] rounded-full bg-blue-500/[0.03] blur-[80px]" />
      </div>

      <CardHeader className="border-b border-white/[0.04] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
              <Globe className="h-4 w-4 text-purple-400/80" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Global Overview</div>
              <h3 className="text-base font-semibold tracking-tight text-zinc-100">Macro & News Desk</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("rounded-md border px-2.5 py-0.5 text-[10px] shadow-sm font-semibold tracking-wider", biasStyle)}>
              {riskSentimentLabel.toUpperCase()}
            </Badge>
            <button onClick={() => refetchDesk()} className="rounded-md p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-white/[0.04] lg:grid-cols-12 lg:divide-x lg:divide-y-0">

          {/* LEFT: MACRO SUMMARY & DATA */}
          <div className="lg:col-span-4 p-4 sm:p-6 space-y-6">

            {/* Unified Summary Section */}
            <div className="rounded-xl border border-white/[0.04] bg-[#0c0c0e] shadow-sm overflow-hidden relative">
              <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-300">Desk Summary</span>
                </div>
              </div>
              <div className="p-4 sm:p-5 relative">
                <p className="text-[13px] leading-[1.65] text-zinc-400">
                  {summaryText}
                </p>
                {topDrivers.length > 0 && (
                  <div className="mt-5 space-y-2.5 pt-4 border-t border-white/[0.04]">
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500 block mb-2.5">Key Takeaways</span>
                    {topDrivers.map((driver, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[12px] text-zinc-300/90 leading-relaxed">
                        <span className="mt-1.5 block h-1 w-2.5 shrink-0 rounded-full bg-zinc-600" />
                        <span>{driver}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Macro Snapshots */}
            {indicatorData?.data && (
              <div className="rounded-xl border border-white/[0.04] bg-[#0c0c0e] p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-zinc-400" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-300">Macro Snapshot</h4>
                </div>

                <div className="flex flex-col text-zinc-400">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-1 px-2 -mx-2">
                    <div className="w-[60px]">
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">FX</span>
                    </div>
                    <div className="flex flex-1 items-center justify-between px-2 sm:px-4">
                      <div className="w-12 text-right"><span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">RATE</span></div>
                      <div className="w-12 text-right"><span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">CPI</span></div>
                      <div className="w-12 text-right"><span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">GDP</span></div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    {["USD", "EUR", "GBP", "JPY"].map((currency) => {
                      const indicators = indicatorData.data.filter((ind: any) => ind.country === currency);
                      if (indicators.length === 0) return null;
                      const macroData = {
                        rate: indicators.find((ind: any) => ind.indicator === "Interest Rate")?.value || "-",
                        cpi: indicators.find((ind: any) => ind.indicator === "CPI")?.value || "-",
                        gdp: indicators.find((ind: any) => ind.indicator === "GDP Growth")?.value || "-",
                        unemployment: indicators.find((ind: any) => ind.indicator === "Unemployment")?.value || "-",
                        lastUpdated: indicators[0]?.date || ""
                      };
                      return <CurrencyMacroRow key={currency} currency={currency} data={macroData} />;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE: CALENDAR DESK */}
          <div className="lg:col-span-4 flex flex-col relative z-10">
            <CalendarDesk riskMode={riskMode} events={events} />
          </div>

          {/* RIGHT: NEWS FEED */}
          <div className="lg:col-span-4 flex flex-col p-4 sm:p-6 bg-[#0c0c0e] relative z-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04]">
                  <Newspaper className="h-3 w-3 text-zinc-400" />
                </div>
                <h4 className="text-sm font-semibold tracking-tight text-zinc-200">Live News</h4>
              </div>
              {newsLoading ? (
                <span className="text-[10px] text-zinc-500">Loading...</span>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/[0.04] px-2 py-0.5">
                  <div className="relative h-1.5 w-1.5">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" style={{ animationDuration: "2s" }} />
                    <div className="relative h-1 w-1 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[8px] font-semibold uppercase tracking-widest text-emerald-400">Live</span>
                </div>
              )}
            </div>

            {/* News Filters */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f} onClick={() => setActiveFilter(f)}
                  className={cn("rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wider transition-colors",
                    activeFilter === f ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => setHighImpactOnly(v => !v)}
                className={cn("ml-auto rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wider transition-colors",
                  highImpactOnly ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:text-zinc-300"
                )}
              >
                HIGH IMPACT
              </button>
            </div>

            {/* Feed */}
            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
              {newsLoading && <div className="text-xs text-zinc-500">Fetching headlines...</div>}
              {!newsLoading && filteredHeadlines.length === 0 && <div className="text-xs text-zinc-500">No headlines found.</div>}

              {filteredHeadlines.slice(0, 8).map((h, i) => (
                <a
                  key={i} href={h.url} target="_blank" rel="noopener noreferrer"
                  className="group block rounded-lg border border-transparent p-2.5 transition-all hover:border-white/[0.06] hover:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className={cn("text-[12px] leading-snug tracking-tight transition-colors", i === 0 ? "font-semibold text-zinc-200" : "font-medium text-zinc-400 group-hover:text-zinc-300")}>
                        {h.title}
                      </h5>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
                        <span className={cn("font-bold tracking-wider", SOURCE_COLORS[h.topic ?? h.source] ?? "text-zinc-500")}>{h.topic ?? h.source}</span>
                        {isHighImpactHeadline(h) && (
                          <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[8px] font-bold text-amber-400">HIGH</span>
                        )}
                        <span className="text-zinc-600">&middot; {h.ago}</span>
                      </div>
                    </div>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </a>
              ))}


            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
