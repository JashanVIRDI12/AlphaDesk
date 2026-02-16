import { NextResponse } from "next/server";

const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.xml";
const DEFAULT_CALENDAR_TIME_ZONE = "Asia/Kolkata";
// Treat feed timestamps as UTC and convert to IST (+5:30).
const FEED_BASE_TIME_ZONE = "UTC";
const LOCAL_DISPLAY_TIME_ZONE = "Asia/Kolkata";

const ALLOWED_CURRENCIES = new Set([
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "NZD",
]);

type CalendarEvent = {
  time: string;
  title: string;
  impact: "High";
  consensus: string;
  previous: string;
  currency: string;
  date: string;
  url: string;
};

type BankHoliday = {
  title: string;
  currency: string;
  date: string;
};

type FeedResult = {
  events: CalendarEvent[];
  holidays: BankHoliday[];
};

type CacheEntry = {
  fetchedAt: number;
  today: string;
  data: CalendarEvent[];
  holidays: BankHoliday[];
  cooldownUntil?: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<FeedResult>>();

// Longer cache TTL when the feed returned zero events for today
const EMPTY_RESULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const NORMAL_TTL_MS = 30 * 60 * 1000;            // 30 minutes

function isWeekend(): boolean {
  // Use IST (UTC+5:30) to decide the current day
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDay = new Date(now.getTime() + istOffset).getUTCDay();
  return istDay === 0 || istDay === 6; // Sunday = 0, Saturday = 6
}

let feedCache:
  | {
    fetchedAt: number;
    xml: string;
    cooldownUntil?: number;
  }
  | undefined;

let feedInflight: Promise<string> | undefined;

async function getFeedXml(): Promise<string> {
  const now = Date.now();
  const ttlMs = 30 * 60 * 1000;

  if (feedCache?.cooldownUntil && now < feedCache.cooldownUntil) {
    throw new Error("calendar_rate_limited");
  }

  if (feedCache && now - feedCache.fetchedAt < ttlMs) {
    return feedCache.xml;
  }

  if (feedInflight) return feedInflight;

  feedInflight = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const res = await fetch(FEED_URL, {
        headers: {
          "user-agent": "hybridtrader/1.0",
          accept: "application/xml,text/xml,*/*",
        },
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 429) {
          const cooldownMs = 10 * 60 * 1000;
          feedCache = {
            fetchedAt: feedCache?.fetchedAt ?? 0,
            xml: feedCache?.xml ?? "",
            cooldownUntil: Date.now() + cooldownMs,
          };
          throw new Error("calendar_rate_limited");
        }

        const text = await res.text();
        const err = new Error(`calendar_upstream_${res.status}`);
        (err as any).details = text.slice(0, 200);
        throw err;
      }

      const xml = await res.text();
      feedCache = { fetchedAt: Date.now(), xml };
      return xml;
    } finally {
      clearTimeout(timeout);
    }
  })();

  try {
    return await feedInflight;
  } finally {
    feedInflight = undefined;
  }
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  return m[1]
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .trim();
}

function decodeEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseFeed(xml: string): FeedResult {
  const events: CalendarEvent[] = [];
  const holidays: BankHoliday[] = [];
  const blocks = xml.match(/<event>[\s\S]*?<\/event>/gi) ?? [];

  for (const block of blocks) {
    const currency = extractTag(block, "country");
    const impact = extractTag(block, "impact");
    const title = decodeEntities(extractTag(block, "title"));
    const date = extractTag(block, "date");

    // Detect bank holidays (title contains "Holiday" or "Day" with no impact)
    const isHoliday =
      /\b(holiday|bank holiday)\b/i.test(title) ||
      (!impact && /\b(day)\b/i.test(title));

    if (isHoliday && ALLOWED_CURRENCIES.has(currency)) {
      holidays.push({
        title: `${currency} · ${title}`,
        currency,
        date,
      });
      continue;
    }

    if (impact !== "High") continue;
    if (!ALLOWED_CURRENCIES.has(currency)) continue;

    const time = extractTag(block, "time");
    const forecast = decodeEntities(extractTag(block, "forecast")) || "—";
    const previous = decodeEntities(extractTag(block, "previous")) || "—";
    const url = extractTag(block, "url");

    events.push({
      time,
      title: `${currency} · ${title}`,
      impact: "High",
      consensus: forecast,
      previous,
      currency,
      date,
      url,
    });
  }

  return { events, holidays };
}

function parseTimeToMinutes(value: string): number {
  // Examples from feed: "6:00am", "1:30pm", sometimes empty
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

function parseTimeToHM(value: string): { h: number; m: number } | null {
  const v = value.trim().toLowerCase();
  const m = v.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (!m) return null;
  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ap = m[3];
  if (ap === "am") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh += 12;
  }
  return { h: hh, m: mm };
}

function parseFeedDateMMDDYYYY(value: string): { year: number; month: number; day: number } | null {
  const m = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return { month: Number(m[1]), day: Number(m[2]), year: Number(m[3]) };
}

function getOffsetMinutes(timeZone: string, utcDate: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(utcDate);

  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  // Examples: "GMT-5", "GMT-04:00"
  const m = tzName.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  const hh = Number(m[2]);
  const mm = Number(m[3] ?? "0");
  return sign * (hh * 60 + mm);
}

function zonedTimeToUtcMillis(
  date: { year: number; month: number; day: number },
  time: { h: number; m: number },
  timeZone: string,
): number {
  // Start with a naive guess, then correct using the zone's offset at that instant.
  let utc = Date.UTC(date.year, date.month - 1, date.day, time.h, time.m, 0, 0);
  for (let i = 0; i < 2; i++) {
    const offMin = getOffsetMinutes(timeZone, new Date(utc));
    utc = Date.UTC(date.year, date.month - 1, date.day, time.h, time.m, 0, 0) - offMin * 60 * 1000;
  }
  return utc;
}

