import type { Metadata } from "next";
import { LotSizeCalculatorClient } from "./lot-size-calculator-client";

export const metadata: Metadata = {
    title: "Forex Lot Size Calculator — Free Position Sizing Tool",
    description:
        "Free forex lot size calculator for professional position sizing. Enter your account balance, risk percentage, stop loss in pips, and currency pair to instantly calculate standard, mini, and micro lots. Works for EUR/USD, GBP/USD, USD/JPY, XAU/USD.",
    keywords: [
        "forex lot size calculator",
        "position sizing calculator",
        "forex lot calculator",
        "pip value calculator",
        "forex risk management calculator",
        "standard lot calculator",
        "mini lot calculator",
        "micro lot calculator",
        "stop loss calculator",
        "forex position size",
    ],
    openGraph: {
        title: "Forex Lot Size Calculator — Free Position Sizing Tool | GetTradingBias",
        description:
            "Calculate the exact lot size for any forex trade in seconds. Free professional-grade position sizing tool for EUR/USD, GBP/USD, USD/JPY, XAU/USD.",
        type: "website",
        url: "https://gettradingbias.com/tools/lot-size-calculator",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Forex Lot Size Calculator | GetTradingBias",
        description:
            "Instantly calculate correct lot size for any forex trade. Enter account size, risk %, stop loss pips and get standard/mini/micro lots.",
    },
    alternates: {
        canonical: "https://gettradingbias.com/tools/lot-size-calculator",
    },
};

function StructuredData() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Forex Lot Size Calculator",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description:
            "Free professional forex lot size calculator. Calculates exact standard, mini, and micro lot sizes based on account balance, risk percentage, stop loss in pips, and currency pair pip values.",
        url: "https://gettradingbias.com/tools/lot-size-calculator",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
        },
        provider: {
            "@type": "Organization",
            name: "GetTradingBias",
            url: "https://gettradingbias.com",
        },
        featureList: [
            "Real pip value per pair (EUR/USD, GBP/USD, USD/JPY, XAU/USD)",
            "Standard, Mini, and Micro lot size output",
            "Risk amount in dollars",
            "Risk:Reward ratio calculator",
            "Multiple account currency support",
        ],
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://gettradingbias.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://gettradingbias.com/tools" },
            { "@type": "ListItem", position: 3, name: "Lot Size Calculator", item: "https://gettradingbias.com/tools/lot-size-calculator" },
        ],
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "How do I calculate forex lot size?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Lot Size = (Account Balance × Risk %) ÷ (Stop Loss in Pips × Pip Value per Standard Lot). For USD-quoted pairs like EUR/USD, pip value is $10 per standard lot. For JPY pairs like USD/JPY, pip value is approximately $9.09.",
                },
            },
            {
                "@type": "Question",
                name: "What is a standard lot in forex?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "A standard lot is 100,000 units of the base currency. For EUR/USD, 1 standard lot = €100,000. A mini lot is 10,000 units (0.10) and a micro lot is 1,000 units (0.01).",
                },
            },
            {
                "@type": "Question",
                name: "What percentage of account should I risk per trade?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Professional traders typically risk 0.5%–2% of their account per trade. Risking more than 2% significantly increases the chance of account drawdown and is generally not recommended for sustainable trading.",
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
    );
}

export default function LotSizeCalculatorPage() {
    return (
        <>
            <StructuredData />
            <LotSizeCalculatorClient />
        </>
    );
}
