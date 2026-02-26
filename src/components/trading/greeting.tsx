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
    "Rise and shine",
    "Let's catch some early alpha",
  ],
  afternoon: [
    "Good afternoon",
    "Hope your session is going well",
    "Stay sharp out there",
  ],
  evening: [
    "Good evening",
    "Prime volatility window",
    "Here's your evening update",
  ],
  late: [
    "Late night grinding?",
    "Welcome back",
    "Quiet hours, sharp setups",
  ],
};

const TRADING_TIPS = [
  "Remember: Capital preservation is rule number one. Don't force a setup that isn't there.",
  "You're doing great. Stick to your risk management plan, no matter what the market throws at you.",
  "Patience pays. It's perfectly fine to sit on your hands if the price action is choppy.",
  "One good trade is all it takes. Wait patiently for your perfect pitch.",
  "Trust your edge. Don't let a single losing trade make you doubt your overall strategy.",
  "Take a deep breath. Emotional trading is the quickest way to drawdowns.",
  "Your biggest competitor is you from yesterday. Keep improving bit by bit.",
  "A 'no trade' day is still a profitable day if it saved you from a loss.",
];

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

  const tipIndex = getDayOfYear(now) % TRADING_TIPS.length;
  const friendlyTip = TRADING_TIPS[tipIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-[#0c0c0e] to-[#121214] p-5 md:p-8 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_50%)]" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]", statusTone)}>
              {statusLabel}
            </span>
            <span className="text-[11px] font-medium tracking-wide text-zinc-500">
              {mounted
                ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                : "--:--"}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-[36px] md:leading-[42px] mb-2">
              {mounted ? personalGreeting : title}!
            </h1>
            <p className="text-[14px] leading-relaxed text-zinc-400">
              {subtitle} I've prepared your command center below—let's make today a good one.
            </p>
          </div>
        </div>

        {/* The "Best Friend" Co-pilot Message */}
        <div className="max-w-[320px] rounded-xl border border-indigo-500/10 bg-indigo-500/[0.03] p-4 flex items-start gap-3 relative shrink-0">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400 animate-pulse" />
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">Your Co-Pilot Check-in</h4>
            <p className="text-[12px] leading-relaxed text-zinc-300 italic">
              "{friendlyTip}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
