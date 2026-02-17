import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  /api/news – lightweight forex / macro headlines via RSS            */
/* ------------------------------------------------------------------ */

type Headline = {
    title: string;
    source: string;
    url: string;
    publishedAt: string;   // ISO string
    ago: string;           // e.g. "12m", "3h"
};

/* ── RSS feed sources (targeted per currency + geopolitics) ── */
const FEEDS = [
    // USD / Federal Reserve / Dollar
    {
        url: "https://news.google.com/rss/search?q=US+dollar+OR+federal+reserve+OR+DXY+OR+treasury+yields+OR+US+inflation+OR+US+CPI+OR+nonfarm+payrolls&hl=en-US&gl=US&ceid=US:en&when=2d",
        source: "USD",
    },
    // EUR / ECB / Eurozone
    {
        url: "https://news.google.com/rss/search?q=euro+currency+OR+ECB+OR+eurozone+economy+OR+EURUSD+OR+european+central+bank+OR+EU+inflation&hl=en-US&gl=US&ceid=US:en&when=2d",
        source: "EUR",
    },
    // GBP / Bank of England / UK
    {
        url: "https://news.google.com/rss/search?q=british+pound+OR+bank+of+england+OR+GBPUSD+OR+UK+economy+OR+UK+inflation+OR+UK+interest+rate&hl=en-US&gl=US&ceid=US:en&when=2d",
        source: "GBP",
    },
    // JPY / Bank of Japan
    {
        url: "https://news.google.com/rss/search?q=japanese+yen+OR+bank+of+japan+OR+USDJPY+OR+BOJ+OR+Japan+economy+OR+Japan+inflation&hl=en-US&gl=US&ceid=US:en&when=2d",
        source: "JPY",
    },
    // Geopolitics / Risk events
    {
        url: "https://news.google.com/rss/search?q=geopolitics+economy+OR+trade+war+OR+sanctions+OR+oil+price+geopolitics+OR+China+US+trade+OR+Middle+East+oil&hl=en-US&gl=US&ceid=US:en&when=2d",
        source: "GEO",
    },
    // Forex market broad
    {
        url: "https://news.google.com/rss/search?q=forex+market+today+OR+currency+markets+OR+central+bank+rate+decision+OR+interest+rate+decision&hl=en-US&gl=US&ceid=US:en&when=2d",
        source: "FX",
    },
];

/* ── Cache ── */
let cache: { fetchedAt: number; headlines: Headline[] } | undefined;
let inflight: Promise<Headline[]> | undefined;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const CACHE_HEADERS = {
    "Cache-Control": "private, max-age=0, s-maxage=120, stale-while-revalidate=600",
};

/* ── Helpers ── */
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
}

function extractTextBetween(xml: string, tag: string): string {
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    // Handle CDATA
    const cdataOpen = `<${tag}><![CDATA[`;
    const cdataClose = `]]></${tag}>`;

    let start = xml.indexOf(cdataOpen);
    if (start !== -1) {
        start += cdataOpen.length;
        const end = xml.indexOf(cdataClose, start);
        return end === -1 ? "" : xml.substring(start, end).trim();
    }

    start = xml.indexOf(open);
    if (start === -1) return "";
    start += open.length;
    const end = xml.indexOf(close, start);
    return end === -1 ? "" : xml.substring(start, end).replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function cleanTitle(title: string): string {
    // Remove HTML entities
    return title
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s*-\s*[^-]+$/, ""); // Remove trailing " - Source Name"
}

async function fetchFeed(feedUrl: string, feedSource: string): Promise<Headline[]> {
    try {
        const res = await fetch(feedUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; GetTradingBias/1.0)",
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return [];

        const xml = await res.text();
        const items: Headline[] = [];

        // Split by <item> tags
        const parts = xml.split("<item>");
        for (let i = 1; i < parts.length && items.length < 15; i++) {
            const block = parts[i];
            const endIdx = block.indexOf("</item>");
            const item = endIdx === -1 ? block : block.substring(0, endIdx);

            const rawTitle = extractTextBetween(item, "title");
            const link = extractTextBetween(item, "link");
            const pubDate = extractTextBetween(item, "pubDate");
            const source = extractTextBetween(item, "source") || feedSource;

            if (!rawTitle || !pubDate) continue;

            const title = cleanTitle(rawTitle);
            if (title.length < 10) continue;

            items.push({
                title,
                source,
                url: link,
                publishedAt: new Date(pubDate).toISOString(),
                ago: timeAgo(new Date(pubDate).toISOString()),
            });
        }

        return items;
    } catch {
        return [];
    }
}

/* ── GET handler ── */
export async function GET() {
    // Return cache if fresh
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
        return NextResponse.json(
            {
            headlines: cache.headlines,
            cached: true,
            count: cache.headlines.length,
            },
            { headers: CACHE_HEADERS },
        );
    }

    if (inflight) {
        const headlines = await inflight;
        return NextResponse.json(
            {
                headlines,
                cached: true,
                count: headlines.length,
            },
            { headers: CACHE_HEADERS },
        );
    }

    // Fetch all feeds in parallel
    inflight = (async () => {
        const results = await Promise.all(
            FEEDS.map((f) => fetchFeed(f.url, f.source)),
        );

        // Merge, deduplicate by title similarity, sort by date
        const allHeadlines = results.flat();
        const seen = new Set<string>();
        const unique: Headline[] = [];

    for (const h of allHeadlines) {
        // Simple dedup: first 40 chars lowercase
        const key = h.title.substring(0, 40).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(h);
    }

    // Sort newest first
    unique.sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

        // Keep top 8
        const headlines = unique.slice(0, 12);

    // Refresh ago values
    for (const h of headlines) {
        h.ago = timeAgo(h.publishedAt);
    }

        cache = { fetchedAt: Date.now(), headlines };
        return headlines;
    })();

    try {
        const headlines = await inflight;

        return NextResponse.json(
            {
                headlines,
                cached: false,
                count: headlines.length,
            },
            { headers: CACHE_HEADERS },
        );
    } finally {
        inflight = undefined;
    }
}
