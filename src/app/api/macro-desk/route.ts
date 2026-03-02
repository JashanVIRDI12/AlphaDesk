import { NextResponse } from "next/server";
import { z } from "zod";

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
    communitySentiment: string;
    cached: boolean;
    generatedAt: string;
};

const aiMacroSchema = z
    .object({
        bias: z.string().optional(),
        riskSentiment: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        keyThemes: z.array(z.string()).optional(),
        notes: z.string().optional(),
        brief: z.string().optional(),
        communitySentiment: z.string().optional(),
    })
    .transform((v) => {
        const bulletSource = v.bullets ?? v.keyThemes ?? [];
        const bullets = bulletSource
            .map((b) => b?.trim())
            .filter((b): b is string => Boolean(b));

        return {
            bias: (v.bias ?? v.riskSentiment ?? "Neutral").trim(),
            bullets,
            notes: (v.notes ?? v.brief ?? "").trim(),
            communitySentiment: (v.communitySentiment ?? "").trim(),
        };
    });

const macroDeskResponseSchema = z.object({
    title: z.string(),
    bias: z.string(),
    bullets: z.array(z.string()),
    notes: z.string(),
    communitySentiment: z.string(),
    cached: z.boolean(),
    generatedAt: z.string(),
});

/* ── Cache (24-hour TTL, keyed by date) ── */
let cache:
    | {
        key: string;
        fetchedAt: number;
        data: MacroDeskResponse;
    }
    | undefined;

let inflight: Promise<MacroDeskResponse> | undefined;

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const CACHE_HEADERS = {
    "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=1800",
};

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

/* ── Reddit via RSS (works from Vercel datacenter IPs) ── */
const MD_PAIRS = [
    { pair: "EURUSD", term: "EURUSD" },
    { pair: "GBPUSD", term: "GBPUSD" },
    { pair: "XAUUSD", term: "XAUUSD" },
    { pair: "USDJPY", term: "USDJPY" },
];

function mdRssExtract(xml: string, tag: string): string {
    const cdataOpen = `<${tag}><![CDATA[`;
    const cdataClose = `]]></${tag}>`;
    let s = xml.indexOf(cdataOpen);
    if (s !== -1) { s += cdataOpen.length; const e = xml.indexOf(cdataClose, s); return e === -1 ? "" : xml.substring(s, e).trim(); }
    s = xml.indexOf(`<${tag}>`);
    if (s === -1) return "";
    s += `<${tag}>`.length;
    const e = xml.indexOf(`</${tag}>`, s);
    return e === -1 ? "" : xml.substring(s, e).replace(/<[^>]+>/g, "").trim();
}

function mdRssAgo(pubDate: string): string {
    const diff = Math.floor((Date.now() - new Date(pubDate).getTime()) / 60_000);
    return diff < 60 ? `${diff}m` : diff < 1440 ? `${Math.floor(diff / 60)}h` : `${Math.floor(diff / 1440)}d`;
}

async function mdFetchPairRSS(term: string, pair: string): Promise<{ pair: string; title: string; ago: string }[]> {
    try {
        const url = `https://www.reddit.com/r/Forex/search.rss?q=${encodeURIComponent(term)}&sort=new&restrict_sr=on&t=week`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; GetTradingBias/2.0; +https://gettradingbias.com)",
                "Accept": "application/rss+xml, application/xml, text/xml",
            },
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return [];
        const xml = await res.text();
        const items: { pair: string; title: string; ago: string }[] = [];
        const parts = xml.split("<entry>");
        for (let i = 1; i < parts.length && items.length < 5; i++) {
            const block = parts[i].split("</entry>")[0];
            const title = mdRssExtract(block, "title");
            const updated = mdRssExtract(block, "updated") || mdRssExtract(block, "published");
            if (!title || title.length < 5) continue;
            items.push({ pair, title: title.substring(0, 100), ago: updated ? mdRssAgo(updated) : "?" });
        }
        return items;
    } catch { return []; }
}

async function fetchRedditContext(_baseUrl: string): Promise<string> {
    try {
        const results = await Promise.all(MD_PAIRS.map(({ pair, term }) => mdFetchPairRSS(term, pair)));
        const allPosts = results.flat();
        if (allPosts.length === 0) return "Reddit data is temporarily unavailable.";

        const byPair: Record<string, typeof allPosts> = {};
        for (const p of allPosts) {
            if (!byPair[p.pair]) byPair[p.pair] = [];
            if (byPair[p.pair].length < 3) byPair[p.pair].push(p);
        }
        const sections: string[] = [];
        for (const [pair, posts] of Object.entries(byPair)) {
            sections.push(`${pair}:\n${posts.map((p) => `  · [${p.ago}] ${p.title}`).join("\n")}`);
        }
        return sections.join("\n\n");
    } catch {
        return "Could not fetch Reddit data.";
    }
}


