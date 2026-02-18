"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import type { MarketSession } from "@/data/market";
import { getAggregateMarketStatus } from "@/data/market";
import { cn } from "@/lib/utils";

type SessionSpec = {
  activeStart: string;
  activeEnd: string;
};

type TimeGreetingKey = "morning" | "afternoon" | "evening" | "late";

const STATUS_TIME_ZONE = "Asia/Kolkata";

const SESSION_SPECS: Record<MarketSession["name"], SessionSpec> = {
  Asia: { activeStart: "05:30", activeEnd: "13:30" },
  London: { activeStart: "13:30", activeEnd: "21:30" },
  "New York": { activeStart: "18:30", activeEnd: "02:30" },
};

const GREETING_VARIANTS: Record<TimeGreetingKey, string[]> = {
  morning: [
    "Good morning",
    "Fresh session ahead",
    "Morning check-in",
  ],
  afternoon: [
    "Good afternoon",
    "Mid-session focus",
    "Stay selective",
  ],
  evening: [
    "Good evening",
    "Prime volatility window",
    "Evening desk update",
  ],
  late: [
    "Welcome back",
    "Quiet hours, sharp setups",
    "Late-session discipline",
  ],
};

function parseHHMM(value: string) {
  const [h, m] = value.split(":").map((n) => Number(n));
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
}

function minutesSinceMidnight(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function computeStatus(now: Date, spec: SessionSpec): MarketSession["status"] {
  const nowMin = minutesSinceMidnight(now, STATUS_TIME_ZONE);
  const start = parseHHMM(spec.activeStart);
  const end = parseHHMM(spec.activeEnd);
  const startMin = start.h * 60 + start.m;
  const endMin = end.h * 60 + end.m;

  const crossesMidnight = endMin <= startMin;
  const isActive = crossesMidnight
    ? nowMin >= startMin || nowMin < endMin
    : nowMin >= startMin && nowMin < endMin;

  return isActive ? "Open" : "Closed";
}

function getTimeGreetingKey(date: Date): TimeGreetingKey {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late";
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
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
  const [now, setNow] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const liveSessions = React.useMemo(
    () =>
      sessions.map((s) => ({
        ...s,
        status: computeStatus(now, SESSION_SPECS[s.name]),
      })),
    [sessions, now],
  );

  const computedStatus = getAggregateMarketStatus(liveSessions);
  const marketStatus: MarketSession["status"] =
    computedStatus === "Closed" ? "Open" : computedStatus;
  const greetingKey = getTimeGreetingKey(now);
  const greetingChoices = GREETING_VARIANTS[greetingKey];
  const greetingIndex = (getDayOfYear(now) + (effectiveName?.trim().length ?? 0)) % greetingChoices.length;
  const baseGreeting = greetingChoices[greetingIndex] ?? greetingChoices[0] ?? "Welcome back";
  const personalGreeting = effectiveName?.trim()
    ? `${baseGreeting}, ${effectiveName.trim()}`
    : baseGreeting;

  const statusLabel =
    marketStatus === "Open"
      ? "Markets are open"
      : marketStatus === "Pre-market"
        ? "Markets are pre-market"
        : "Markets are closed";

  const statusTone =
    marketStatus === "Open"
      ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300"
      : marketStatus === "Pre-market"
        ? "border-amber-500/20 bg-amber-500/[0.08] text-amber-300"
        : "border-white/10 bg-white/[0.04] text-zinc-300";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.045] via-white/[0.02] to-transparent p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)] md:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", statusTone)}>
            {statusLabel}
          </span>
          <span className="text-[10px] tracking-wide text-zinc-500">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-[34px] md:leading-[38px]">
          {mounted ? personalGreeting : title}
        </h1>

        {subtitle && (
          <p className="max-w-2xl text-[13px] leading-5 text-zinc-400 md:text-[15px] md:leading-6">
            {subtitle}
          </p>
        )}

        <div className="text-[11px] font-medium tracking-wide text-zinc-500">
          Scroll down for dedicated analysis ↓
        </div>
      </div>
    </div>
  );
}
