"use client";

import * as React from "react";
import { Landmark, Calendar, Brain, AlertTriangle } from "lucide-react";

import type { HighImpactEvent } from "@/data/market";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TIMEZONE_OPTIONS = [
  { label: "India", value: "Asia/Kolkata", short: "IST" },
  { label: "New York", value: "America/New_York", short: "ET" },
  { label: "London", value: "Europe/London", short: "GMT" },
  { label: "Tokyo", value: "Asia/Tokyo", short: "JST" },
] as const;

type TzValue = (typeof TIMEZONE_OPTIONS)[number]["value"];

function impactTone(impact: HighImpactEvent["impact"]) {
  switch (impact) {
    case "High":
      return "bg-rose-500/[0.08] text-rose-300/80 border-rose-500/10";
    case "Medium":
      return "bg-amber-500/[0.08] text-amber-300/80 border-amber-500/10";
    case "Low":
      return "bg-emerald-500/[0.08] text-emerald-300/80 border-emerald-500/10";
  }
}

type OverviewSection = {
  title: string;
  lines: string[];
};

function isAiOverviewComplete(text: string) {
  const t = text.trim();
  if (!t) return false;
  const has = (k: string) => t.includes(k) || t.includes(k.replace(/:$/, ""));
  const required = ["DATE:", "OVERVIEW:", "SCENARIOS:", "FX IMPACT:", "RISK NOTES:"];
  if (!required.every((k) => has(k))) return false;
  if (!/[.!?\]]\\s*$/.test(t)) return false;
  return true;
}

function parseOverview(text: string): { header: string | null; sections: OverviewSection[] } {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let header: string | null = null;
  const sections: OverviewSection[] = [];
  let current: OverviewSection | null = null;

  for (const line of rawLines) {
    const upper = line.toUpperCase();
    const isSection =
      upper === "OVERVIEW:" ||
      upper === "SCENARIOS:" ||
      upper === "FX IMPACT:" ||
      upper === "RISK NOTES:";

    if (upper.startsWith("DATE:") && !header) {
      header = line;
      continue;
    }

    if (isSection) {
      if (current) sections.push(current);
      current = { title: line.replace(/:$/, ""), lines: [] };
      continue;
    }

    if (!current) {
      current = { title: "", lines: [] };
    }
    current.lines.push(line);
  }

  if (current) sections.push(current);
  const cleaned = sections.filter((s) => s.title || s.lines.length > 0);
  return { header, sections: cleaned };
}

function formatBullet(line: string) {
  return line.replace(/^[-•]\s*/, "");
}

const SECTION_ICONS: Record<string, string> = {
  OVERVIEW: "◆",
  SCENARIOS: "◇",
  "FX IMPACT": "◈",
  "RISK NOTES": "◉",
};

