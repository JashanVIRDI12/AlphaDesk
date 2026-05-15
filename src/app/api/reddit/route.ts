import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  /api/reddit – Scrape r/forex for latest pair-specific posts        */
/*  Fallback: OpenRouter Perplexity web search when Reddit is blocked  */
/* ------------------------------------------------------------------ */

export type RedditPost = {
    id: string;
    title: string;
    url: string;
    permalink: string;
    author: string;
    score: number;
    numComments: number;
    selftext: string;
    pair: string;        // detected pair: EURUSD | GBPUSD | XAUUSD | USDJPY | GENERAL
    flair: string;
    publishedAt: string; // ISO
    ago: string;
    thumbnail: string | null;
};

/* ── Pairs to search ── */
const PAIR_QUERIES: { pair: string; terms: string[] }[] = [
    { pair: "EURUSD", terms: ["EURUSD", "EUR/USD", "euro dollar"] },
    { pair: "GBPUSD", terms: ["GBPUSD", "GBP/USD", "cable", "pound dollar"] },
    { pair: "XAUUSD", terms: ["XAUUSD", "XAU/USD", "gold usd", "gold price"] },
    { pair: "USDJPY", terms: ["USDJPY", "USD/JPY", "dollar yen"] },
];

/* ── All forex general feed ── */
const FOREX_NEW_URL = "https://www.reddit.com/r/Forex/new.json?limit=25&t=day";

/* ── Cache: 5 minutes ── */
let cache: { fetchedAt: number; posts: RedditPost[]; aiSearched: boolean } | undefined;
let inflight: Promise<{ posts: RedditPost[]; aiSearched: boolean }> | undefined;
const CACHE_TTL = 5 * 60 * 1000;

const REDDIT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
};

/* ── Helpers ── */
function timeAgo(isoStr: string): string {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}

function detectPair(title: string, selftext: string): string {
    const haystack = (title + " " + selftext).toUpperCase();
    for (const { pair, terms } of PAIR_QUERIES) {
        for (const term of terms) {
            if (haystack.includes(term.toUpperCase())) return pair;
        }
    }
    return "GENERAL";
}

function mapPost(child: any, forcePair?: string): RedditPost {
    const d = child.data;
    const publishedAt = new Date(d.created_utc * 1000).toISOString();
    const pair = forcePair ?? detectPair(d.title ?? "", d.selftext ?? "");
    const thumb = d.thumbnail && d.thumbnail.startsWith("http") ? d.thumbnail : null;
    return {
        id: d.id,
        title: d.title ?? "",
        url: d.url ?? `https://www.reddit.com${d.permalink}`,
        permalink: `https://www.reddit.com${d.permalink}`,
        author: d.author ?? "anonymous",
        score: d.score ?? 0,
        numComments: d.num_comments ?? 0,
        selftext: (d.selftext ?? "").substring(0, 280),
        pair,
        flair: d.link_flair_text ?? "",
        publishedAt,
        ago: timeAgo(publishedAt),
        thumbnail: thumb,
    };
}

/* Try multiple Reddit base domains in order */
async function fetchRedditJSON(url: string): Promise<any[]> {
    const variants = [
        url,
        url.replace("www.reddit.com", "old.reddit.com"),
        url.replace("www.reddit.com", "api.reddit.com"),
    ];

    for (const tryUrl of variants) {
        try {
            const res = await fetch(tryUrl, {
                headers: REDDIT_HEADERS,
                signal: AbortSignal.timeout(8000),
                next: { revalidate: 0 },
            });
            if (res.ok) {
                const json = await res.json();
                const children = json?.data?.children ?? [];
                if (children.length > 0) {
                    console.log(`[reddit] ✓ ${tryUrl} → ${children.length} children`);
                    return children;
                }
            } else {
                console.log(`[reddit] ✗ ${tryUrl} → HTTP ${res.status}`);
            }
        } catch (err) {
            console.log(`[reddit] ✗ ${tryUrl} → ${err instanceof Error ? err.message : "error"}`);
        }
    }
    return [];
}

