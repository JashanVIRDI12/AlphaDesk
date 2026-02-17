"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

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

function isBig4(event: CalendarEvent) {
    const c = event.currency;
    if (c && ["USD", "EUR", "GBP", "JPY"].includes(c)) return true;
    const t = event.title ?? "";
    return /\b(USD|EUR|GBP|JPY)\b/.test(t);
}

function computeSignal(params: {
    eventsToday: CalendarEvent[];
    eventsTomorrow: CalendarEvent[];
    holidays: BankHoliday[];
    nowMinutes: number;
}): TradeSignal | null {
    const todayBig4 = params.eventsToday.filter(
        (e) => e.impact === "High" && isBig4(e),
    );
    const tomorrowBig4 = params.eventsTomorrow.filter(
        (e) => e.impact === "High" && isBig4(e),
    );

    const releasesToday = todayBig4
        .map(eventMinuteInDay)
        .filter((m) => Number.isFinite(m) && m !== Number.POSITIVE_INFINITY)
        .sort((a, b) => a - b);

    // If bank holiday, treat as caution (thin liquidity) unless already no-trade.
    const hasHoliday = params.holidays.length > 0;

    // Big rule: if there is at least one big release today and it's not fully passed,
    // it's a no-trade window (trade after release).
    if (releasesToday.length > 0) {
        const lastRelease = releasesToday[releasesToday.length - 1];
        const bufferAfter = 30; // minutes after last release
        if (params.nowMinutes <= lastRelease + bufferAfter) {
            return {
                tone: "no_trade",
                title: "NO TRADE (WAIT)",
                reason: "High-impact Big-4 news today — trade after the release.",
            };
        }
    }

    // If big events tomorrow, show caution for positioning.
    if (tomorrowBig4.length > 0) {
        return {
            tone: "caution",
            title: "CAUTION",
            reason: "Big-4 high-impact events scheduled tomorrow — avoid heavy positions overnight.",
        };
    }

    // If no high impact events at all, show trade day (or caution if holiday).
    const anyHigh = params.eventsToday.some((e) => e.impact === "High");
    if (!anyHigh) {
        if (hasHoliday) {
            return {
                tone: "caution",
                title: "CAUTION",
                reason: "Bank holiday liquidity conditions — expect choppy price action.",
            };
        }
        return {
            tone: "trade",
            title: "TRADE DAY",
            reason: "No major catalysts today — conditions are cleaner for setups.",
        };
    }

    // Default: trade day (normal conditions)
    return {
        tone: "trade",
        title: "TRADE DAY",
        reason: "No Big-4 high-impact releases pending — trade your plan.",
    };
}

/**
 * Shows a prominent trade guidance banner based on Big-4 news volatility risk.
 */
export function NoTradeDayBanner() {
    const [signal, setSignal] = React.useState<TradeSignal | null>(null);
    const [, tick] = React.useState(0);

    React.useEffect(() => {
        let cancelled = false;

        async function check() {
            try {
                const res = await fetch(
                    "/api/calendar?tz=Asia%2FKolkata&includeTomorrow=1",
                    { cache: "no-store" },
                );
                if (!res.ok) return;
                const data = await res.json();

                if (cancelled) return;

                const eventsToday = (data.events ?? []) as CalendarEvent[];
                const eventsTomorrow = (data.tomorrowEvents ?? []) as CalendarEvent[];
                const holidays = (data.holidays ?? []) as BankHoliday[];

                const now = new Date();
                const nowMinutes = now.getHours() * 60 + now.getMinutes();

                setSignal(
                    computeSignal({
                        eventsToday,
                        eventsTomorrow,
                        holidays,
                        nowMinutes,
                    }),
                );

            } catch {
                // silently ignore
            }
        }

        check();
        const id = window.setInterval(() => tick((v) => (v + 1) % 10_000), 60 * 1000);
        return () => {
            cancelled = true;
            window.clearInterval(id);
        };
    }, []);

    if (!signal) return null;

    const tone = signal.tone;
    const toneClasses =
        tone === "no_trade"
            ? "border-rose-500/10 from-rose-500/[0.04] via-rose-500/[0.06] to-rose-500/[0.04]"
            : tone === "caution"
              ? "border-amber-500/10 from-amber-500/[0.04] via-amber-500/[0.06] to-amber-500/[0.04]"
              : "border-emerald-500/10 from-emerald-500/[0.04] via-emerald-500/[0.06] to-emerald-500/[0.04]";

    const iconTone =
        tone === "no_trade"
            ? "border-rose-500/15 bg-rose-500/[0.08] text-rose-300/80"
            : tone === "caution"
              ? "border-amber-500/15 bg-amber-500/[0.08] text-amber-400/80"
              : "border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-300/80";

    const titleTone =
        tone === "no_trade"
            ? "text-rose-300/90"
            : tone === "caution"
              ? "text-amber-300/90"
              : "text-emerald-300/90";

    const reasonTone =
        tone === "no_trade"
            ? "text-rose-400/50"
            : tone === "caution"
              ? "text-amber-400/50"
              : "text-emerald-400/50";

    return (
        <div
            className={`relative overflow-hidden rounded-xl border bg-gradient-to-r px-4 py-3 ${toneClasses}`}
        >
            {/* Subtle glow */}
            <div className="pointer-events-none absolute -top-10 left-1/2 h-20 w-60 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${iconTone}`}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <div>
                    <div className={`text-[12px] font-semibold tracking-wide ${titleTone}`}>
                        {signal.title}
                    </div>
                    <div className={`text-[10px] ${reasonTone}`}>
                        {signal.reason}
                    </div>
                </div>
            </div>
        </div>
    );
}