function formatTimeForTz(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  const dayPeriod = (parts.find((p) => p.type === "dayPeriod")?.value ?? "")
    .toLowerCase()
    .replace(".", "");

  if (!hour || !minute || !dayPeriod) return "";
  return `${hour}:${minute}${dayPeriod}`;
}

function getDayKeyForTz(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  return `${month}-${day}-${year}`;
}

function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getTodayKey(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  // feed uses MM-DD-YYYY
  return `${month}-${day}-${year}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tzParam = url.searchParams.get("tz")?.trim();
  const tz = tzParam && isValidTimeZone(tzParam) ? tzParam : DEFAULT_CALENDAR_TIME_ZONE;

  const now = Date.now();
  const istToday = getTodayKey(LOCAL_DISPLAY_TIME_ZONE);
  const today = istToday;
  const key = `${tz}::${today}`;

  const cached = cache.get(key);
  if (cached?.cooldownUntil && now < cached.cooldownUntil) {
    return NextResponse.json({
      source: "ff",
      tz,
      today: cached.today,
      events: cached.data,
      holidays: cached.holidays,
      stale: true,
      error: "calendar_rate_limited",
    });
  }

  // Use longer TTL when the cached result was empty (no news day / weekend)
  const effectiveTtl = (cached?.data?.length === 0 || isWeekend()) ? EMPTY_RESULT_TTL_MS : NORMAL_TTL_MS;

  if (cached && now - cached.fetchedAt < effectiveTtl) {
    const noNews = cached.data.length === 0;
    return NextResponse.json({
      source: "ff",
      tz,
      today: cached.today,
      events: cached.data,
      holidays: cached.holidays,
      cached: true,
      noNews,
      ...(noNews ? { message: "No high-impact news today — market will show less momentum." } : {}),
    });
  }

  const existing = inflight.get(key);
  if (existing) {
    try {
      const result = await existing;
      cache.set(key, { fetchedAt: now, today, data: result.events, holidays: result.holidays });
      return NextResponse.json({ source: "ff", tz, today, events: result.events, holidays: result.holidays, cached: true });
    } catch (e) {
      const entry = cache.get(key);
      if (entry?.data?.length) {
        return NextResponse.json({
          source: "ff",
          tz,
          today: entry.today,
          events: entry.data,
          holidays: entry.holidays,
          stale: true,
          error: "calendar_fetch_failed",
        });
      }

      const message = e instanceof Error ? e.message : "calendar_fetch_failed";
      const details =
        e && typeof e === "object" && "details" in e ? String((e as any).details) : undefined;
      return NextResponse.json(
        { error: message, tz, today, details },
        { status: 502 },
      );
    }
  }

  const fetchPromise = (async (): Promise<FeedResult> => {
    const xml = await getFeedXml();
    const { events: rawEvents, holidays: rawHolidays } = parseFeed(xml);

    const events = rawEvents
      .map((e) => {
        const d = parseFeedDateMMDDYYYY(e.date);
        const t = parseTimeToHM(e.time);
        if (!d || !t) return e;

        // Feed is treated as UTC.
        const utcMillis = Date.UTC(d.year, d.month - 1, d.day, t.h, t.m, 0, 0);
        const dt = new Date(utcMillis);
        const istTime = formatTimeForTz(dt, LOCAL_DISPLAY_TIME_ZONE);
        const istDate = getDayKeyForTz(dt, LOCAL_DISPLAY_TIME_ZONE);

        return {
          ...e,
          time: istTime || e.time,
          date: istDate || e.date,
        };
      })
      // Keep only today's (IST) events. Also prevent accidental bleed from other days.
      .filter((e) => e.date === istToday)
      .slice()
      .sort((a, b) => {
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
      });

    // Convert holiday dates to IST date keys for filtering
    const holidays = rawHolidays
      .map((h) => {
        const d = parseFeedDateMMDDYYYY(h.date);
        if (!d) return h;
        const utcMillis = Date.UTC(d.year, d.month - 1, d.day, 12, 0, 0, 0);
        const dt = new Date(utcMillis);
        const istDate = getDayKeyForTz(dt, LOCAL_DISPLAY_TIME_ZONE);
        return { ...h, date: istDate || h.date };
      })
      .filter((h) => h.date === istToday);

    return { events, holidays };
  })();

  inflight.set(key, fetchPromise);
  try {
    const { events, holidays } = await fetchPromise;
    cache.set(key, { fetchedAt: now, today, data: events, holidays });
    const noNews = events.length === 0;
    return NextResponse.json({
      source: "ff",
      tz,
      today,
      events,
      holidays,
      noNews,
      ...(noNews ? { message: "No high-impact news today — market will show less momentum." } : {}),
    });
  } catch (e) {
    const entry = cache.get(key);
    const message = e instanceof Error ? e.message : "calendar_fetch_failed";
    const details =
      e && typeof e === "object" && "details" in e ? String((e as any).details) : undefined;

    if (entry?.data?.length) {
      return NextResponse.json({
        source: "ff",
        tz,
        today: entry.today,
        events: entry.data,
        holidays: entry.holidays,
        stale: true,
        error: message,
        details,
      });
    }

    return NextResponse.json(
      { error: message, tz, today, details },
      { status: 502 },
    );
  } finally {
    inflight.delete(key);
  }
}
