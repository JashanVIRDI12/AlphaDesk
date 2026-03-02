import { NextResponse } from "next/server";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  /api/instruments – AI-powered FX instrument analysis               */
/*  Three-pillar approach: NEWS + TECHNICALS + MACRO                   */
/*  News-first: headlines drive bias, technicals confirm, macro frames */
/* ------------------------------------------------------------------ */

type InstrumentAnalysis = {
    symbol: string;
    displayName: string;
    bias: "Bullish" | "Bearish";
    confidence: number;
    summary: string;
    newsDriver: string;
    technicalLevels: string;
    macroBackdrop: string;
    redditSentiment: string;
};

type VolatilityPoint = {
    time: number;
    value: number;
};

type InstrumentVolatility = {
    symbol: string;
    displayName: string;
    currentAtrPct: number;
    points: VolatilityPoint[];
};

type VolatilityPayload = {
    timeframe: "1H";
    period: 14;
    instruments: InstrumentVolatility[];
};

type InstrumentsResponse = {
    instruments: InstrumentAnalysis[];
    volatility: VolatilityPayload;
    cached: boolean;
    generatedAt: string;
    stale?: boolean;
    error?: string;
};

const instrumentAnalysisSchema = z
    .object({
        symbol: z.string(),
        displayName: z.string().optional(),
        display_name: z.string().optional(),
        bias: z.string(),
        confidence: z.union([z.number(), z.string()]).optional(),
        summary: z.string().optional(),
        newsDriver: z.string().optional(),
        news_driver: z.string().optional(),
        technicalLevels: z.string().optional(),
        technical_levels: z.string().optional(),
        macroBackdrop: z.string().optional(),
        macro_backdrop: z.string().optional(),
        redditSentiment: z.string().optional(),
        reddit_sentiment: z.string().optional(),
    })
    .transform((item): InstrumentAnalysis => ({
        symbol: String(item.symbol),
        displayName: String(item.displayName ?? item.display_name ?? item.symbol),
        bias: String(item.bias) === "Bearish" ? "Bearish" : "Bullish",
        confidence: Math.min(95, Math.max(30, Number(item.confidence) || 50)),
        summary: String(item.summary ?? ""),
        newsDriver: String(item.newsDriver ?? item.news_driver ?? ""),
        technicalLevels: String(item.technicalLevels ?? item.technical_levels ?? ""),
        macroBackdrop: String(item.macroBackdrop ?? item.macro_backdrop ?? ""),
        redditSentiment: String(item.redditSentiment ?? item.reddit_sentiment ?? ""),
    }));

const aiInstrumentsSchema = z
    .union([
        z.array(instrumentAnalysisSchema),
        z.object({ instruments: z.array(instrumentAnalysisSchema) }),
    ])
    .transform((v) => (Array.isArray(v) ? v : v.instruments));

const instrumentsResponseSchema = z.object({
    instruments: z.array(
        z.object({
            symbol: z.string(),
            displayName: z.string(),
            bias: z.enum(["Bullish", "Bearish"]),
            confidence: z.number(),
            summary: z.string(),
            newsDriver: z.string(),
            technicalLevels: z.string(),
            macroBackdrop: z.string(),
            redditSentiment: z.string(),
        }),
    ),
    volatility: z.object({
        timeframe: z.literal("1H"),
        period: z.literal(14),
        instruments: z.array(
            z.object({
                symbol: z.string(),
                displayName: z.string(),
                currentAtrPct: z.number(),
                points: z.array(
                    z.object({
                        time: z.number(),
                        value: z.number(),
                    }),
                ),
            }),
        ),
    }),
    cached: z.boolean(),
    generatedAt: z.string(),
    stale: z.boolean().optional(),
    error: z.string().optional(),
});

type OpenRouterErrorCode = "rate_limited" | "provider_unavailable" | `openrouter_failed_${number}`;

function sanitizeOpenRouterError(status: number): OpenRouterErrorCode {
    if (status === 429) return "rate_limited";
    if (status >= 500) return "provider_unavailable";
    return `openrouter_failed_${status}`;
}

function parseAIInstruments(raw: string): InstrumentAnalysis[] | null {
    if (!raw) return null;

    const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

    const tryParse = (candidate: string): InstrumentAnalysis[] | null => {
        try {
            const parsed = JSON.parse(candidate);
            const validated = aiInstrumentsSchema.safeParse(parsed);
            if (!validated.success) return null;
            return validated.data.length > 0 ? validated.data : null;
        } catch {
            return null;
        }
    };

    const direct = tryParse(cleaned);
    if (direct) return direct;

    const jsonMatch = cleaned.match(/\[[\s\S]*\]/) ?? cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return tryParse(jsonMatch[0]);
}

