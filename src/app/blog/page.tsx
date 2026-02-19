import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Forex Trading Guides & Currency Analysis Blog",
  description:
    "Expert forex trading guides, technical analysis tutorials, and currency market insights. Learn professional FX trading strategies for EUR/USD, GBP/USD, USD/JPY with institutional techniques.",
};

const ARTICLES = [
  {
    slug: "forex-technical-analysis-guide",
    title: "Complete Guide to Forex Technical Analysis: Support, Resistance & Trend Trading",
    excerpt:
      "Master forex technical analysis with support/resistance levels, trend identification, and 1H/4H timeframe strategies for EUR/USD, GBP/USD, and USD/JPY trading.",
    category: "Technical Analysis",
    readTime: "12 min read",
    date: "Feb 19, 2026",
    featured: true,
  },
  {
    slug: "understanding-forex-news-impact",
    title: "How to Trade Forex News: NFP, FOMC & CPI Impact on Currency Pairs",
    excerpt:
      "Learn how major economic releases (NFP, FOMC, CPI) impact forex markets. Discover pre-news positioning strategies and post-release trading techniques for major currency pairs.",
    category: "News Trading",
    readTime: "10 min read",
    date: "Feb 18, 2026",
    featured: true,
  },
  {
    slug: "forex-risk-management-strategies",
    title: "Forex Risk Management: Position Sizing & Stop Loss Strategies for FX Traders",
    excerpt:
      "Professional risk management techniques for forex trading. Learn position sizing, stop loss placement, and risk-reward ratios used by institutional FX traders.",
    category: "Risk Management",
    readTime: "8 min read",
    date: "Feb 17, 2026",
    featured: false,
  },
  {
    slug: "central-bank-policy-forex-trading",
    title: "Central Bank Policy & Forex Trading: Fed, ECB, BoE Rate Decisions Explained",
    excerpt:
      "Understand how Federal Reserve, ECB, and Bank of England policy decisions drive currency movements. Learn to trade interest rate differentials and monetary policy shifts.",
    category: "Macro Analysis",
    readTime: "11 min read",
    date: "Feb 16, 2026",
    featured: true,
  },
  {
    slug: "eurusd-trading-strategy",
    title: "EUR/USD Trading Strategy: Technical Levels & Macro Drivers for Euro Dollar",
    excerpt:
      "Complete EUR/USD trading guide covering key technical levels, ECB vs Fed policy divergence, and intraday trading strategies for the world's most liquid currency pair.",
    category: "Currency Pairs",
    readTime: "9 min read",
    date: "Feb 15, 2026",
    featured: false,
  },
];

export default function BlogPage() {
  const featuredArticles = ARTICLES.filter((a) => a.featured);
  const recentArticles = ARTICLES.filter((a) => !a.featured);

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-b from-emerald-500/[0.03] via-zinc-500/[0.01] to-transparent blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
            Learning Hub
          </p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-200 md:text-[42px]">
            Forex Trading Guides & Market Analysis
          </h1>
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-zinc-500">
            Expert insights on forex trading strategies, technical analysis, risk management, and currency market fundamentals.
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mb-16">
          <h2 className="mb-6 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
            Featured Guides
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/[0.03] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-300/80">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>

                  <h3 className="mb-3 text-[15px] font-semibold leading-snug text-zinc-200 transition-colors duration-300 group-hover:text-zinc-100">
                    {article.title}
                  </h3>

                  <p className="mb-4 text-[13px] leading-relaxed text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-700">{article.date}</span>
                    <div className="flex items-center gap-1 text-[12px] font-medium text-emerald-400/60 transition-all duration-300 group-hover:gap-2 group-hover:text-emerald-400/80">
                      Read guide
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Articles */}
        <div>
          <h2 className="mb-6 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
            Recent Articles
          </h2>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex flex-col gap-4 rounded-xl border border-white/[0.04] bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-400">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-zinc-700">{article.date}</span>
                  </div>
                  <h3 className="mb-2 text-[14px] font-semibold text-zinc-300 transition-colors duration-300 group-hover:text-zinc-200">
                    {article.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-zinc-600">
                    {article.excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center gap-1 text-[12px] font-medium text-emerald-400/60 transition-all duration-300 group-hover:gap-2 group-hover:text-emerald-400/80">
                    Read
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-8 text-center md:p-12">
          <TrendingUp className="mx-auto mb-4 h-8 w-8 text-emerald-400/60" />
          <h2 className="mb-3 text-xl font-bold text-zinc-200 md:text-2xl">
            Ready to Apply These Strategies?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-[14px] text-zinc-500">
            Access our AI-powered forex trading terminal with real-time analysis, technical indicators, and institutional-grade insights.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 px-6 py-3 text-[14px] font-semibold text-zinc-900 shadow-lg transition-all duration-300 hover:from-white hover:to-zinc-200"
          >
            Start Trading Analysis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