/* ── AI call helper ── */
async function callAI(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userPrompt: string,
    baseUrl: string,
): Promise<{ bias: string; bullets: string[]; notes: string; communitySentiment: string } | null> {
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
            const validated = aiMacroSchema.safeParse(parsed);
            if (validated.success && validated.data.bullets.length > 0) {
                return validated.data;
            }
        } catch {
            // Try extracting JSON object
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    const validated = aiMacroSchema.safeParse(parsed);
                    if (validated.success && validated.data.bullets.length > 0) {
                        return validated.data;
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
        communitySentiment: "",
        cached: false,
        generatedAt: new Date().toISOString(),
    };
}

/* ── Models to try (in order) ── */
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
        return NextResponse.json(cache.data, { headers: CACHE_HEADERS });
    }

    if (inflight) {
        const data = await inflight;
        return NextResponse.json({ ...data, cached: true }, { headers: CACHE_HEADERS });
    }

    // Determine base URL
    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    inflight = (async () => {
        // Gather live context in parallel (news + calendar + macro indicators + reddit)
        const [newsContext, calendarContext, macroContext, redditContext] = await Promise.all([
            fetchNewsHeadlines(baseUrl),
            fetchCalendarEvents(baseUrl),
            fetchMacroIndicators(baseUrl),
            fetchRedditContext(baseUrl),
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

        const systemPrompt = `You are an elite FX macro strategist at a major hedge fund. You produce the morning macro desk brief that traders rely on before the day begins. You have access to live news headlines, the economic calendar, current macro indicators (central bank rates, CPI/inflation, GDP, unemployment), AND live community sentiment from r/Forex traders. Use these to support your analysis — reference specific rate differentials, inflation trends, growth divergences, and any notable community-observed positioning or market narratives. Be opinionated, specific, and concise. Think like a trader, not an academic. You MUST respond with valid JSON only.`;

        const userPrompt = `Generate today's AI Macro Desk brief.

CURRENT TIME: ${timeStr} ET, ${dayStr}
SESSION: ${sessionNote}

=== MACRO INDICATORS (Central Bank Rates, Inflation, GDP, Jobs) ===
${macroContext}

=== LIVE NEWS HEADLINES ===
${newsContext}

=== ECONOMIC CALENDAR ===
${calendarContext}

=== REDDIT r/Forex COMMUNITY SENTIMENT (Live trader discussions) ===
${redditContext}

=== INSTRUCTIONS ===
Use the macro indicators above to inform your analysis. Reference rate differentials (e.g. Fed vs BoJ), inflation divergences, and growth outlooks when explaining currency flows. Cross-reference headlines and calendar events with the underlying macro data. If Reddit community sentiment shows strong positioning or notable narratives, mention them briefly.

Respond with ONLY this JSON (no markdown, no code fences, no explanation):

{"bias":"<Risk-on | Risk-off | Neutral | Risk-on (tactical) | Risk-off (tactical)>","bullets":["<USD/rates/Fed — reference actual rate, CPI trend>","<EUR macro — reference ECB rate, eurozone inflation/growth>","<GBP macro — reference BoE rate, UK inflation/growth>","<JPY/BoJ — reference BoJ rate, carry trade dynamics>","<Key risk event + community sentiment/positioning — 1 sentence>"],"notes":"<1-2 sentence tactical takeaway referencing rate differentials or macro divergences>","communitySentiment":"<1 sentence synthesising the overall mood from r/Forex Reddit posts — dominant bias, notable pair mentions, crowd positioning. If no Reddit data was available say 'No community data.'>"}`;

        // Try models in order until one works
        let parsed: { bias: string; bullets: string[]; notes: string; communitySentiment: string } | null = null;

        const modelsToTry = [
            primaryModel,
            ...FALLBACK_MODELS.filter((m) => m !== primaryModel),
        ];

        for (const modelToUse of modelsToTry) {
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
            const fallback = macroDeskResponseSchema.parse(
                buildLocalFallback(newsContext, calendarContext, macroContext, sessionNote),
            );

            // Cache for 10 min only (so it retries sooner)
            cache = {
                key: cacheKey,
                fetchedAt: Date.now() - CACHE_TTL + 10 * 60 * 1000,
                data: { ...fallback, cached: true },
            };

            return fallback;
        }

        const responseData: MacroDeskResponse = macroDeskResponseSchema.parse({
            title: "AI Macro Desk",
            bias: parsed.bias,
            bullets: parsed.bullets.slice(0, 5),
            notes: parsed.notes || "",
            communitySentiment: parsed.communitySentiment || "",
            cached: false,
            generatedAt: now.toISOString(),
        });

        // Store in cache
        cache = {
            key: cacheKey,
            fetchedAt: Date.now(),
            data: { ...responseData, cached: true },
        };

        return responseData;
    })();

    try {
        const data = await inflight;
        return NextResponse.json(data, { headers: CACHE_HEADERS });
    } finally {
        inflight = undefined;
    }
}