function OverviewRender({ text }: { text: string }) {
  const parsed = React.useMemo(() => parseOverview(text), [text]);

  return (
    <div className="space-y-3.5">
      {parsed.header ? (
        <div className="text-[10px] font-medium tracking-wide text-zinc-500">
          {parsed.header}
        </div>
      ) : null}

      {parsed.sections.map((section, idx) => (
        <div key={`${section.title}-${idx}`} className="space-y-1.5">
          {section.title ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] text-zinc-600">
                {SECTION_ICONS[section.title.toUpperCase()] ?? "◆"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                {section.title}
              </span>
            </div>
          ) : null}

          <div className="space-y-1">
            {section.lines.map((l, i) => {
              const isBullet = /^[-•]\s+/.test(l);
              return (
                <div
                  key={`${idx}-${i}`}
                  className={cn(
                    "text-[11px] leading-[1.6] text-zinc-300",
                    isBullet ? "pl-3" : undefined,
                  )}
                >
                  {isBullet ? (
                    <span className="-ml-3 mr-1.5 inline-block text-zinc-600">
                      –
                    </span>
                  ) : null}
                  <span>
                    {isBullet ? formatBullet(l) : l}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FundamentalsPanel({
  riskMode,
  events,
}: {
  riskMode: "Risk-on" | "Risk-off";
  events: HighImpactEvent[];
}) {
  type CalendarEvent = HighImpactEvent & {
    currency?: string;
    date?: string;
    url?: string;
  };

  type BankHoliday = {
    title: string;
    currency: string;
    date: string;
  };

  const [liveEvents, setLiveEvents] = React.useState<CalendarEvent[] | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [noNews, setNoNews] = React.useState(false);
  const [noNewsMessage, setNoNewsMessage] = React.useState<string | null>(null);
  const [holidays, setHolidays] = React.useState<BankHoliday[]>([]);
  const [selectedTz, setSelectedTz] = React.useState<TzValue>("Asia/Kolkata");

  const selectedTzOption = TIMEZONE_OPTIONS.find((t) => t.value === selectedTz)!;

  const [todayKey, setTodayKey] = React.useState<string | null>(null);

  const [overviewLoading, setOverviewLoading] = React.useState(false);
  const [overviewError, setOverviewError] = React.useState<string | null>(null);
  const [overviewText, setOverviewText] = React.useState<string | null>(null);

  // ── Calendar data caching ──
  const CALENDAR_CACHE_TTL = 15 * 60 * 1000;

  function getCalendarCacheKey(tz: string) {
    const d = new Date();
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return `cal_cache::${tz}::${dateKey}`;
  }

  type CalendarCache = {
    fetchedAt: number;
    events: CalendarEvent[];
    holidays: BankHoliday[];
    today: string | null;
    noNews: boolean;
    message: string | null;
  };

  function readCalendarCache(tz: string): CalendarCache | null {
    try {
      const raw = sessionStorage.getItem(getCalendarCacheKey(tz));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CalendarCache;
      if (Date.now() - parsed.fetchedAt > CALENDAR_CACHE_TTL) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeCalendarCache(tz: string, data: CalendarCache) {
    try {
      sessionStorage.setItem(getCalendarCacheKey(tz), JSON.stringify(data));
    } catch {
      // storage full — ignore
    }
  }

  React.useEffect(() => {
    let cancelled = false;

    async function load(isBackground = false) {
      try {
        if (!isBackground) {
          setLoading(true);
          setError(null);
        }

        const res = await fetch(`/api/calendar?tz=${encodeURIComponent(selectedTz)}`, {
          cache: "no-store",
        });
        const payloadText = await res.text();
        const data = JSON.parse(payloadText) as {
          today?: string;
          events?: CalendarEvent[];
          holidays?: BankHoliday[];
          error?: string;
          details?: string;
          noNews?: boolean;
          message?: string;
        };

        if (!res.ok) {
          throw new Error(
            data.details
              ? `${data.error ?? "calendar_error"}: ${data.details}`
              : data.error ?? String(res.status),
          );
        }
        if (!cancelled) {
          const nextEvents = data.events ?? [];
          setLiveEvents(nextEvents);
          setTodayKey(data.today ?? nextEvents.find((e) => e.date)?.date ?? null);
          setNoNews(data.noNews === true);
          setNoNewsMessage(data.message ?? null);
          setHolidays(data.holidays ?? []);

          writeCalendarCache(selectedTz, {
            fetchedAt: Date.now(),
            events: nextEvents,
            holidays: data.holidays ?? [],
            today: data.today ?? nextEvents.find((e) => e.date)?.date ?? null,
            noNews: data.noNews === true,
            message: data.message ?? null,
          });
        }
      } catch (e) {
        if (!cancelled && !isBackground) setError(e instanceof Error ? e.message : "unknown");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const cached = readCalendarCache(selectedTz);
    if (cached) {
      setLiveEvents(cached.events);
      setTodayKey(cached.today);
      setNoNews(cached.noNews);
      setNoNewsMessage(cached.message);
      setHolidays(cached.holidays);
      setLoading(false);
      load(true);
    } else {
      load(false);
    }

    const id = window.setInterval(() => load(true), 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [selectedTz]);

  const effectiveEvents: CalendarEvent[] = liveEvents ?? (events as CalendarEvent[]);
  const filteredEvents = effectiveEvents;

  const runOverview = async () => {
    if (!todayKey) return;
    setOverviewLoading(true);
    setOverviewError(null);
    setOverviewText(null);

    try {
      const res = await fetch("/api/day-overview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date: todayKey,
          riskMode,
          events: filteredEvents.slice(0, 20).map((e) => ({
            time: e.time,
            title: e.title,
            impact: e.impact,
            consensus: e.consensus,
            previous: e.previous,
            currency: e.currency,
          })),
          holidays: holidays.map((h) => ({
            title: h.title,
            currency: h.currency,
          })),
        }),
      });

      const data = (await res.json()) as { overview?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? String(res.status));
      }

      setOverviewText(data.overview ?? null);
    } catch (e) {
      setOverviewError(e instanceof Error ? e.message : "unknown");
    } finally {
      setOverviewLoading(false);
    }
  };

  React.useEffect(() => {
    if (!todayKey) return;
    if (loading) return;
    if (filteredEvents.length === 0 && holidays.length === 0) return;

    const cacheKey = `day_overview::${todayKey}::${riskMode}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        if (isAiOverviewComplete(cached)) {
          setOverviewText(cached);
          setOverviewError(null);
          setOverviewLoading(false);
          return;
        }
        sessionStorage.removeItem(cacheKey);
      }
    } catch {
      // ignore
    }

    void (async () => {
      await runOverview();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey, riskMode, loading, filteredEvents.length, holidays.length]);

  React.useEffect(() => {
    if (!todayKey) return;
    if (!overviewText) return;

    const cacheKey = `day_overview::${todayKey}::${riskMode}`;
    try {
      if (isAiOverviewComplete(overviewText)) {
        sessionStorage.setItem(cacheKey, overviewText);
      }
    } catch {
      // ignore
    }
  }, [todayKey, riskMode, overviewText]);

  return (
    <Card className="relative overflow-hidden border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_80px_rgba(0,0,0,0.5)]">
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* ── Header ── */}
      <CardHeader className="px-4 pb-2.5 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02]">
              <Calendar className="h-3 w-3 text-zinc-500" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-zinc-200">
              Fundamentals
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Timezone selector */}
            <div className="flex items-center gap-px rounded-lg border border-white/[0.05] bg-white/[0.02] p-[3px]">
              {TIMEZONE_OPTIONS.map((tz) => (
                <button
                  key={tz.value}
                  onClick={() => setSelectedTz(tz.value)}
                  className={cn(
                    "rounded-md px-2 py-[3px] text-[9px] font-medium tracking-wide transition-all duration-300",
                    selectedTz === tz.value
                      ? "bg-white/[0.08] text-zinc-200 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-400",
                  )}
                >
                  {tz.short}
                </button>
              ))}
            </div>
            {/* Risk badge */}
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border px-2 py-0.5 text-[9px] font-medium tracking-wider",
                riskMode === "Risk-on"
                  ? "border-emerald-500/10 bg-emerald-500/[0.06] text-emerald-400/80"
                  : "border-rose-500/10 bg-rose-500/[0.06] text-rose-400/80",
              )}
            >
              {riskMode.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-0">
        {/* ── Bank Holidays ── */}
        {!loading && holidays.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {holidays.map((h) => (
              <div
                key={h.title}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.03]"
              >
                <Landmark className="h-3 w-3 text-sky-400/60" />
                <span className="text-[10px] font-medium text-zinc-400">
                  {h.currency}
                </span>
                <span className="text-[9px] text-zinc-600">·</span>
                <span className="text-[10px] text-zinc-500">
                  {h.title}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {/* ── Calendar Events ── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                {todayKey ? `${todayKey} · ${selectedTzOption.short}` : "Today"}
              </span>
            </div>
            {loading && (
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 animate-pulse rounded-full bg-zinc-600" />
                <span className="text-[9px] text-zinc-600">Loading…</span>
              </div>
            )}
          </div>

          {error && !loading ? (
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] text-zinc-600">
              {error.includes("429") || error.includes("rate")
                ? "Rate limited — using cached data"
                : "Feed unavailable"}
            </div>
          ) : null}

          {/* No events indicator */}
          {!loading && !error && filteredEvents.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/[0.06] bg-amber-500/[0.02] px-3 py-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400/50" />
              <span className="text-[10px] font-medium text-amber-300/60">
                No high-impact news — expect less momentum
              </span>
            </div>
          ) : null}

          {/* Event rows */}
          {filteredEvents.length > 0 ? (
            <div className="space-y-1">
              {filteredEvents.map((e) => (
                <div
                  key={`${e.time}-${e.title}`}
                  className="group flex items-center gap-2.5 rounded-lg border border-white/[0.03] bg-white/[0.01] px-3 py-2 transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.025]"
                >
                  <span className="w-[50px] shrink-0 text-[10px] font-mono font-semibold tabular-nums text-zinc-400">
                    {e.time}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-zinc-300">
                    {e.title}
                  </span>
                  <span className="shrink-0 text-[9px] font-mono tabular-nums text-zinc-600">
                    {e.consensus} / {e.previous}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── AI Brief ── */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-zinc-600" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              AI Brief
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.04] to-transparent" />
            {overviewLoading && (
              <span className="text-[9px] text-zinc-600 animate-pulse">
                analyzing…
              </span>
            )}
          </div>

          {overviewError ? (
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] text-zinc-600">
              {overviewError}
            </div>
          ) : overviewText ? (
            <div className="max-h-[200px] overflow-y-auto rounded-xl border border-white/[0.04] bg-white/[0.015] px-3.5 py-3 text-[10px] leading-[1.7] text-zinc-400 scrollbar-thin scrollbar-thumb-white/10">
              <OverviewRender text={overviewText} />
            </div>
          ) : noNews && holidays.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/[0.06] bg-amber-500/[0.02] px-3 py-2 text-[10px] text-amber-300/50">
              <AlertTriangle className="h-3 w-3" />
              No overview — no catalysts today
            </div>
          ) : (
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] text-zinc-700">
              {overviewLoading ? "Generating…" : "—"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
