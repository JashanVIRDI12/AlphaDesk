"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Fetches the calendar API and shows a prominent "NO TRADE DAY" banner
 * at the top of the page when there are zero high-impact (red-folder) events.
 */
export function NoTradeDayBanner() {
    const [show, setShow] = React.useState(false);
    const [reason, setReason] = React.useState("");

    React.useEffect(() => {
        let cancelled = false;

        async function check() {
            try {
                const res = await fetch("/api/calendar?tz=Asia/Kolkata");
                if (!res.ok) return;
                const data = await res.json();

                const events = (data.events ?? []) as Array<{
                    impact: string;
                }>;
                const holidays = (data.holidays ?? []) as Array<{
                    title: string;
                    currency: string;
                }>;

                const highImpact = events.filter(
                    (e) => e.impact === "High",
                );

                if (cancelled) return;

                if (highImpact.length === 0) {
                    setShow(true);
                    if (holidays.length > 0) {
                        const names = holidays
                            .map((h) => h.title)
                            .join("  |  ");
                        setReason(`Bank holidays: ${names}`);
                    } else {
                        setReason("No high-impact events scheduled today");
                    }
                } else {
                    setShow(false);
                }
            } catch {
                // silently ignore
            }
        }

        check();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!show) return null;

    return (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/10 bg-gradient-to-r from-amber-500/[0.04] via-amber-500/[0.06] to-amber-500/[0.04] px-4 py-3">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute -top-10 left-1/2 h-20 w-60 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/15 bg-amber-500/[0.08]">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400/80" />
                </div>
                <div>
                    <div className="text-[12px] font-semibold tracking-wide text-amber-300/90">
                        NO TRADE DAY
                    </div>
                    <div className="text-[10px] text-amber-400/50">
                        {reason}
                    </div>
                </div>
            </div>
        </div>
    );
}
