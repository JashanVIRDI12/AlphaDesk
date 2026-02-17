import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  /api/macro-desk – AI-powered macro desk analysis via OpenRouter    */
/*  Gathers: live news headlines + economic calendar + market sessions */
/*  Produces: structured macro brief with bias, bullets, and notes    */
/* ------------------------------------------------------------------ */

type MacroDeskResponse = {
    title: string;
    bias: string;
    bullets: string[];
    notes: string;
    cached: boolean;
    generatedAt: string;
};

/* ── Cache (24-hour TTL, keyed by date) ── */
let cache:
    | {
        key: string;
        fetchedAt: number;
        data: MacroDeskResponse;
    }
    | undefined;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/* ── Gather live context from internal APIs ── */

async function fetchNewsHeadlines(baseUrl: string): Promise<string> {
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
            .slice(0, 10)
            .map((h) => `- [${h.source}] ${h.title} (${h.ago})`)
            .join("\n");
    } catch {
        return "Could not fetch news.";
    }
}

async function fetchCalendarEvents(baseUrl: string): Promise<string> {
    try {
        const res = await fetch(`${baseUrl}/api/calendar`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return "No calendar data available.";
        const data = await res.json();

        const parts: string[] = [];

        // Events
        const events = (data.events ?? []) as Array<{
            title: string;
            time: string;
            impact: string;
            currency?: string;
            consensus?: string;
            previous?: string;
        }>;
        if (events.length > 0) {
            parts.push(
                "Scheduled economic events today:\n" +
                events
                    .slice(0, 15)
                    .map(
                        (e) =>
                            `- ${e.time} [${e.currency ?? ""}] ${e.title} (impact: ${e.impact}${e.consensus ? `, cons: ${e.consensus}` : ""}${e.previous ? `, prev: ${e.previous}` : ""})`,
                    )
                    .join("\n"),
            );
        } else {
            parts.push("No high-impact economic events scheduled today.");
        }

        // Holidays
        const holidays = (data.holidays ?? []) as Array<{
            title: string;
        }>;
        if (holidays.length > 0) {
            parts.push(
                "Bank holidays: " + holidays.map((h) => h.title).join(", "),
            );
        }

        return parts.join("\n\n");
    } catch {
        return "Could not fetch calendar data.";
    }
}

async function fetchMacroIndicators(baseUrl: string): Promise<string> {
    try {
        const res = await fetch(`${baseUrl}/api/macro-data`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return "No macro indicator data available.";
        const data = await res.json();

        const currencies = ["USD", "EUR", "GBP", "JPY"] as const;
        const lines: string[] = [];

        for (const ccy of currencies) {
            const d = data[ccy];
            if (!d) continue;
            lines.push(
                `${ccy}: Rate=${d.rate}, CPI/Inflation=${d.cpi}, GDP Growth=${d.gdp}, Unemployment=${d.unemployment}`,
            );
        }

        if (lines.length === 0) return "No macro indicator data available.";
        return lines.join("\n");
    } catch {
        return "Could not fetch macro indicators.";
    }
}

/* ── AI call helper ── */
async function callAI(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    baseUrl: string,
): Promise<{ bias: string; bullets: string[]; notes: string } | null> {
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
                temperature: 0.3,
                max_tokens: 600,
            }),
            signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[macro-desk] ${model} error:`, res.status, errText.slice(0, 300));
            return null;
        }

        const json = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
        console.log(`[macro-desk] ${model} raw response (${raw.length} chars):`, raw.slice(0, 200));

        if (!raw) return null;

        // Strip code fences
        const cleaned = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```\s*$/i, "")
            .trim();

        // Try direct parse
        try {
            const parsed = JSON.parse(cleaned);
            if (parsed.bias && Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
                return parsed;
            }
        } catch {
            // Try extracting JSON object
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.bias && Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
                        return parsed;
                    }
                } catch {
                    console.error(`[macro-desk] ${model} JSON parse failed:`, jsonMatch[0].slice(0, 300));
                }
            }
        }

        return null;
    } catch (err) {
        console.error(`[macro-desk] ${model} call failed:`, err);
        return null;
    }
}

/* ── Local fallback when AI is unavailable ── */
function buildLocalFallback(
    newsContext: string,
    calendarContext: string,
    macroContext: string,
    sessionNote: string,
): MacroDeskResponse {
    const bullets: string[] = [];

    // Extract macro indicator summary
    if (macroContext && !macroContext.includes("Could not") && !macroContext.includes("No macro")) {
        const usdLine = macroContext.split("\n").find((l) => l.startsWith("USD:"));
        if (usdLine) {
            bullets.push(`Macro snapshot — ${usdLine}`);
        }
    }

    // Extract some news info
    const newsLines = newsContext.split("\n").filter((l) => l.startsWith("- "));
    if (newsLines.length > 0) {
        bullets.push(newsLines[0].replace(/^- \[.*?\]\s*/, "").replace(/\s*\(.*?\)$/, ""));
    }
    if (newsLines.length > 1) {
        bullets.push(newsLines[1].replace(/^- \[.*?\]\s*/, "").replace(/\s*\(.*?\)$/, ""));
    }

    // Add calendar context
    if (calendarContext.includes("Bank holidays")) {
        const holMatch = calendarContext.match(/Bank holidays: (.+)/);
        if (holMatch) {
            bullets.push(`Bank holidays today: ${holMatch[1]} — expect reduced liquidity.`);
        }
    }

    if (calendarContext.includes("No high-impact")) {
        bullets.push("No high-impact events scheduled — range-bound conditions likely.");
    }

    bullets.push(sessionNote);

    return {
        title: "AI Macro Desk",
        bias: "Neutral",
        bullets: bullets.slice(0, 5),
        notes: "AI analysis temporarily unavailable. Showing summary from live feeds.",
        cached: false,
        generatedAt: new Date().toISOString(),
    };
}

