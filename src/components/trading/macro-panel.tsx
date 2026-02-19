"use client";

import * as React from "react";
import { Brain, RefreshCw, Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMacroDesk, useMacroData } from "@/hooks/use-dashboard-data";

type MacroData = {
  title: string;
  bias: string;
  bullets: string[];
  notes: string;
  cached: boolean;
  generatedAt: string;
};

type MacroIndicator = {
  rate: string;
  cpi: string;
  gdp: string;
  unemployment: string;
  lastUpdated: string;
};

type MacroIndicatorData = {
  USD: MacroIndicator;
  EUR: MacroIndicator;
  GBP: MacroIndicator;
  JPY: MacroIndicator;
  cached: boolean;
  fetchedAt: string;
};

const BIAS_STYLES: Record<string, string> = {
  "Risk-on": "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300",
  "Risk-off": "border-red-500/20 bg-red-500/[0.08] text-red-300",
  "Neutral": "border-zinc-400/20 bg-zinc-400/[0.08] text-zinc-300",
  "Risk-on (tactical)":
    "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300",
  "Risk-off (tactical)":
    "border-red-500/20 bg-red-500/[0.08] text-red-300",
};

const CURRENCY_CONFIG: Record<
  string,
  { label: string; accent: string; accentGlow: string; bank: string }
> = {
  USD: {
    label: "USD",
    accent: "text-sky-400",
    accentGlow: "bg-sky-400/10",
    bank: "FED",
  },
  EUR: {
    label: "EUR",
    accent: "text-indigo-400",
    accentGlow: "bg-indigo-400/10",
    bank: "ECB",
  },
  GBP: {
    label: "GBP",
    accent: "text-violet-400",
    accentGlow: "bg-violet-400/10",
    bank: "BOE",
  },
  JPY: {
    label: "JPY",
    accent: "text-teal-400",
    accentGlow: "bg-teal-400/10",
    bank: "BOJ",
  },
};

function MacroIndicatorRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </span>
      <span
        className={cn(
          "text-[12px] font-mono font-medium tabular-nums",
          muted ? "text-zinc-500" : "text-zinc-300",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function CurrencyMacroCard({
  currency,
  data,
}: {
  currency: string;
  data: MacroIndicator;
}) {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return null;

  return (
    <div className="group relative">
      {/* Glass card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl",
          "border border-white/[0.04]",
          "bg-white/[0.02] backdrop-blur-md",
          "p-3.5",
          "transition-all duration-500 ease-out",
          "hover:border-white/[0.08] hover:bg-white/[0.035]",
          "hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]",
        )}
      >
        {/* Top edge highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        {/* Subtle corner glow on hover */}
        <div
          className={cn(
            "pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-500",
            config.accentGlow,
            "group-hover:opacity-60",
          )}
        />

        {/* Header: Currency code + Bank label */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-[11px] font-semibold tracking-tight",
                BIAS_STYLES["Neutral"],
              )}
            >
              {config.label}
            </span>
          </div>
          <span className="rounded-sm bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
            {config.bank}
          </span>
        </div>

        {/* Thin separator */}
        <div className="mb-2.5 h-px bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-transparent" />

        {/* Indicator rows */}
        <div className="space-y-1.5">
          <MacroIndicatorRow label="Rate" value={data.rate} />
          <MacroIndicatorRow label="CPI" value={data.cpi} />
          <MacroIndicatorRow label="GDP" value={data.gdp} />
          <MacroIndicatorRow label="Unemp" value={data.unemployment} muted />
        </div>
      </div>
    </div>
  );
}

export function MacroPanel() {
  const { data: deskData, isLoading: deskLoading, error: deskError, refetch } = useMacroDesk();
  const { data: indicatorData, isLoading: indicatorLoading } = useMacroData();
  const [, forceFreshnessTick] = React.useState(0);

  const macroSnapshotLabel = React.useMemo(() => {
    const t = indicatorData?.generatedAt;
    if (!t) return null;
    const diff = Date.now() - new Date(t).getTime();
    if (!Number.isFinite(diff)) return null;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Last updated just now";
    if (mins < 60) return `Last updated ${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `Last updated ${hrs}h ago`;
  }, [indicatorData?.generatedAt, forceFreshnessTick]);

  React.useEffect(() => {
    const ticker = window.setInterval(
      () => forceFreshnessTick((v) => (v + 1) % 10_000),
      60 * 1000,
    );
    return () => window.clearInterval(ticker);
  }, []);

  const loading = deskLoading || indicatorLoading;
  const error = deskError ? "Failed to load" : null;

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_22px_80px_rgba(0,0,0,0.5)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-3 w-12 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-4 w-32 animate-pulse rounded bg-white/[0.06]" />
            </div>
            <div className="h-6 w-28 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[120px] animate-pulse rounded-xl bg-white/[0.02] border border-white/[0.03]"
              />
            ))}
          </div>
          <div className="space-y-3 pt-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/[0.06]" />
                <div className="h-4 w-full animate-pulse rounded bg-white/[0.03]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !deskData) {
    return (
      <Card className="relative overflow-hidden border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_22px_80px_rgba(0,0,0,0.5)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">
                Desk
              </div>
              <div className="text-[15px] font-semibold tracking-tight text-zinc-200">
                AI Macro Desk
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-full p-1.5 text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-400"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-3 py-2.5 text-[11px] text-amber-200/70">
            Analysis unavailable — {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deskData) return null;

  const riskSentiment = (deskData.riskSentiment || deskData.bias || "Neutral").trim();
  const analysisThemes = Array.isArray(deskData.keyThemes)
    ? deskData.keyThemes
    : Array.isArray(deskData.bullets)
      ? deskData.bullets
      : [];
  const takeaway = deskData.brief || deskData.notes || "";
  const biasStyle =
    BIAS_STYLES[riskSentiment] ??
    "border-zinc-400/20 bg-zinc-400/[0.08] text-zinc-300";

  const timeAgo = deskData.generatedAt
    ? (() => {
      const diff = Date.now() - new Date(deskData.generatedAt).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      return `${hrs}h ago`;
    })()
    : "";

  return (
    <Card className="relative overflow-hidden border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_22px_80px_rgba(0,0,0,0.5)]">
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)]">
        <div className="absolute -top-20 left-1/2 h-40 w-[28rem] -translate-x-1/2 rounded-full bg-purple-500/[0.04] blur-3xl" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* AI icon with subtle pulse ring */}
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-400/10" style={{ animationDuration: "3s" }} />
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03]">
                <Brain className="h-3.5 w-3.5 text-purple-400/80" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">
                Desk
              </div>
              <h3 className="text-[15px] font-semibold leading-tight tracking-tight text-zinc-200">
                Macro Desk Brief
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider",
                biasStyle,
              )}
            >
              {riskSentiment.toUpperCase()}
            </Badge>
            <button
              onClick={() => refetch()}
              disabled={false}
              className="rounded-full p-1.5 text-zinc-600 transition-colors hover:bg-white/[0.04] hover:text-zinc-400 disabled:opacity-30"
              title="Refresh analysis"
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5",
                  false ? "animate-spin" : "",
                )}
              />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Macro Indicators Grid ── */}
        {indicatorData?.data && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="h-3 w-3 text-zinc-600" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Macro Snapshot
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-transparent" />
              {macroSnapshotLabel ? (
                <span className="text-[9px] tracking-wide text-zinc-700">
                  {macroSnapshotLabel}
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {["USD", "EUR", "GBP", "JPY"].map((currency) => {
                const indicators = indicatorData.data.filter((ind: any) => ind.country === currency);
                if (indicators.length === 0) return null;
                const macroData = {
                  rate: indicators.find((ind: any) => ind.indicator === "Interest Rate")?.value || "N/A",
                  cpi: indicators.find((ind: any) => ind.indicator === "CPI")?.value || "N/A",
                  gdp: indicators.find((ind: any) => ind.indicator === "GDP Growth")?.value || "N/A",
                  unemployment: indicators.find((ind: any) => ind.indicator === "Unemployment")?.value || "N/A",
                  lastUpdated: indicators[0]?.date || ""
                };
                return (
                  <CurrencyMacroCard
                    key={currency}
                    currency={currency}
                    data={macroData}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── AI Analysis Section ── */}
        <div className="space-y-3">
          {indicatorData && (
            <div className="flex items-center gap-3">
              <Brain className="h-3 w-3 text-zinc-600" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Analysis
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-transparent" />
            </div>
          )}

          <ul className="space-y-3 text-[13px] leading-[1.6] text-zinc-400">
            {analysisThemes.map((bullet: string, i: number) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-zinc-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Tactical Note ── */}
        {takeaway && (
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3.5 py-2.5 text-[12px] leading-[1.6] text-zinc-400">
            <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Takeaway
            </span>
            <span className="text-zinc-300">{takeaway}</span>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-0.5 text-[9px] text-zinc-700">
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-purple-500/40" />
            <span className="tracking-wide">AI-generated</span>
          </div>
          {timeAgo && (
            <span className="tracking-wide">
              {timeAgo}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
