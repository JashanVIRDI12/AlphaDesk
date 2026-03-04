import * as React from "react";
import type { Metadata } from "next";
import { InstrumentPageClient } from "./instrument-page-client";

/* ── Static metadata constants ── */
const PAIR_DISPLAY: Record<string, { name: string; desc: string; keywords: string[] }> = {
    EURUSD: {
        name: "Euro / US Dollar",
        desc: "The world's most traded currency pair",
        keywords: ["EUR/USD analysis", "euro dollar forecast", "eurusd trading bias", "eurusd technical analysis"],
    },
    GBPUSD: {
        name: "British Pound / Dollar",
        desc: "The original major — Cable",
        keywords: ["GBP/USD analysis", "pound dollar forecast", "gbpusd trading bias", "cable forex"],
    },
    USDJPY: {
        name: "Dollar / Japanese Yen",
        desc: "The premier carry-trade pair",
        keywords: ["USD/JPY analysis", "dollar yen forecast", "usdjpy trading bias", "yen carry trade"],
    },
    XAUUSD: {
        name: "Gold / US Dollar",
        desc: "Ultimate safe-haven & macro barometer",
        keywords: ["XAU/USD analysis", "gold forecast", "gold trading bias", "gold price prediction"],
    },
};

const SUPPORTED_SYMBOLS = Object.keys(PAIR_DISPLAY);

/* ── generateStaticParams for static generation ── */
export function generateStaticParams() {
    return SUPPORTED_SYMBOLS.map((symbol) => ({ symbol: symbol.toLowerCase() }));
}

/* ── Dynamic Metadata per symbol ── */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol.toUpperCase();
    const meta = PAIR_DISPLAY[symbol];

    if (!meta) {
        return {
            title: `${symbol} Analysis | GetTradingBias`,
            description: `AI-powered trading bias, technical analysis, and macro insights for ${symbol} on GetTradingBias.`,
        };
    }

    const title = `${symbol} AI Trading Bias & Analysis — ${meta.name}`;
    const description = `Get the latest ${symbol} (${meta.name}) AI trading bias, technical levels, macro backdrop, and real-time news drivers. ${meta.desc}. Updated every 15 minutes with institutional-grade forex insights.`;

    return {
        title,
        description,
        keywords: [
            ...meta.keywords,
            "forex trading bias",
            "AI forex analysis",
            "technical levels",
            "macro backdrop",
            "GetTradingBias",
        ],
        openGraph: {
            title: `${symbol} — AI Forex Bias & Analysis | GetTradingBias`,
            description,
            type: "article",
            url: `https://gettradingbias.com/dashboard/instruments/${symbol.toLowerCase()}`,
            siteName: "GetTradingBias",
            images: [
                {
                    url: `https://gettradingbias.com/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: `${symbol} AI Trading Bias Analysis`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${symbol} — AI Forex Bias | GetTradingBias`,
            description: `Live AI trading bias and analysis for ${symbol} (${meta.name}). ${meta.desc}.`,
            images: [`https://gettradingbias.com/og-image.png`],
        },
        alternates: {
            canonical: `https://gettradingbias.com/dashboard/instruments/${symbol.toLowerCase()}`,
        },
    };
}

/* ── JSON-LD Structured Data for this instrument page ── */
function InstrumentStructuredData({ symbol }: { symbol: string }) {
    const meta = PAIR_DISPLAY[symbol];
    if (!meta) return null;

    // FinancialProduct schema for the currency pair
    const financialProductSchema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        name: `${symbol} (${meta.name})`,
        description: `AI-powered trading bias and technical analysis for ${symbol}. ${meta.desc}. Get real-time forex insights including news drivers, technical levels, and macro backdrop.`,
        url: `https://gettradingbias.com/dashboard/instruments/${symbol.toLowerCase()}`,
        provider: {
            "@type": "Organization",
            name: "GetTradingBias",
            url: "https://gettradingbias.com",
        },
        feesAndCommissionsSpecification: "Free to use",
        category: "Forex Currency Pair Analysis",
    };

    // BreadcrumbList for navigation signals
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://gettradingbias.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Dashboard",
                item: "https://gettradingbias.com/dashboard",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: `${symbol} Analysis`,
                item: `https://gettradingbias.com/dashboard/instruments/${symbol.toLowerCase()}`,
            },
        ],
    };

    // AnalysisNewsArticle schema to help Google identify this as market analysis
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "AnalysisNewsArticle",
        headline: `${symbol} AI Trading Bias & Technical Analysis — ${meta.name}`,
        description: `Live AI-generated trading bias for ${symbol} (${meta.name}). Includes news drivers, technical levels, macro backdrop, and Reddit sentiment. ${meta.desc}.`,
        url: `https://gettradingbias.com/dashboard/instruments/${symbol.toLowerCase()}`,
        image: "https://gettradingbias.com/og-image.png",
        author: {
            "@type": "Organization",
            name: "GetTradingBias",
            url: "https://gettradingbias.com",
        },
        publisher: {
            "@type": "Organization",
            name: "GetTradingBias",
            logo: {
                "@type": "ImageObject",
                url: "https://gettradingbias.com/favicon.png",
            },
        },
        about: {
            "@type": "Thing",
            name: `${symbol} — ${meta.name}`,
            description: meta.desc,
        },
        keywords: meta.keywords.join(", "),
        inLanguage: "en-US",
        isAccessibleForFree: true,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
        </>
    );
}

/* ── Server component shell — injects structured data, renders client page ── */
export default async function InstrumentPage({
    params,
}: {
    params: Promise<{ symbol: string }>;
}) {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol.toUpperCase();

    return (
        <>
            <InstrumentStructuredData symbol={symbol} />
            <InstrumentPageClient symbol={symbol} />
        </>
    );
}
