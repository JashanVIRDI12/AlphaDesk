"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import type { MarketSession } from "@/data/market";
import { getAggregateMarketStatus } from "@/data/market";

function getTimeGreetingLabel(date: Date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Welcome back";
}

export function Greeting({
  title,
  subtitle,
  sessions,
  userName,
}: {
  title: string;
  subtitle: string;
  sessions: MarketSession[];
  userName?: string;
}) {
  const { data: session } = useSession();
  const sessionName = session?.user?.name ?? undefined;
  const effectiveName = userName ?? sessionName;
  const [mounted, setMounted] = React.useState(false);
  const [personalTitle, setPersonalTitle] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const base = getTimeGreetingLabel(new Date());
    const suffix = effectiveName?.trim() ? `, ${effectiveName.trim()}` : "";
    setPersonalTitle(`${base}${suffix}`);
  }, [effectiveName]);

  const marketStatus = getAggregateMarketStatus(sessions);
  const statusLabel =
    marketStatus === "Open"
      ? "Markets are open"
      : marketStatus === "Pre-market"
        ? "Markets are pre-market"
        : "Markets are closed";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[34px] md:leading-[38px]">
          {mounted && personalTitle ? personalTitle : title}
        </h1>
      </div>
      {subtitle && (
        <p className="max-w-2xl text-[13px] leading-5 text-muted-foreground md:text-[15px] md:leading-6">
          {subtitle}
        </p>
      )}
      <div className="text-[11px] text-muted-foreground">{statusLabel}</div>
    </div>
  );
}
