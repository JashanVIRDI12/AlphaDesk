import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  /api/macro-data – Key macro indicators for major currencies       */
/*  Returns: Interest Rate, CPI, GDP, Unemployment for USD/EUR/GBP/JPY */
/* ------------------------------------------------------------------ */

type MacroIndicator = {
    rate: string;
    cpi: string;
    gdp: string;
    unemployment: string;
    lastUpdated: string;
};

type MacroDataResponse = {
    USD: MacroIndicator;
    EUR: MacroIndicator;
    GBP: MacroIndicator;
    JPY: MacroIndicator;
    cached: boolean;
    fetchedAt: string;
};

/* ── Cache (6-hour TTL – macro data changes infrequently) ── */
let cache:
    | {
        fetchedAt: number;
        data: MacroDataResponse;
    }
    | undefined;

let inflight: Promise<MacroDataResponse> | undefined;

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const CACHE_HEADERS = {
    "Cache-Control": "private, max-age=0, s-maxage=3600, stale-while-revalidate=21600",
};

/* ── Scrape Trading Economics public summary pages ── */
async function fetchTradingEconomicsData(): Promise<
    Record<string, Partial<MacroIndicator>>
> {
    const result: Record<string, Partial<MacroIndicator>> = {
        USD: {},
        EUR: {},
        GBP: {},
        JPY: {},
    };

    // Fetch country-specific pages from Trading Economics
    const countryMap: Record<string, { url: string; currency: string }[]> = {
        USD: [
            {
                url: "https://api.tradingeconomics.com/country/united%20states?c=guest:guest&f=json",
                currency: "USD",
            },
        ],
        EUR: [
            {
                url: "https://api.tradingeconomics.com/country/euro%20area?c=guest:guest&f=json",
                currency: "EUR",
            },
        ],
        GBP: [
            {
                url: "https://api.tradingeconomics.com/country/united%20kingdom?c=guest:guest&f=json",
                currency: "GBP",
            },
        ],
        JPY: [
            {
                url: "https://api.tradingeconomics.com/country/japan?c=guest:guest&f=json",
                currency: "JPY",
            },
        ],
    };

    const fetches = Object.entries(countryMap).map(
        async ([currency, sources]) => {
            for (const source of sources) {
                try {
                    const res = await fetch(source.url, {
                        signal: AbortSignal.timeout(10000),
                        headers: {
                            "User-Agent": "hybridtrader/1.0",
                            Accept: "application/json",
                        },
                    });

                    if (!res.ok) continue;

                    const data = (await res.json()) as Array<{
                        Category: string;
                        LatestValue: number;
                        CategoryGroup?: string;
                        Unit?: string;
                    }>;

                    if (!Array.isArray(data)) continue;

                    for (const item of data) {
                        const cat = item.Category?.toLowerCase() ?? "";

                        if (cat.includes("interest rate") && !cat.includes("deposit")) {
                            result[currency].rate = `${item.LatestValue}%`;
                        } else if (
                            cat.includes("inflation rate") &&
                            !cat.includes("mom")
                        ) {
                            result[currency].cpi = `${item.LatestValue}%`;
                        } else if (
                            cat === "gdp growth rate" ||
                            cat === "gdp annual growth rate"
                        ) {
                            if (!result[currency].gdp) {
                                result[currency].gdp = `${item.LatestValue}%`;
                            }
                        } else if (cat.includes("unemployment rate")) {
                            result[currency].unemployment = `${item.LatestValue}%`;
                        }
                    }
                } catch (err) {
                    console.error(
                        `[macro-data] Failed to fetch ${currency} data:`,
                        err,
                    );
                }
            }
        },
    );

    await Promise.all(fetches);
    return result;
}

/* ── Fallback static data (always available as baseline) ── */
function getStaticFallbackData(): MacroDataResponse {
    return {
        USD: {
            rate: "4.50%",
            cpi: "2.9%",
            gdp: "2.3%",
            unemployment: "4.0%",
            lastUpdated: "Jan 2025",
        },
        EUR: {
            rate: "2.90%",
            cpi: "2.4%",
            gdp: "0.9%",
            unemployment: "6.3%",
            lastUpdated: "Jan 2025",
        },
        GBP: {
            rate: "4.50%",
            cpi: "3.0%",
            gdp: "1.4%",
            unemployment: "4.4%",
            lastUpdated: "Jan 2025",
        },
        JPY: {
            rate: "0.50%",
            cpi: "3.6%",
            gdp: "1.2%",
            unemployment: "2.4%",
            lastUpdated: "Jan 2025",
        },
        cached: false,
        fetchedAt: new Date().toISOString(),
    };
}

export async function GET() {
    const now = Date.now();

    // Return cached data if fresh
    if (cache && now - cache.fetchedAt < CACHE_TTL) {
        return NextResponse.json({ ...cache.data, cached: true }, { headers: CACHE_HEADERS });
    }

    if (inflight) {
        const data = await inflight;
        return NextResponse.json({ ...data, cached: true }, { headers: CACHE_HEADERS });
    }

    inflight = (async () => {
        try {
            const liveData = await fetchTradingEconomicsData();

        // Merge live data with static fallback for any missing fields
        const fallback = getStaticFallbackData();
        const nowStr = new Date().toISOString();

        const responseData: MacroDataResponse = {
            USD: {
                rate: liveData.USD?.rate ?? fallback.USD.rate,
                cpi: liveData.USD?.cpi ?? fallback.USD.cpi,
                gdp: liveData.USD?.gdp ?? fallback.USD.gdp,
                unemployment:
                    liveData.USD?.unemployment ?? fallback.USD.unemployment,
                lastUpdated: liveData.USD?.rate ? "Live" : fallback.USD.lastUpdated,
            },
            EUR: {
                rate: liveData.EUR?.rate ?? fallback.EUR.rate,
                cpi: liveData.EUR?.cpi ?? fallback.EUR.cpi,
                gdp: liveData.EUR?.gdp ?? fallback.EUR.gdp,
                unemployment:
                    liveData.EUR?.unemployment ?? fallback.EUR.unemployment,
                lastUpdated: liveData.EUR?.rate ? "Live" : fallback.EUR.lastUpdated,
            },
            GBP: {
                rate: liveData.GBP?.rate ?? fallback.GBP.rate,
                cpi: liveData.GBP?.cpi ?? fallback.GBP.cpi,
                gdp: liveData.GBP?.gdp ?? fallback.GBP.gdp,
                unemployment:
                    liveData.GBP?.unemployment ?? fallback.GBP.unemployment,
                lastUpdated: liveData.GBP?.rate ? "Live" : fallback.GBP.lastUpdated,
            },
            JPY: {
                rate: liveData.JPY?.rate ?? fallback.JPY.rate,
                cpi: liveData.JPY?.cpi ?? fallback.JPY.cpi,
                gdp: liveData.JPY?.gdp ?? fallback.JPY.gdp,
                unemployment:
                    liveData.JPY?.unemployment ?? fallback.JPY.unemployment,
                lastUpdated: liveData.JPY?.rate ? "Live" : fallback.JPY.lastUpdated,
            },
            cached: false,
            fetchedAt: nowStr,
        };

            // Cache the result
            cache = {
                fetchedAt: now,
                data: responseData,
            };

            return responseData;
        } catch (err) {
            console.error("[macro-data] Failed to fetch live data:", err);
            return getStaticFallbackData();
        }
    })();

    try {
        const data = await inflight;
        return NextResponse.json(data, { headers: CACHE_HEADERS });
    } finally {
        inflight = undefined;
    }
}