/* ── Cache (15-minute TTL for fresher instrument summaries) ── */
let cache:
    | {
        key: string;
        fetchedAt: number;
        data: InstrumentsResponse;
    }
    | undefined;

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const CACHE_HEADERS = {
    "Cache-Control": "private, max-age=0, s-maxage=900, stale-while-revalidate=1800",
};

/* ── Instruments to analyse ── */
const INSTRUMENTS = [
    { symbol: "EURUSD", displayName: "Euro / Dollar", yahoo: "EURUSD=X" },
    { symbol: "GBPUSD", displayName: "Cable", yahoo: "GBPUSD=X" },
    { symbol: "USDJPY", displayName: "Dollar / Yen", yahoo: "USDJPY=X" },
    { symbol: "XAUUSD", displayName: "Gold / Dollar", yahoo: "XAUUSD=X" },
];

/* ────────────────────────────────────────────────────────────────────
   PILLAR 1: NEWS CONTEXT (most important for short-term direction)
   ──────────────────────────────────────────────────────────────────── */
async function fetchNewsContext(baseUrl: string): Promise<string> {
    try {
        const res = await fetch(`${baseUrl}/api/news`, {
            signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) return "No news available.";
        const data = await res.json();
        const headlines = (data.headlines ?? []) as Array<{
            title: string;
            source: string;
            ago: string;
        }>;
        if (headlines.length === 0) return "No recent headlines.";
        return headlines
            .slice(0, 15)
            .map((h) => `- [${h.source}] ${h.title} (${h.ago})`)
            .join("\n");
    } catch {
        return "Could not fetch news.";
    }
}

/* ────────────────────────────────────────────────────────────────────
   PILLAR 2: TECHNICAL CONTEXT (1H and 4H price action from Yahoo)
   Fetches real candle data → computes trend, momentum, key levels
   ──────────────────────────────────────────────────────────────────── */

type TechnicalSnapshot = {
    symbol: string;
    price: number;
    // 1H metrics
    h1_trend: "up" | "down" | "flat";
    h1_change_pct: number;
    h1_high: number;
    h1_low: number;
    h1_candles_up: number;
    h1_candles_down: number;
    // 4H metrics
    h4_trend: "up" | "down" | "flat";
    h4_change_pct: number;
    h4_high: number;
    h4_low: number;
    // Daily context
    daily_high: number;
    daily_low: number;
    daily_change_pct: number;
    // Momentum
    momentum: "bullish" | "bearish" | "neutral";
    // Key levels
    nearest_support: number;
    nearest_resistance: number;
    // Volatility (ATR%)
    atr_pct_current: number;
    atr_pct_series: VolatilityPoint[];
};

function computeAtrPctSeries(
    candles: Array<{ time: number; high: number; low: number; close: number }>,
    period = 14,
): VolatilityPoint[] {
    if (candles.length <= period) return [];

    const trueRanges: number[] = [];
    const series: VolatilityPoint[] = [];

    for (let i = 1; i < candles.length; i++) {
        const prevClose = candles[i - 1].close;
        const curr = candles[i];
        const tr = Math.max(
            curr.high - curr.low,
            Math.abs(curr.high - prevClose),
            Math.abs(curr.low - prevClose),
        );
        trueRanges.push(tr);

        if (trueRanges.length >= period && curr.close > 0) {
            const window = trueRanges.slice(-period);
            const atr = window.reduce((sum, v) => sum + v, 0) / period;
            const atrPct = (atr / curr.close) * 100;
            series.push({
                time: curr.time,
                value: Math.round(atrPct * 10_000) / 10_000,
            });
        }
    }

    return series;
}

function buildVolatilityPayload(snapshots: (TechnicalSnapshot | null)[]): VolatilityPayload {
    const bySymbol = new Map(INSTRUMENTS.map((inst) => [inst.symbol, inst.displayName]));

    const instruments = snapshots
        .filter((snap): snap is TechnicalSnapshot => snap !== null)
        .map((snap) => ({
            symbol: snap.symbol,
            displayName: bySymbol.get(snap.symbol) ?? snap.symbol,
            currentAtrPct: snap.atr_pct_current,
            points: snap.atr_pct_series,
        }))
        .sort((a, b) => b.currentAtrPct - a.currentAtrPct);

    return {
        timeframe: "1H",
        period: 14,
        instruments,
    };
}

type YahooQuoteSnapshot = {
    symbol: string;
    last: number;
    prevClose: number;
    changePct: number;
    volume: number;
    avgVolume: number;
};

type GoldMarketContext = {
    dxy: YahooQuoteSnapshot | null;
    us10y: YahooQuoteSnapshot | null;
    tip: YahooQuoteSnapshot | null;
    gld: YahooQuoteSnapshot | null;
    realYieldSignal: "up" | "down" | "neutral";
    etfFlowSignal: "inflow" | "outflow" | "neutral";
    text: string;
};

async function fetchYahooQuoteSnapshot(yahooSymbol: string): Promise<YahooQuoteSnapshot | null> {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1mo`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; GetTradingBias/1.0)",
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return null;
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        const quote = result?.indicators?.quote?.[0];
        const closes = ((quote?.close as Array<number | null> | undefined) ?? [])
            .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);
        const volumes = ((quote?.volume as Array<number | null> | undefined) ?? [])
            .filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0);

        if (closes.length < 2) return null;
        const last = closes[closes.length - 1];
        const prevClose = closes[closes.length - 2];
        const changePct = ((last - prevClose) / prevClose) * 100;

        const lastVolume = volumes.length > 0 ? volumes[volumes.length - 1] : 0;
        const volWindow = volumes.slice(-10);
        const avgVolume =
            volWindow.length > 0
                ? volWindow.reduce((sum, v) => sum + v, 0) / volWindow.length
                : 0;

        return {
            symbol: yahooSymbol,
            last,
            prevClose,
            changePct: Math.round(changePct * 1000) / 1000,
            volume: lastVolume,
            avgVolume: Math.round(avgVolume),
        };
    } catch {
        return null;
    }
}

async function fetchGoldMarketContext(): Promise<GoldMarketContext> {
    const [dxy, us10y, tip, gld] = await Promise.all([
        fetchYahooQuoteSnapshot("DX-Y.NYB"), // Dollar index
        fetchYahooQuoteSnapshot("^TNX"), // US 10Y nominal yield
        fetchYahooQuoteSnapshot("TIP"), // TIPS ETF proxy for real-yield direction
        fetchYahooQuoteSnapshot("GLD"), // Gold ETF flow proxy
    ]);

    let realYieldSignal: "up" | "down" | "neutral" = "neutral";
    if (us10y && tip) {
        if (us10y.changePct > 0.3 && tip.changePct < 0) realYieldSignal = "up";
        else if (us10y.changePct < -0.3 && tip.changePct > 0) realYieldSignal = "down";
    }

    let etfFlowSignal: "inflow" | "outflow" | "neutral" = "neutral";
    if (gld && gld.avgVolume > 0) {
        const volumeRatio = gld.volume / gld.avgVolume;
        if (volumeRatio >= 1.3 && gld.changePct > 0) etfFlowSignal = "inflow";
        else if (volumeRatio >= 1.3 && gld.changePct < 0) etfFlowSignal = "outflow";
    }

    const dxyText = dxy
        ? `DXY ${dxy.last.toFixed(2)} (${dxy.changePct >= 0 ? "+" : ""}${dxy.changePct.toFixed(2)}% d/d)`
        : "DXY unavailable";
    const realYieldText = us10y && tip
        ? `US real-yield proxy: 10Y ${us10y.last.toFixed(2)} (${us10y.changePct >= 0 ? "+" : ""}${us10y.changePct.toFixed(2)}%) vs TIP ${tip.last.toFixed(2)} (${tip.changePct >= 0 ? "+" : ""}${tip.changePct.toFixed(2)}%) => ${realYieldSignal}`
        : "US real-yield proxy unavailable";
    const gldText = gld && gld.avgVolume > 0
        ? `GLD ${gld.last.toFixed(2)} (${gld.changePct >= 0 ? "+" : ""}${gld.changePct.toFixed(2)}%) vol ${Math.round(gld.volume / 1_000_000)}M vs avg ${Math.round(gld.avgVolume / 1_000_000)}M => ${etfFlowSignal}`
        : "GLD flow proxy unavailable";

    return {
        dxy,
        us10y,
        tip,
        gld,
        realYieldSignal,
        etfFlowSignal,
        text: `${dxyText}\n${realYieldText}\n${gldText}`,
    };
}

async function fetchTechnicalData(
    yahooSymbol: string,
    fxSymbol: string,
): Promise<TechnicalSnapshot | null> {
    try {
        // Fetch 1H candles for last 5 days (gives us ~120 candles for 1H and derived 4H)
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1h&range=5d`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; GetTradingBias/1.0)",
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return null;
        const data = await res.json();

        const result = data?.chart?.result?.[0];
        if (!result) return null;

        const timestamps = result.timestamp as number[] | undefined;
        const quotes = result.indicators?.quote?.[0];

        if (!timestamps || !quotes || timestamps.length < 10) return null;

        const rawCloses = (quotes.close as (number | null)[]).map((v) => v ?? 0);
        const rawHighs = (quotes.high as (number | null)[]).map((v) => v ?? 0);
        const rawLows = (quotes.low as (number | null)[]).map((v) => v ?? 0);

        const candles = timestamps
            .map((time, idx) => ({
                time,
                close: rawCloses[idx] ?? 0,
                high: rawHighs[idx] ?? 0,
                low: rawLows[idx] ?? 0,
            }))
            .filter(
                (c) =>
                    Number.isFinite(c.close) &&
                    Number.isFinite(c.high) &&
                    Number.isFinite(c.low) &&
                    c.close > 0 &&
                    c.high > 0 &&
                    c.low > 0,
            );

        if (candles.length < 20) return null;

        const closes = candles.map((c) => c.close);
        const highs = candles.map((c) => c.high);
        const lows = candles.map((c) => c.low);

        // Filter out zero values
        const validLen = closes.filter((c) => c > 0).length;
        if (validLen < 10) return null;

        const currentPrice = closes[closes.length - 1] || closes[closes.length - 2] || 0;
        if (currentPrice === 0) return null;

        // ── 1H Analysis (last 6 candles = 6 hours) ──
        const h1Slice = Math.min(6, closes.length);
        const h1Closes = closes.slice(-h1Slice).filter((c) => c > 0);
        const h1Highs = highs.slice(-h1Slice).filter((h) => h > 0);
        const h1Lows = lows.slice(-h1Slice).filter((l) => l > 0);

        const h1Start = h1Closes[0] || currentPrice;
        const h1ChangePct = ((currentPrice - h1Start) / h1Start) * 100;

        let h1Up = 0;
        let h1Down = 0;
        for (let i = 1; i < h1Closes.length; i++) {
            if (h1Closes[i] > h1Closes[i - 1]) h1Up++;
            else if (h1Closes[i] < h1Closes[i - 1]) h1Down++;
        }

        const h1Trend: "up" | "down" | "flat" =
            h1ChangePct > 0.03 ? "up" : h1ChangePct < -0.03 ? "down" : "flat";

        // ── 4H Analysis (last 24 candles = ~24 hours, grouped in 4s) ──
        const h4Slice = Math.min(24, closes.length);
        const h4Closes = closes.slice(-h4Slice).filter((c) => c > 0);
        const h4Highs = highs.slice(-h4Slice).filter((h) => h > 0);
        const h4Lows = lows.slice(-h4Slice).filter((l) => l > 0);

        const h4Start = h4Closes[0] || currentPrice;
        const h4ChangePct = ((currentPrice - h4Start) / h4Start) * 100;

        const h4Trend: "up" | "down" | "flat" =
            h4ChangePct > 0.08 ? "up" : h4ChangePct < -0.08 ? "down" : "flat";

        // ── Daily (all available candles) ──
        const allValidCloses = closes.filter((c) => c > 0);
        const allValidHighs = highs.filter((h) => h > 0);
        const allValidLows = lows.filter((l) => l > 0);

        const dayStart = allValidCloses[0] || currentPrice;
        const dailyChangePct = ((currentPrice - dayStart) / dayStart) * 100;

        // ── Momentum scoring ──
        const h1Score = h1ChangePct > 0.02 ? 1 : h1ChangePct < -0.02 ? -1 : 0;
        const h4Score = h4ChangePct > 0.05 ? 1 : h4ChangePct < -0.05 ? -1 : 0;
        const trendScore = h1Score + h4Score;
        const momentum: "bullish" | "bearish" | "neutral" =
            trendScore >= 1 ? "bullish" : trendScore <= -1 ? "bearish" : "neutral";

        // ── Key levels (recent swing highs/lows) ──
        const recentHighs = h4Highs.length > 0 ? h4Highs : [currentPrice];
        const recentLows = h4Lows.length > 0 ? h4Lows : [currentPrice];

        // Find distinct swing highs above current price (resistance)
        const resistanceLevels = recentHighs
            .filter((h) => h > currentPrice)
            .sort((a, b) => a - b);
        const nearestResistance =
            resistanceLevels.length > 0
                ? resistanceLevels[0]
                : Math.max(...recentHighs);

        // Find distinct swing lows below current price (support)
        const supportLevels = recentLows
            .filter((l) => l < currentPrice && l > 0)
            .sort((a, b) => b - a);
        const nearestSupport =
            supportLevels.length > 0
                ? supportLevels[0]
                : Math.min(...recentLows.filter((l) => l > 0));

        const atrPctSeries = computeAtrPctSeries(candles, 14);
        const atrPctCurrent =
            atrPctSeries.length > 0 ? atrPctSeries[atrPctSeries.length - 1].value : 0;

        return {
            symbol: fxSymbol,
            price: currentPrice,
            h1_trend: h1Trend,
            h1_change_pct: Math.round(h1ChangePct * 1000) / 1000,
            h1_high: Math.max(...h1Highs, currentPrice),
            h1_low: Math.min(...h1Lows.filter((l) => l > 0), currentPrice),
            h1_candles_up: h1Up,
            h1_candles_down: h1Down,
            h4_trend: h4Trend,
            h4_change_pct: Math.round(h4ChangePct * 1000) / 1000,
            h4_high: Math.max(...h4Highs, currentPrice),
            h4_low: Math.min(...h4Lows.filter((l) => l > 0), currentPrice),
            daily_high: Math.max(...allValidHighs, currentPrice),
            daily_low: Math.min(...allValidLows.filter((l) => l > 0), currentPrice),
            daily_change_pct: Math.round(dailyChangePct * 1000) / 1000,
            momentum,
            nearest_support: nearestSupport,
            nearest_resistance: nearestResistance,
            atr_pct_current: atrPctCurrent,
            atr_pct_series: atrPctSeries.slice(-48),
        };
    } catch (err) {
        console.error(`[instruments] Technical data fetch failed for ${fxSymbol}:`, err);
        return null;
    }
}

