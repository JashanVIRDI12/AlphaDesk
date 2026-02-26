"use client";

import * as React from "react";
import { AlertTriangle, TrendingUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketSession } from "@/data/market";

// --- Signal Logic ---
type CalendarEvent = {
    impact: string;
    title?: string;
    currency?: string;
    time?: string;
    date?: string;
};

type BankHoliday = {
    title: string;
    currency: string;
};

type TradeSignal = {
    tone: "trade" | "caution" | "no_trade";
    title: string;
    reason: string;
};

const BANNER_TIME_ZONE = "Asia/Kolkata";

function parseTimeToMinutes(value: string): number {
    const v = value.trim().toLowerCase();
    const m = v.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
    if (!m) return Number.POSITIVE_INFINITY;
    let hh = Number(m[1]);
    const mm = Number(m[2]);
    const ap = m[3];
    if (ap === "am") {
        if (hh === 12) hh = 0;
    } else {
        if (hh !== 12) hh += 12;
    }
    return hh * 60 + mm;
}

function eventMinuteInDay(e: CalendarEvent) {
    const t = typeof e.time === "string" ? e.time : "";
    return parseTimeToMinutes(t);
}

function getNowMinutesInTimeZone(timeZone: string): number {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    return hour * 60 + minute;
}

function isBig3(event: CalendarEvent) {
    const t = (event.title ?? "").toUpperCase();
    return /(\bNFP\b|NON[-\s]?FARM|FOMC|\bCPI\b|CONSUMER PRICE INDEX)/.test(t);
}

function computeSignal(params: {
    eventsToday: CalendarEvent[];
    eventsTomorrow: CalendarEvent[];
    holidays: BankHoliday[];
    nowMinutes: number;
}): TradeSignal | null {
    const todayBig3 = params.eventsToday.filter((e) => e.impact === "High" && isBig3(e));
    const tomorrowBig3 = params.eventsTomorrow.filter((e) => e.impact === "High" && isBig3(e));
    const releasesToday = todayBig3
        .map(eventMinuteInDay)
        .filter((m) => Number.isFinite(m) && m !== Number.POSITIVE_INFINITY)
        .sort((a, b) => a - b);
    const hasHoliday = params.holidays.length > 0;

    if (releasesToday.length > 0) {
        const hasPendingRelease = releasesToday.some((releaseMinute) => params.nowMinutes <= releaseMinute);
        if (hasPendingRelease) {
            return { tone: "no_trade", title: "NO TRADE (WAIT)", reason: "High-impact Big-3 news today — trade after the release." };
        }
        return { tone: "trade", title: "TRADE DAY", reason: "All Big-3 high-impact releases for today are done — trade your plan." };
    }
    if (tomorrowBig3.length > 0) {
        return { tone: "caution", title: "CAUTION", reason: "Big-3 high-impact events scheduled tomorrow — avoid heavy positions overnight." };
    }
    const anyHigh = params.eventsToday.some((e) => e.impact === "High");
    if (!anyHigh) {
        if (hasHoliday) {
            return { tone: "caution", title: "CAUTION", reason: "Bank holiday liquidity conditions — expect choppy price action." };
        }
        return { tone: "trade", title: "TRADE DAY", reason: "No major catalysts today — conditions are cleaner for setups." };
    }
    return { tone: "trade", title: "TRADE DAY", reason: "No Big-3 high-impact releases pending — trade your plan." };
}

// --- Session Logic ---
type SessionSpec = { displayTimeZone: string; activeStart: string; activeEnd: string; };
const STATUS_TIME_ZONE = "Asia/Kolkata";
const SESSION_SPECS: Record<MarketSession["name"], SessionSpec> = {
    Asia: { displayTimeZone: "Asia/Tokyo", activeStart: "05:30", activeEnd: "13:30" },
    London: { displayTimeZone: "Europe/London", activeStart: "13:30", activeEnd: "21:30" },
    "New York": { displayTimeZone: "America/New_York", activeStart: "18:30", activeEnd: "02:30" },
};

function parseHHMM(value: string) {
    const [h, m] = value.split(":").map((n) => Number(n));
    return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
}

function minutesSinceMidnight(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    return hour * 60 + minute;
}

function formatLocalTime(date: Date, timeZone: string) {
    return new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
}

