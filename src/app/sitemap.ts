import type { MetadataRoute } from "next";

const BASE_URL = "https://gettradingbias.com";

const INSTRUMENTS = ["eurusd", "gbpusd", "usdjpy", "xauusd"];
const BLOG_SLUGS = ["forex-technical-analysis-guide", "understanding-forex-news-impact"];

export default function sitemap(): MetadataRoute.Sitemap {
    // Instrument analysis pages — high priority, updated frequently as AI regenerates
    const instrumentPages: MetadataRoute.Sitemap = INSTRUMENTS.map((symbol) => ({
        url: `${BASE_URL}/dashboard/instruments/${symbol}`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.9,
    }));

    // Blog/content pages — medium priority
    const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    return [
        // Home — highest priority
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        // Dashboard index
        {
            url: `${BASE_URL}/dashboard`,
            lastModified: new Date(),
            changeFrequency: "hourly",
            priority: 0.95,
        },
        // Instrument analysis pages
        ...instrumentPages,
        // Tools hub — high value for organic SEO
        {
            url: `${BASE_URL}/tools`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/tools/lot-size-calculator`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/tools/trade-journal`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        // Blog/educational content
        {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        ...blogPages,
        // Updates / changelog
        {
            url: `${BASE_URL}/updates`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
        // Legal pages
        {
            url: `${BASE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/disclaimer`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];
}