/* ── OpenRouter Perplexity fallback: search Reddit when direct scraping fails ── */
async function fetchViaOpenRouterSearch(): Promise<RedditPost[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return [];

    console.log("[reddit] Trying OpenRouter Perplexity search fallback...");

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://gettradingbias.com",
                "X-Title": "GetTradingBias",
            },
            body: JSON.stringify({
                model: "perplexity/sonar",
                messages: [
                    {
                        role: "user",
                        content: `Search reddit.com/r/Forex for the most recent posts from the last 7 days about EURUSD, GBPUSD, USDJPY, and XAUUSD forex trading. Return ONLY a valid JSON array with up to 15 real posts you find. No markdown, no code fences, no explanation — just the raw JSON array.

Each element must have exactly these fields:
{
  "id": "short unique string (e.g. abc123)",
  "title": "actual post title",
  "url": "full reddit.com URL",
  "permalink": "full reddit.com URL",
  "author": "reddit username",
  "score": 5,
  "numComments": 3,
  "selftext": "brief excerpt or empty string",
  "pair": "EURUSD or GBPUSD or USDJPY or XAUUSD or GENERAL",
  "flair": "post flair or empty string",
  "publishedAt": "2025-05-15T10:00:00.000Z",
  "ago": "2h",
  "thumbnail": null
}`,
                    },
                ],
                max_tokens: 3000,
                temperature: 0.1,
            }),
            signal: AbortSignal.timeout(25000),
        });

        if (!res.ok) {
            console.log(`[reddit] OpenRouter search HTTP ${res.status}`);
            return [];
        }

        const json = await res.json();
        const content = (json.choices?.[0]?.message?.content ?? "").trim();

        const cleaned = content
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```\s*$/i, "")
            .trim();

        const match = cleaned.match(/\[[\s\S]*\]/);
        if (!match) {
            console.log("[reddit] OpenRouter: no JSON array found in response");
            return [];
        }

        const raw = JSON.parse(match[0]) as any[];
        const posts: RedditPost[] = raw
            .filter((p) => p && typeof p.title === "string" && p.title.length > 5)
            .map(
                (p, idx): RedditPost => ({
                    id: String(p.id || `ai-${idx}`),
                    title: String(p.title || "").substring(0, 300),
                    url: String(p.url || p.permalink || "https://www.reddit.com/r/Forex"),
                    permalink: String(p.permalink || p.url || "https://www.reddit.com/r/Forex"),
                    author: String(p.author || "redditor"),
                    score: Math.max(0, Number(p.score) || 0),
                    numComments: Math.max(0, Number(p.numComments) || 0),
                    selftext: String(p.selftext || "").substring(0, 280),
                    pair: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "GENERAL"].includes(String(p.pair))
                        ? String(p.pair)
                        : detectPair(String(p.title), String(p.selftext || "")),
                    flair: String(p.flair || ""),
                    publishedAt: String(p.publishedAt || new Date().toISOString()),
                    ago: String(p.ago || "?"),
                    thumbnail: null,
                }),
            );

        console.log(`[reddit] OpenRouter search returned ${posts.length} posts`);
        return posts;
    } catch (err) {
        console.error("[reddit] OpenRouter search failed:", err);
        return [];
    }
}

async function fetchAllPosts(): Promise<{ posts: RedditPost[]; aiSearched: boolean }> {
    // 1. Fetch /r/Forex/new
    const generalFetch = fetchRedditJSON(FOREX_NEW_URL);

    // 2. Per-pair search on r/Forex
    const pairFetches = PAIR_QUERIES.map(async ({ pair, terms }) => {
        const q = encodeURIComponent(terms[0]);
        const url = `https://www.reddit.com/r/Forex/search.json?q=${q}&sort=new&restrict_sr=1&limit=15&t=week`;
        const children = await fetchRedditJSON(url);
        return children.map((c) => mapPost(c, pair));
    });

    const [generalChildren, ...pairResults] = await Promise.all([
        generalFetch,
        ...pairFetches,
    ]);

    const generalPosts = generalChildren.map((c: any) => mapPost(c));
    const pairPosts = pairResults.flat();

    // Merge & deduplicate by post id
    const seen = new Set<string>();
    const merged: RedditPost[] = [];

    for (const p of pairPosts) {
        if (!seen.has(p.id) && p.title) {
            seen.add(p.id);
            merged.push(p);
        }
    }
    for (const p of generalPosts) {
        if (!seen.has(p.id) && p.title) {
            seen.add(p.id);
            merged.push(p);
        }
    }

    // If direct Reddit scraping returned posts, return them
    if (merged.length > 0) {
        merged.sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        return { posts: merged.slice(0, 80), aiSearched: false };
    }

    // Reddit is blocked — fall back to OpenRouter Perplexity search
    console.log("[reddit] Direct Reddit returned 0 posts — using OpenRouter Perplexity fallback");
    const aiPosts = await fetchViaOpenRouterSearch();
    if (aiPosts.length > 0) {
        aiPosts.sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        return { posts: aiPosts.slice(0, 80), aiSearched: true };
    }

    return { posts: [], aiSearched: false };
}

/* ── GET handler ── */
export async function GET() {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
        const posts = cache.posts.map((p) => ({ ...p, ago: timeAgo(p.publishedAt) }));
        return NextResponse.json(
            { posts, cached: true, count: posts.length, aiSearched: cache.aiSearched },
            { headers: { "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=600" } },
        );
    }

    if (inflight) {
        const { posts, aiSearched } = await inflight;
        return NextResponse.json({ posts, cached: true, count: posts.length, aiSearched });
    }

    inflight = fetchAllPosts();

    try {
        const { posts, aiSearched } = await inflight;
        cache = { fetchedAt: Date.now(), posts, aiSearched };
        return NextResponse.json(
            { posts, cached: false, count: posts.length, aiSearched },
            { headers: { "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=600" } },
        );
    } finally {
        inflight = undefined;
    }
}