function computeSessionStatus(now: Date, spec: SessionSpec): MarketSession["status"] {
    const nowMin = minutesSinceMidnight(now, STATUS_TIME_ZONE);
    const start = parseHHMM(spec.activeStart);
    const end = parseHHMM(spec.activeEnd);
    const startMin = start.h * 60 + start.m;
    const endMin = end.h * 60 + end.m;
    const crossesMidnight = endMin <= startMin;
    const isActive = crossesMidnight ? nowMin >= startMin || nowMin < endMin : nowMin >= startMin && nowMin < endMin;
    return isActive ? "Open" : "Closed";
}

// --- Component ---
export function TopStatusStrip({ sessions }: { sessions: MarketSession[] }) {
    const [signal, setSignal] = React.useState<TradeSignal | null>(null);
    const [now, setNow] = React.useState<Date>(() => new Date());

    React.useEffect(() => {
        let cancelled = false;
        async function checkSignal() {
            try {
                const res = await fetch("/api/calendar?tz=Asia%2FKolkata&includeTomorrow=1", { cache: "no-store" });
                if (!res.ok || cancelled) return;
                const data = await res.json();
                const eventsToday = (data.events ?? []) as CalendarEvent[];
                const eventsTomorrow = (data.tomorrowEvents ?? []) as CalendarEvent[];
                const holidays = (data.holidays ?? []) as BankHoliday[];
                const nowMinutes = getNowMinutesInTimeZone(BANNER_TIME_ZONE);
                setSignal(computeSignal({ eventsToday, eventsTomorrow, holidays, nowMinutes }));
            } catch { }
        }
        checkSignal();
        const id = window.setInterval(checkSignal, 60 * 1000);
        return () => { cancelled = true; window.clearInterval(id); };
    }, []);

    React.useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const computedSessions = React.useMemo(() => {
        return sessions.map((s) => {
            const spec = SESSION_SPECS[s.name];
            return { ...s, localTime: formatLocalTime(now, spec.displayTimeZone), status: computeSessionStatus(now, spec) };
        });
    }, [sessions, now]);

    const tone = signal?.tone || "trade";
    const bgAccent = tone === "no_trade" ? "bg-rose-500/10 text-rose-300 border-rose-500/20" : tone === "caution" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    const Icon = tone === "no_trade" ? AlertTriangle : tone === "caution" ? HelpCircle : TrendingUp;

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start xl:justify-center gap-3 sm:gap-4 xl:gap-8 w-full mt-2 xl:mt-0 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
            {/* Left: Signal */}
            <div className="flex shrink-0 items-center justify-center sm:justify-start gap-2 sm:gap-3 px-1">
                <div className={cn("flex flex-shrink-0 items-center justify-center p-1.5 xl:p-1 rounded-md xl:rounded border", bgAccent)}>
                    <Icon className="h-4 w-4 xl:h-3 xl:w-3" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {signal ? (
                        <>
                            <span className={cn("text-[11px] sm:text-[12px] xl:text-[10px] font-bold tracking-widest uppercase whitespace-nowrap", tone === "no_trade" ? "text-rose-400" : tone === "caution" ? "text-amber-400" : "text-emerald-400")}>
                                {signal.title}
                            </span>
                            <span className="text-zinc-600">—</span>
                            <span className="text-[11px] xl:text-[10px] text-zinc-400 leading-snug truncate max-w-[140px] sm:max-w-none">{signal.reason}</span>
                        </>
                    ) : (
                        <span className="text-[11px] xl:text-[10px] text-zinc-500 animate-pulse">Computing trade signal...</span>
                    )}
                </div>
            </div>

            {/* Divider on desktop */}
            <div className="hidden sm:block w-px h-6 bg-white/10 shrink-0" />

            {/* Right: Sessions */}
            <div className="flex shrink-0 items-center justify-between sm:justify-start gap-3 sm:gap-5 bg-white/[0.03] sm:bg-transparent border border-white/[0.05] sm:border-none rounded-xl sm:rounded-none px-3 py-2 sm:p-0">
                {computedSessions.map(s => {
                    const isActive = s.status === "Open";
                    return (
                        <div key={s.name} className="flex items-center gap-1.5 text-left shrink-0">
                            <div className="flex flex-col">
                                <span className="text-[9px] xl:text-[8px] font-bold tracking-widest text-zinc-500 uppercase">{s.name}</span>
                                <span className={cn("text-[12px] xl:text-[11px] font-mono font-medium mt-0.5 sm:mt-0", isActive ? "text-white" : "text-zinc-500")}>
                                    {s.localTime}
                                </span>
                            </div>
                            <div className={cn("h-1.5 w-1.5 xl:h-1 xl:w-1 rounded-full mt-1 sm:mt-0 sm:ml-0.5", isActive ? "bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.5)]" : "bg-zinc-800")} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