function formatTechnicalContext(snapshots: (TechnicalSnapshot | null)[]): string {
    const valid = snapshots.filter((s): s is TechnicalSnapshot => s !== null);
    if (valid.length === 0) return "Technical data unavailable.";

    return valid
        .map((s) => {
            const fmt = (v: number) => {
                if (s.symbol === "XAUUSD") return v.toFixed(2);
                return s.symbol.includes("JPY") ? v.toFixed(3) : v.toFixed(5);
            };

            return `${s.symbol}: Price=${fmt(s.price)}
  1H: trend=${s.h1_trend}, change=${s.h1_change_pct}%, high=${fmt(s.h1_high)}, low=${fmt(s.h1_low)}, candles(up=${s.h1_candles_up}/down=${s.h1_candles_down})
  4H: trend=${s.h4_trend}, change=${s.h4_change_pct}%, high=${fmt(s.h4_high)}, low=${fmt(s.h4_low)}
  Daily: change=${s.daily_change_pct}%, high=${fmt(s.daily_high)}, low=${fmt(s.daily_low)}
  Momentum: ${s.momentum}
  Key Levels: support=${fmt(s.nearest_support)}, resistance=${fmt(s.nearest_resistance)}`;
        })
        .join("\n\n");
}

/* ────────────────────────────────────────────────────────────────────
   PILLAR 3: MACRO CONTEXT (rates, CPI etc — background framing)
   ──────────────────────────────────────────────────────────────────── */