/* ── Models to try (in order) ── */
const FALLBACK_MODELS = [
    null, // uses env OPENROUTER_MODEL
    "google/gemini-3-flash-preview",
    "google/gemini-2.0-flash-001",
    "meta-llama/llama-3.3-70b-instruct",
];

/* ── GET handler ── */
export async function GET(req: Request) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const primaryModel =
        process.env.OPENROUTER_MODEL || "google/gemini-3-flash-preview";

    if (!apiKey) {
        return NextResponse.json(
            {
                error:
                    "OpenRouter not configured. Set OPENROUTER_API_KEY in .env.",
            },
            { status: 501 },
        );
    }

    // Date-based cache key
    const today = new Date().toISOString().slice(0, 10);
    const hour = new Date().getHours();
    const cacheKey = `${today}-${hour}`;

    if (cache && cache.key === cacheKey && Date.now() - cache.fetchedAt < CACHE_TTL) {
        return NextResponse.json(cache.data);
    }

    // Determine base URL
    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Gather live context in parallel (news + calendar + macro indicators)
    const [newsContext, calendarContext, macroContext] = await Promise.all([
        fetchNewsHeadlines(baseUrl),
        fetchCalendarEvents(baseUrl),
        fetchMacroIndicators(baseUrl),
    ]);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/New_York",
        hour12: true,
    });
    const dayStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/New_York",
    });

    // Determine session context
    const nyHour = parseInt(
        now.toLocaleString("en-US", {
            hour: "numeric",
            hour12: false,
            timeZone: "America/New_York",
        }),
    );
    let sessionNote = "";
    if (nyHour >= 0 && nyHour < 8) sessionNote = "Asian session is active. London pre-open.";
    else if (nyHour >= 8 && nyHour < 12) sessionNote = "London session is active. NY open upcoming.";
    else if (nyHour >= 12 && nyHour < 17) sessionNote = "NY session overlap with London. Peak liquidity.";
    else if (nyHour >= 17 && nyHour < 21) sessionNote = "NY afternoon. London closed. Liquidity thinning.";
    else sessionNote = "Asian session open. Thin liquidity period.";

    const systemPrompt = `You are an elite FX macro strategist at a major hedge fund. You produce the morning macro desk brief that traders rely on before the day begins. You have access to live news headlines, the economic calendar, AND current macro indicators (central bank rates, CPI/inflation, GDP, unemployment) for major currencies. Use these numbers to support your analysis — reference specific rate differentials, inflation trends, and growth divergences. Be opinionated, specific, and concise. Think like a trader, not an academic. You MUST respond with valid JSON only.`;

    const userPrompt = `Generate today's AI Macro Desk brief.

CURRENT TIME: ${timeStr} ET, ${dayStr}
SESSION: ${sessionNote}

=== MACRO INDICATORS (Central Bank Rates, Inflation, GDP, Jobs) ===
${macroContext}

=== LIVE NEWS HEADLINES ===
${newsContext}

=== ECONOMIC CALENDAR ===
${calendarContext}

=== INSTRUCTIONS ===
Use the macro indicators above to inform your analysis. Reference rate differentials (e.g. Fed vs BoJ), inflation divergences, and growth outlooks when explaining currency flows. Cross-reference headlines and calendar events with the underlying macro data.

Respond with ONLY this JSON (no markdown, no code fences, no explanation):

{"bias":"<Risk-on | Risk-off | Neutral | Risk-on (tactical) | Risk-off (tactical)>","bullets":["<USD/rates/Fed — reference actual rate, CPI trend>","<EUR macro — reference ECB rate, eurozone inflation/growth>","<GBP macro — reference BoE rate, UK inflation/growth>","<JPY/BoJ — reference BoJ rate, carry trade dynamics>","<Key risk event + liquidity/positioning — 1 sentence>"],"notes":"<1-2 sentence tactical takeaway referencing rate differentials or macro divergences>"}`;

    // Try models in order until one works
    let parsed: { bias: string; bullets: string[]; notes: string } | null = null;

    for (const fallbackModel of FALLBACK_MODELS) {
        const modelToUse = fallbackModel ?? primaryModel;
        console.log(`[macro-desk] Trying model: ${modelToUse}`);
        parsed = await callAI(apiKey, modelToUse, systemPrompt, userPrompt, baseUrl);
        if (parsed) {
            console.log(`[macro-desk] Success with model: ${modelToUse}`);
            break;
        }
        console.log(`[macro-desk] ${modelToUse} failed, trying next...`);
    }

    // If all AI models failed, use local fallback
    if (!parsed) {
        console.log("[macro-desk] All AI models failed, using local fallback");
        const fallback = buildLocalFallback(newsContext, calendarContext, macroContext, sessionNote);

        // Cache for 10 min only (so it retries sooner)
        cache = {
            key: cacheKey,
            fetchedAt: Date.now() - CACHE_TTL + 10 * 60 * 1000,
            data: { ...fallback, cached: true },
        };

        return NextResponse.json(fallback);
    }

    const responseData: MacroDeskResponse = {
        title: "AI Macro Desk",
        bias: parsed.bias,
        bullets: parsed.bullets.slice(0, 5),
        notes: parsed.notes || "",
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
