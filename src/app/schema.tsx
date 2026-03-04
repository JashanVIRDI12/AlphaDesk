/**
 * schema.tsx — Root Structured Data for GetTradingBias
 *
 * Injects JSON-LD directly into the <head> using Next.js Script.
 * Placed in the root layout (via HomePage) to signal site-wide entity
 * information to Google's Knowledge Graph crawlers.
 *
 * Schema types used:
 *  - SoftwareApplication  → signals this is a FinTech web app
 *  - Organization         → entity disambiguator for Knowledge Graph
 *  - WebSite              → enables Sitelinks search box eligibility
 */

import Script from "next/script";

export function StructuredData() {
  // Primary: SoftwareApplication schema for the trading terminal
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GetTradingBias",
    applicationCategory: "FinanceApplication",
    applicationSubCategory: "Forex Trading Analysis Platform",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    description:
      "Professional AI-powered forex trading terminal providing real-time bias analysis, technical indicators, news drivers, and macro fundamentals for major currency pairs: EUR/USD, GBP/USD, USD/JPY, XAU/USD.",
    url: "https://gettradingbias.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "AI-powered forex currency bias analysis",
      "Real-time FX news feed with relevance scoring",
      "1H and 4H technical indicator analysis",
      "Live TradingView embedded charts",
      "Economic calendar with high-impact event tracking",
      "Macro fundamentals — interest rates, CPI, GDP, unemployment",
      "Reddit sentiment analysis via r/Forex",
      "EUR/USD, GBP/USD, USD/JPY, XAU/USD coverage",
      "Mobile-responsive institutional-grade interface",
    ],
    screenshot: "https://gettradingbias.com/og-image.png",
    softwareVersion: "1.0",
    author: {
      "@type": "Organization",
      name: "GetTradingBias",
      url: "https://gettradingbias.com",
    },
    keywords:
      "forex trading platform, FX trading terminal, currency analysis, AI forex signals, real-time forex news, technical analysis, EUR/USD analysis, GBP/USD trading, USD/JPY signals, gold analysis",
  };

  // Organization schema for entity disambiguation
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GetTradingBias",
    url: "https://gettradingbias.com",
    logo: {
      "@type": "ImageObject",
      url: "https://gettradingbias.com/favicon.png",
      width: 32,
      height: 32,
    },
    description:
      "GetTradingBias provides AI-powered forex market analysis, trading bias signals, and institutional-grade insights for retail forex traders.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      availableLanguage: "English",
    },
  };

  // WebSite schema to enable Google Sitelinks search eligibility
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GetTradingBias",
    url: "https://gettradingbias.com",
    description:
      "AI-powered forex trading terminal with real-time currency bias analysis for EUR/USD, GBP/USD, USD/JPY, and XAU/USD.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://gettradingbias.com/dashboard/instruments/{search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };

  return (
    <>
      <Script
        id="structured-data-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <Script
        id="structured-data-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="structured-data-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