async function fetchCalendarContext(baseUrl: string): Promise<string> {
    try {
        const res = await fetch(`${baseUrl}/api/calendar`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return "No calendar data.";
        const data = await res.json();

        const events = (data.events ?? []) as Array<{
            title: string;
            time: string;
            impact: string;
            currency?: string;
            consensus?: string;
            previous?: string;
        }>;

        if (events.length === 0) return "No high-impact events today.";

        return events
            .slice(0, 10)
            .map(
                (e) =>
                    `- ${e.time} [${e.currency ?? ""}] ${e.title} (${e.impact}${e.consensus ? `, cons: ${e.consensus}` : ""}${e.previous ? `, prev: ${e.previous}` : ""})`,
            )
            .join("\n");
    } catch {
        return "Could not fetch calendar.";
    }
}

/* ────────────────────────────────────────────────────────────────────
   PILLAR 4: REDDIT COMMUNITY SENTIMENT (r/Forex)
   Fetches live posts per pair — gives AI crowd-sourced price levels,
   trader positioning signals, and recent narrative.
   ──────────────────────────────────────────────────────────────────── */
async function fetchRedditContext(baseUrl: string): Promise<string> {
    try {
        const res = await fetch(`${baseUrl}/api/reddit`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return "Reddit data unavailable.";
        const data = await res.json();
        const posts = (data.posts ?? []) as Array<{
            title: string;
            selftext: string;
            pair: string;
            score: number;
            numComments: number;
            ago: string;
        }>;
        if (posts.length === 0) return "No Reddit posts found.";

        // Group top posts per pair
        const byPair: Record<string, typeof posts> = {};
        for (const p of posts) {
            const key = p.pair === "GENERAL" ? "GENERAL" : p.pair;
            if (!byPair[key]) byPair[key] = [];
            byPair[key].push(p);
        }

        const sections: string[] = [];
        for (const [pair, pairPosts] of Object.entries(byPair)) {
            const top = pairPosts.slice(0, 4);
            const lines = top.map((p) => {
                const body = p.selftext ? ` — "${p.selftext.substring(0, 100).trim()}..."` : "";
                return `  · [${p.score}↑ ${p.numComments}💬 ${p.ago}] ${p.title}${body}`;
            });
            sections.push(`${pair}:\n${lines.join("\n")}`);
        }
        return sections.join("\n\n");
    } catch {
        return "Could not fetch Reddit data.";
    }
}

async function fetchMacroContext(baseUrl: string): Promise<string> {
    try {
        const res = await fetch(`${baseUrl}/api/macro-data`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return "No macro data.";
        const data = await res.json();

        const currencies = ["USD", "EUR", "GBP", "JPY"] as const;
        const lines: string[] = [];

        for (const ccy of currencies) {
            const d = data[ccy];
            if (!d) continue;
            lines.push(
                `${ccy}: Rate=${d.rate}, CPI=${d.cpi}, GDP=${d.gdp}, Unemployment=${d.unemployment}`,
            );
        }

        return lines.length > 0 ? lines.join("\n") : "No macro data.";
    } catch {
        return "Could not fetch macro data.";
    }
}

/* ── AI call ── */
async function callAI(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    baseUrl: string,
): Promise<{ instruments: InstrumentAnalysis[] | null; errorCode?: OpenRouterErrorCode }> {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": baseUrl,
                "X-Title": "GetTradingBias",
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.35,
                max_tokens: 1800,
            }),
            signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[instruments] ${model} error:`, res.status, errText.slice(0, 300));
            return { instruments: null, errorCode: sanitizeOpenRouterError(res.status) };
        }

        const json = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
        console.log(`[instruments] ${model} raw (${raw.length} chars):`, raw.slice(0, 200));

        return { instruments: parseAIInstruments(raw) };
    } catch (err) {
        console.error(`[instruments] Failed to parse AI response (${model}):`, err);
        return { instruments: null };
    }
}

/* ── Rule-based fallback ── */
function buildFallback(
    macroContext: string,
    newsContext: string,
    technicals: (TechnicalSnapshot | null)[],
    goldMarket: GoldMarketContext,
): InstrumentAnalysis[] {
    return INSTRUMENTS.map((inst, idx) => {
        const tech = technicals[idx];
        const newsLower = newsContext.toLowerCase();

        // News signals
        const usdBullish =
            newsLower.includes("dollar strength") ||
            newsLower.includes("fed haw") ||
            newsLower.includes("rate hike");

        let bias: "Bullish" | "Bearish" = "Bullish";
        let confidence = 50;
        let summary = "";

        if (inst.symbol === "EURUSD") {
            bias = usdBullish || tech?.momentum === "bearish" ? "Bearish" : "Bullish";
            confidence = tech ? (Math.abs(tech.h4_change_pct) > 0.1 ? 62 : 50) : 50;
            summary = tech
                ? `${tech.h4_trend === "down" ? "Trending lower" : tech.h4_trend === "up" ? "Recovering" : "Ranging"} on 4H. Price at ${tech.price.toFixed(5)}, support ${tech.nearest_support.toFixed(5)}.`
                : "Watching EUR headlines and ECB rhetoric for direction.";
        } else if (inst.symbol === "GBPUSD") {
            bias = usdBullish || tech?.momentum === "bearish" ? "Bearish" : "Bullish";
            confidence = tech ? (Math.abs(tech.h4_change_pct) > 0.1 ? 58 : 48) : 48;
            summary = tech
                ? `Cable ${tech.h4_trend === "down" ? "under pressure" : tech.h4_trend === "up" ? "bid" : "consolidating"} on 4H. Key support at ${tech.nearest_support.toFixed(5)}.`
                : "Cable tracking USD tone. BoE outlook mixed.";
        } else if (inst.symbol === "USDJPY") {
            const jpyWeak =
                newsLower.includes("boj") || newsLower.includes("yen weak");
            bias = jpyWeak || tech?.momentum === "bullish" ? "Bullish" : "Bearish";
            confidence = tech ? (Math.abs(tech.h4_change_pct) > 0.1 ? 60 : 52) : 52;
            summary = tech
                ? `${tech.h4_trend === "up" ? "Pushing higher" : tech.h4_trend === "down" ? "Pulling back" : "Consolidating"} on 4H near ${tech.price.toFixed(3)}. Resistance at ${tech.nearest_resistance.toFixed(3)}.`
                : "Watching US yields and BoJ headlines for direction.";
        } else if (inst.symbol === "XAUUSD") {
            const riskOffTone =
                newsLower.includes("geopolitical") ||
                newsLower.includes("conflict") ||
                newsLower.includes("safe haven");

            const dxyStrong = (goldMarket.dxy?.changePct ?? 0) > 0.2;
            const realYieldPressureUp = goldMarket.realYieldSignal === "up";
            const etfInflow = goldMarket.etfFlowSignal === "inflow";

            bias =
                riskOffTone || etfInflow || (!dxyStrong && !realYieldPressureUp && tech?.momentum !== "bearish")
                    ? "Bullish"
                    : "Bearish";
            confidence = tech ? (Math.abs(tech.h4_change_pct) > 0.25 ? 64 : 54) : 54;
            if (dxyStrong && realYieldPressureUp && bias === "Bearish") confidence += 6;
            if (etfInflow && bias === "Bullish") confidence += 4;
            confidence = Math.min(72, confidence);
            summary = tech
                ? `Gold ${tech.h4_trend === "up" ? "holding bid" : tech.h4_trend === "down" ? "under pressure" : "range-bound"} on 4H near ${tech.price.toFixed(2)}; DXY/real-yield proxy ${realYieldPressureUp ? "headwind" : "supportive"}.`
                : `Gold tracking DXY ${goldMarket.dxy ? goldMarket.dxy.changePct.toFixed(2) + "%" : "n/a"}, real-yield proxy ${goldMarket.realYieldSignal}, and ETF-flow proxy ${goldMarket.etfFlowSignal}.`;
        }

        const newsDriver = "AI analysis unavailable — using rule-based signals from headline sentiment.";
        const technicalLevels = tech
            ? `Price at ${inst.symbol === "XAUUSD" ? tech.price.toFixed(2) : inst.symbol.includes("JPY") ? tech.price.toFixed(3) : tech.price.toFixed(5)}. 4H trend: ${tech.h4_trend}. Support: ${inst.symbol === "XAUUSD" ? tech.nearest_support.toFixed(2) : inst.symbol.includes("JPY") ? tech.nearest_support.toFixed(3) : tech.nearest_support.toFixed(5)}, Resistance: ${inst.symbol === "XAUUSD" ? tech.nearest_resistance.toFixed(2) : inst.symbol.includes("JPY") ? tech.nearest_resistance.toFixed(3) : tech.nearest_resistance.toFixed(5)}.`
            : "Technical data unavailable.";
        const macroBackdrop =
            inst.symbol === "XAUUSD"
                ? `Gold drivers (Yahoo): ${goldMarket.text}`
                : "Macro data available but AI model was unreachable for detailed analysis.";

        return {
            symbol: inst.symbol,
            displayName: inst.displayName,
            bias,
            confidence,
            summary,
            newsDriver,
            technicalLevels,
            macroBackdrop,
            redditSentiment: "Reddit sentiment unavailable in fallback mode.",
        };
    });
}

/* ── Models to try ── */
const FALLBACK_MODELS = [
    "google/gemini-2.0-flash-001",
    "google/gemini-3-flash-preview",
    "meta-llama/llama-3.3-70b-instruct",
];

/* ── GET handler ── */
export async function GET(req: Request) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const primaryModel =
        process.env.OPENROUTER_MODEL || "openai/gpt-5-mini";

    const aiConfigured = Boolean(apiKey);

    // Cache key: date + 15-minute block
    const now = new Date();
    const quarterBlock = Math.floor(now.getMinutes() / 15);
    const cacheKey = `${now.toISOString().slice(0, 10)}-h${now.getHours()}-q${quarterBlock}`;

    if (cache && cache.key === cacheKey && Date.now() - cache.fetchedAt < CACHE_TTL) {
        return NextResponse.json(cache.data, { headers: CACHE_HEADERS });
    }

    // Determine base URL
    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // ── Gather ALL four pillars in parallel ──
    const [newsContext, calendarContext, macroContext, redditContext, goldMarket, ...techSnapshots] =
        await Promise.all([
            fetchNewsContext(baseUrl),
            fetchCalendarContext(baseUrl),
            fetchMacroContext(baseUrl),
            fetchRedditContext(baseUrl),
            fetchGoldMarketContext(),
            ...INSTRUMENTS.map((i) => fetchTechnicalData(i.yahoo, i.symbol)),
        ]);

    const technicalContext = formatTechnicalContext(
        techSnapshots as (TechnicalSnapshot | null)[],
    );
    const volatility = buildVolatilityPayload(techSnapshots as (TechnicalSnapshot | null)[]);

    const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/New_York",
        hour12: true,
    });

    // ── Four-pillar prompt ──
    const systemPrompt = `You are an elite FX trader at a top-tier prop desk, known for blending NEWS FLOW with TECHNICAL ANALYSIS, MACRO context, and COMMUNITY SENTIMENT from r/Forex.

Your analysis methodology (in order of priority):
1. NEWS FLOW (35% weight): What are the latest headlines saying? Which currencies are being mentioned? What's the sentiment? Breaking news > old news.
2. TECHNICALS (30% weight): What does 1H and 4H price action show? Trend direction, momentum, key support/resistance levels. Use the actual price data provided.
3. MACRO (20% weight): Central bank rates, CPI, GDP — these set the background but rarely change intraday bias.
4. REDDIT COMMUNITY SENTIMENT (15% weight): What are traders on r/Forex discussing? Are there crowd-sourced levels, positioning signals, or narratives worth noting?

RULES:
- Your summary MUST reference at least one specific headline or news event AND one technical level/trend.
- Never write a purely macro summary (e.g. "rates favor USD"). That's lazy analysis.
- Good example: "BOJ-Ueda meeting headlines driving yen volatility; 4H trending up from 153.20 support. Watch 154.00 resistance."
- Bad example: "Fed at 4.5% vs ECB 2.9% keeps EUR under pressure." (too macro-focused, no news or technicals)
- Confidence should reflect how aligned all four pillars are. If Reddit community strongly disagrees with your technical bias, reduce confidence by 5-10 points.
- Respond with ONLY valid JSON. No code fences, no explanation.`;

    const pairList = INSTRUMENTS.map((i) => `${i.symbol} (${i.displayName})`).join(", ");

    const userPrompt = `Analyse these FX pairs: ${pairList}

CURRENT TIME: ${timeStr} ET

═══════════════════════════════════
PILLAR 1: LIVE NEWS (most important)
═══════════════════════════════════
${newsContext}

═══════════════════════════════════
PILLAR 2: TECHNICAL DATA (1H & 4H)
═══════════════════════════════════
${technicalContext}

═══════════════════════════════════
PILLAR 3: MACRO BACKDROP
═══════════════════════════════════
${macroContext}

═══════════════════════════════════
PILLAR 4: REDDIT r/Forex COMMUNITY SENTIMENT
(Real trader discussions — treat as anecdotal positioning signals)
═══════════════════════════════════
${redditContext}

═══════════════════════════════════
GOLD-SPECIFIC MARKET INPUTS (Yahoo)
═══════════════════════════════════
${goldMarket.text}

═══════════════════════════════════
ECONOMIC CALENDAR
═══════════════════════════════════
${calendarContext}

═══════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════
For each pair, provide:
- bias: "Bullish" or "Bearish" (for the pair — EURUSD Bullish = EUR strength)
- confidence: 30-95 (higher only when news + technicals + macro + reddit all agree)
- summary: 1 concise sentence referencing BOTH a news driver AND a technical level. Max 25 words.
- newsDriver: 1–2 sentences on the key news headlines driving this pair right now. Be specific — cite actual headlines.
- technicalLevels: 1–2 sentences on 1H/4H structure — trend, momentum, key support/resistance with prices. Use the data above.
- macroBackdrop: 1 sentence on rates/CPI/GDP framing. For XAUUSD, explicitly include DXY + US real-yield proxy + GLD ETF-flow proxy.
- redditSentiment: 1 sentence synthesising what r/Forex traders are saying about this pair from the Reddit data above. Note dominant sentiment (bullish/bearish/mixed), any crowd-sourced key levels mentioned, or notable narratives. If no relevant posts exist for this pair, say "No significant community discussion found."

Respond with ONLY this JSON:
{"instruments":[{"symbol":"<one of requested symbols>","displayName":"<matching display name>","bias":"Bullish|Bearish","confidence":65,"summary":"...","newsDriver":"...","technicalLevels":"...","macroBackdrop":"...","redditSentiment":"..."}]}

IMPORTANT: return exactly ${INSTRUMENTS.length} instruments, one for each requested symbol: ${INSTRUMENTS.map((i) => i.symbol).join(", ")}.`;

    // Try models in order
    let instruments: InstrumentAnalysis[] | null = null;
    let lastAiErrorCode: OpenRouterErrorCode | undefined;

    if (aiConfigured) {
        const modelsToTry = [
            primaryModel,
            ...FALLBACK_MODELS.filter((m) => m !== primaryModel),
        ];

        for (const modelToUse of modelsToTry) {
            console.log(`[instruments] Trying model: ${modelToUse}`);
            const aiResult = await callAI(
                apiKey as string,
                modelToUse,
                systemPrompt,
                userPrompt,
                baseUrl,
            );
            instruments = aiResult.instruments;
            if (aiResult.errorCode) lastAiErrorCode = aiResult.errorCode;
            if (instruments && instruments.length > 0) {
                console.log(`[instruments] Success with model: ${modelToUse}`);
                break;
            }
            console.log(`[instruments] ${modelToUse} failed, trying next...`);
        }
    } else {
        console.log("[instruments] OpenRouter not configured — using rule-based fallback");
    }

    // Fallback if all AI models fail
    if (!instruments || instruments.length === 0) {
        if (
            (lastAiErrorCode === "rate_limited" || lastAiErrorCode === "provider_unavailable") &&
            cache?.data
        ) {
            return NextResponse.json(
                { ...cache.data, cached: true, stale: true, error: lastAiErrorCode },
                { headers: CACHE_HEADERS },
            );
        }

        console.log("[instruments] All AI models failed, using rule-based fallback");
        instruments = buildFallback(
            macroContext,
            newsContext,
            techSnapshots as (TechnicalSnapshot | null)[],
            goldMarket,
        );
    }

    const responseData: InstrumentsResponse = instrumentsResponseSchema.parse({
        instruments,
        volatility,
        cached: false,
        stale: false,
        error: lastAiErrorCode,
        generatedAt: now.toISOString(),
    });

    // Store in cache
    cache = {
        key: cacheKey,
        fetchedAt: Date.now(),
        data: { ...responseData, cached: true },
    };

    return NextResponse.json(responseData, { headers: CACHE_HEADERS });
}
