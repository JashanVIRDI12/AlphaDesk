import { NextResponse } from "next/server";

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
};

type InstrumentsResponse = {
    instruments: InstrumentAnalysis[];
    cached: boolean;
    generatedAt: string;
};

/* ── Cache (1-hour TTL — shorter since we include technicals) ── */
let cache:
    | {
        key: string;
        fetchedAt: number;
        data: InstrumentsResponse;
    }
    | undefined;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/* ── Instruments to analyse ── */
const INSTRUMENTS = [
    { symbol: "EURUSD", displayName: "Euro / Dollar", yahoo: "EURUSD=X" },
    { symbol: "GBPUSD", displayName: "Cable", yahoo: "GBPUSD=X" },
    { symbol: "USDJPY", displayName: "Dollar / Yen", yahoo: "USDJPY=X" },
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
};

async function fetchTechnicalData(
    yahooSymbol: string,
    fxSymbol: string,
): Promise<TechnicalSnapshot | null> {
    try {
        // Fetch 1H candles for last 5 days (gives us ~120 candles for 1H and derived 4H)
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1h&range=5d`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; AlphaDesk/1.0)",
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

        const closes = (quotes.close as (number | null)[]).map((v) => v ?? 0);
        const highs = (quotes.high as (number | null)[]).map((v) => v ?? 0);
        const lows = (quotes.low as (number | null)[]).map((v) => v ?? 0);

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
            const pip = s.symbol.includes("JPY") ? 100 : 10000;
            const fmt = (v: number) =>
                s.symbol.includes("JPY") ? v.toFixed(3) : v.toFixed(5);

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
): Promise<InstrumentAnalysis[] | null> {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": baseUrl,
                "X-Title": "AlphaDesk",
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
            return null;
        }

        const json = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
        console.log(`[instruments] ${model} raw (${raw.length} chars):`, raw.slice(0, 200));

        if (!raw) return null;

        // Strip code fences
        const cleaned = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```\s*$/i, "")
            .trim();

        // Parse — expect { instruments: [...] } or just [...]
        try {
            const parsed = JSON.parse(cleaned);
            const arr = Array.isArray(parsed) ? parsed : parsed.instruments;
            if (Array.isArray(arr) && arr.length > 0 && arr[0].symbol && arr[0].bias) {
                return arr.map((item: Record<string, unknown>) => ({
                    symbol: String(item.symbol),
                    displayName: String(item.displayName ?? item.display_name ?? item.symbol),
                    bias: String(item.bias) === "Bearish" ? "Bearish" : "Bullish",
                    confidence: Math.min(95, Math.max(30, Number(item.confidence) || 50)),
                    summary: String(item.summary ?? ""),
                    newsDriver: String(item.newsDriver ?? item.news_driver ?? ""),
                    technicalLevels: String(item.technicalLevels ?? item.technical_levels ?? ""),
                    macroBackdrop: String(item.macroBackdrop ?? item.macro_backdrop ?? ""),
                })) as InstrumentAnalysis[];
            }
        } catch {
            // Try extracting JSON
            const jsonMatch = cleaned.match(/\[[\s\S]*\]/) ?? cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    let parsed = JSON.parse(jsonMatch[0]);
                    if (!Array.isArray(parsed) && parsed.instruments) {
                        parsed = parsed.instruments;
                    }
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.map((item: Record<string, unknown>) => ({
                            symbol: String(item.symbol),
                            displayName: String(item.displayName ?? item.display_name ?? item.symbol),
                            bias: String(item.bias) === "Bearish" ? "Bearish" : "Bullish",
                            confidence: Math.min(95, Math.max(30, Number(item.confidence) || 50)),
                            summary: String(item.summary ?? ""),
                            newsDriver: String(item.newsDriver ?? item.news_driver ?? ""),
                            technicalLevels: String(item.technicalLevels ?? item.technical_levels ?? ""),
                            macroBackdrop: String(item.macroBackdrop ?? item.macro_backdrop ?? ""),
                        })) as InstrumentAnalysis[];
                    }
                } catch {
                    console.error(`[instruments] ${model} JSON parse failed`);
                }
            }
        }

        return null;
    } catch (err) {
        console.error(`[instruments] ${model} call failed:`, err);
        return null;
    }
}

/* ── Rule-based fallback ── */
function buildFallback(
    macroContext: string,
    newsContext: string,
    technicals: (TechnicalSnapshot | null)[],
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
        }

        const newsDriver = "AI analysis unavailable — using rule-based signals from headline sentiment.";
        const technicalLevels = tech
            ? `Price at ${inst.symbol.includes("JPY") ? tech.price.toFixed(3) : tech.price.toFixed(5)}. 4H trend: ${tech.h4_trend}. Support: ${inst.symbol.includes("JPY") ? tech.nearest_support.toFixed(3) : tech.nearest_support.toFixed(5)}, Resistance: ${inst.symbol.includes("JPY") ? tech.nearest_resistance.toFixed(3) : tech.nearest_resistance.toFixed(5)}.`
            : "Technical data unavailable.";
        const macroBackdrop = "Macro data available but AI model was unreachable for detailed analysis.";

        return {
            symbol: inst.symbol,
            displayName: inst.displayName,
            bias,
            confidence,
            summary,
            newsDriver,
            technicalLevels,
            macroBackdrop,
        };
    });
}

