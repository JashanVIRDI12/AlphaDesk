"use client";

import * as React from "react";

import type { MarketSession } from "@/data/market";
import { MarketSessionPill } from "@/components/trading/market-session";

type SessionSpec = {
  displayTimeZone: string;
  activeStart: string;
  activeEnd: string;
};

const STATUS_TIME_ZONE = "Asia/Kolkata";

const SESSION_SPECS: Record<MarketSession["name"], SessionSpec> = {
  Asia: {
    displayTimeZone: "Asia/Tokyo",
    activeStart: "05:30",
    activeEnd: "13:30",
  },
  London: {
    displayTimeZone: "Europe/London",
    activeStart: "13:30",
    activeEnd: "21:30",
  },
  "New York": {
    displayTimeZone: "America/New_York",
    activeStart: "18:30",
    activeEnd: "02:30",
  },
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
  const minute = Number(
    parts.find((p) => p.type === "minute")?.value ?? "0",
  );
  return hour * 60 + minute;
}

function formatLocalTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function computeStatus(
  now: Date,
  spec: SessionSpec,
): MarketSession["status"] {
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

export function MarketSessions({ sessions }: { sessions: MarketSession[] }) {
  const [now, setNow] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const computed = React.useMemo(() => {
    return sessions.map((s) => {
      const spec = SESSION_SPECS[s.name];
      return {
        ...s,
        localTime: formatLocalTime(now, spec.displayTimeZone),
        status: computeStatus(now, spec),
      } satisfies MarketSession;
    });
  }, [sessions, now]);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {computed.map((s) => (
        <MarketSessionPill key={s.name} session={s} />
      ))}
    </div>
  );
}
