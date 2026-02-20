"use client";

import * as React from "react";
import { Activity, Newspaper, ShieldCheck, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useInstruments, useMacroDesk, useNews } from "@/hooks/use-dashboard-data";

function volatilityLabel(value: number): string {
  if (value >= 0.65) return "High Vol";
  if (value >= 0.35) return "Normal Vol";
  return "Low Vol";
}

export function MarketOverviewStrip() {
  const { data: instruments } = useInstruments();
  const { data: macro } = useMacroDesk();
  const { data: news } = useNews();

  const topInstrument = React.useMemo(() => {
    const rows = instruments?.instruments ?? [];
    if (rows.length === 0) return "No bias";
    const top = [...rows].sort((a, b) => b.confidence - a.confidence)[0];
    return `${top.symbol} ${top.bias}`;
  }, [instruments?.instruments]);

  const riskTone = (macro?.riskSentiment || macro?.bias || "Neutral").toUpperCase();

  const latestNews = React.useMemo(() => {
    const first = news?.headlines?.[0];
    if (!first) return "No fresh headlines";
    return `${first.topic ?? first.source} · ${first.ago}`;
  }, [news?.headlines]);

  const avgVol = React.useMemo(() => {
    const vols = instruments?.volatility?.instruments ?? [];
    if (vols.length === 0) return null;
    const avg = vols.reduce((sum, v) => sum + v.currentAtrPct, 0) / vols.length;
    return volatilityLabel(avg);
  }, [instruments?.volatility?.instruments]);

  const items = [
    {
      label: "Risk",
      value: riskTone,
      icon: ShieldCheck,
      tone: "text-violet-300",
    },
    {
      label: "Top Bias",
      value: topInstrument,
      icon: TrendingUp,
      tone: "text-sky-300",
    },
    {
      label: "News",
      value: latestNews,
      icon: Newspaper,
      tone: "text-amber-300",
    },
    {
      label: "Volatility",
      value: avgVol ?? "Loading",
      icon: Activity,
      tone: "text-emerald-300",
    },
  ];

  return (
    <Card className="overflow-hidden border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.07] via-purple-500/[0.04] to-transparent px-2 py-2">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
          >
            <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-zinc-500">
              <item.icon className={cn("h-3 w-3", item.tone)} />
              <span>{item.label}</span>
            </div>
            <div className="truncate text-[11px] font-medium text-zinc-200">{item.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
