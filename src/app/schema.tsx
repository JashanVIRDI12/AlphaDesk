import Script from "next/script";

export function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GetTradingBias",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Professional forex trading terminal with AI-powered currency analysis, real-time FX news, technical indicators, and macro fundamentals for EUR/USD, GBP/USD, USD/JPY trading.",
    url: "https://gettradingbias.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    featureList: [
      "AI-powered forex currency analysis",
      "Real-time FX news feed",
      "1H and 4H technical indicators",
      "Live TradingView charts",
      "Economic calendar with high-impact events",
      "Macro fundamentals analysis",
      "EUR/USD, GBP/USD, USD/JPY, XAU/USD coverage",
      "Institutional-grade trading signals",
    ],
    screenshot: "https://gettradingbias.com/og-image.png",
    softwareVersion: "1.0",
    author: {
      "@type": "Organization",
      name: "GetTradingBias",
    },
    keywords:
      "forex trading platform, FX trading terminal, currency analysis, AI forex signals, real-time forex news, technical analysis forex, EUR/USD analysis, GBP/USD trading, USD/JPY signals",
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
