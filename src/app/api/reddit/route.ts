import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  /api/reddit – Scrape r/forex for latest pair-specific posts        */
/*  Uses Reddit's public JSON API (no OAuth needed)                    */
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
let cache: { fetchedAt: number; posts: RedditPost[] } | undefined;
let inflight: Promise<RedditPost[]> | undefined;
const CACHE_TTL = 5 * 60 * 1000;

const REDDIT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (web; GetTradingBias/1.0 contact: admin@gettradingbias.com)",
    "Accept": "application/json",
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

async function fetchRedditJSON(url: string): Promise<any[]> {
    try {
        const res = await fetch(url, {
            headers: REDDIT_HEADERS,
            signal: AbortSignal.timeout(8000),
            next: { revalidate: 0 },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json?.data?.children ?? [];
    } catch {
        return [];
    }
}

async function fetchAllPosts(): Promise<RedditPost[]> {
    // 1. Fetch /r/Forex/new
    const generalFetch = fetchRedditJSON(FOREX_NEW_URL);

    // 2. Per-pair search on r/Forex
    const pairFetches = PAIR_QUERIES.map(({ pair, terms }) => {
        const q = encodeURIComponent(terms[0]);
        const url = `https://www.reddit.com/r/Forex/search.json?q=${q}&sort=new&restrict_sr=1&limit=15&t=week`;
        return fetchRedditJSON(url).then((children) =>
            children.map((c) => mapPost(c, pair))
        );
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

    // Pair posts first (they have correct pair label)
    for (const p of pairPosts) {
        if (!seen.has(p.id) && p.title) {
            seen.add(p.id);
            merged.push(p);
        }
    }
    // General posts (may add pair label via detect)
    for (const p of generalPosts) {
        if (!seen.has(p.id) && p.title) {
            seen.add(p.id);
            merged.push(p);
        }
    }

    // Sort newest first, limit to 80
    merged.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return merged.slice(0, 80);
}

/* ── GET handler ── */
export async function GET() {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
        // Refresh ago values
        const posts = cache.posts.map((p) => ({ ...p, ago: timeAgo(p.publishedAt) }));
        return NextResponse.json({ posts, cached: true, count: posts.length }, {
            headers: { "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=600" },
        });
    }

    if (inflight) {
        const posts = await inflight;
        return NextResponse.json({ posts, cached: true, count: posts.length });
    }

    inflight = fetchAllPosts();

    try {
        const posts = await inflight;
        cache = { fetchedAt: Date.now(), posts };
        return NextResponse.json({ posts, cached: false, count: posts.length }, {
            headers: { "Cache-Control": "private, max-age=0, s-maxage=300, stale-while-revalidate=600" },
        });
    } finally {
        inflight = undefined;
    }
}