/* ── Models to try ── */
const FALLBACK_MODELS = [
    null, // uses env OPENROUTER_MODEL
    "google/gemini-2.0-flash-001",
    "meta-llama/llama-3.3-70b-instruct",
];

/* ── GET handler ── */
export async function GET(req: Request) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const primaryModel = process.env.OPENROUTER_MODEL;

    if (!apiKey || !primaryModel) {
        return NextResponse.json(
            { error: "OpenRouter not configured." },
            { status: 501 },
        );
    }

    // Cache key: date + 1-hour block
    const now = new Date();
    const cacheKey = `${now.toISOString().slice(0, 10)}-h${now.getHours()}`;

    if (cache && cache.key === cacheKey && Date.now() - cache.fetchedAt < CACHE_TTL) {
        return NextResponse.json(cache.data);
    }

    // Determine base URL
    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // ── Gather ALL three pillars in parallel ──
    const [newsContext, calendarContext, macroContext, ...techSnapshots] =
        await Promise.all([
            fetchNewsContext(baseUrl),
            fetchCalendarContext(baseUrl),
            fetchMacroContext(baseUrl),
            ...INSTRUMENTS.map((i) => fetchTechnicalData(i.yahoo, i.symbol)),
        ]);

    const technicalContext = formatTechnicalContext(
        techSnapshots as (TechnicalSnapshot | null)[],
    );

    const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/New_York",
        hour12: true,
    });

    // ── Three-pillar prompt ──
    const systemPrompt = `You are an elite FX trader at a top-tier prop desk, known for blending NEWS FLOW with TECHNICAL ANALYSIS and MACRO context.

Your analysis methodology (in order of priority):
1. NEWS FLOW (40% weight): What are the latest headlines saying? Which currencies are being mentioned? What's the sentiment? Breaking news > old news.
2. TECHNICALS (30% weight): What does 1H and 4H price action show? Trend direction, momentum, key support/resistance levels. Use the actual price data provided.
3. MACRO (30% weight): Central bank rates, CPI, GDP — these set the background but rarely change intraday bias.

RULES:
- Your summary MUST reference at least one specific headline or news event AND one technical level/trend.
- Never write a purely macro summary (e.g. "rates favor USD"). That's lazy analysis.
- Good example: "BOJ-Ueda meeting headlines driving yen volatility; 4H trending up from 153.20 support. Watch 154.00 resistance."
- Bad example: "Fed at 4.5% vs ECB 2.9% keeps EUR under pressure." (too macro-focused, no news or technicals)
- Confidence should reflect how aligned all three pillars are. If news says one thing but technicals say another, lower confidence.
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
ECONOMIC CALENDAR
═══════════════════════════════════
${calendarContext}

═══════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════
For each pair, provide:
- bias: "Bullish" or "Bearish" (for the pair — EURUSD Bullish = EUR strength)
- confidence: 30-95 (higher only when news + technicals + macro all agree)
- summary: 1 concise sentence referencing BOTH a news driver AND a technical level. Max 25 words.
- newsDriver: 1–2 sentences on the key news headlines driving this pair right now. Be specific — cite actual headlines.
- technicalLevels: 1–2 sentences on 1H/4H structure — trend, momentum, key support/resistance with prices. Use the data above.
- macroBackdrop: 1 sentence on rates/CPI/GDP framing. Keep it short.

Respond with ONLY this JSON:
{"instruments":[{"symbol":"EURUSD","displayName":"Euro / Dollar","bias":"...","confidence":65,"summary":"...","newsDriver":"...","technicalLevels":"...","macroBackdrop":"..."},{"symbol":"GBPUSD","displayName":"Cable","bias":"...","confidence":60,"summary":"...","newsDriver":"...","technicalLevels":"...","macroBackdrop":"..."},{"symbol":"USDJPY","displayName":"Dollar / Yen","bias":"...","confidence":70,"summary":"...","newsDriver":"...","technicalLevels":"...","macroBackdrop":"..."}]}`;

    // Try models in order
    let instruments: InstrumentAnalysis[] | null = null;

    for (const fallbackModel of FALLBACK_MODELS) {
        const modelToUse = fallbackModel ?? primaryModel;
        console.log(`[instruments] Trying model: ${modelToUse}`);
        instruments = await callAI(apiKey, modelToUse, systemPrompt, userPrompt, baseUrl);
        if (instruments && instruments.length > 0) {
            console.log(`[instruments] Success with model: ${modelToUse}`);
            break;
        }
        console.log(`[instruments] ${modelToUse} failed, trying next...`);
    }

    // Fallback if all AI models fail
    if (!instruments || instruments.length === 0) {
        console.log("[instruments] All AI models failed, using rule-based fallback");
        instruments = buildFallback(
            macroContext,
            newsContext,
            techSnapshots as (TechnicalSnapshot | null)[],
        );
    }

    const responseData: InstrumentsResponse = {
        instruments,
        cached: false,
        generatedAt: now.toISOString(),
    };

    // Store in cache
    cache = {
        key: cacheKey,
        fetchedAt: Date.now(),
        data: { ...responseData, cached: true },
    };

    return NextResponse.json(responseData);
}
