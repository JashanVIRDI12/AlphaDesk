"use client";

/**
 * advanced-chart.tsx
 *
 * This module is intentionally isolated so it can be loaded with:
 *   next/dynamic({ ssr: false })
 *
 * Reasons for dynamic/no-SSR:
 *  1. TradingView's embed-widget script manipulates the DOM directly via
 *     document.createElement — this causes React hydration mismatches.
 *  2. The external script (~200 kB) should not block the main thread during
 *     initial SSR, allowing the page shell and AI analysis panels to paint first.
 *  3. Chart content is not meaningful to crawlers, so there's zero SEO cost.
 */

import * as React from "react";

interface AdvancedChartProps {
    symbol: string;
    widgetSymbol: string;
    bullish: boolean;
}

export function AdvancedChart({ widgetSymbol }: AdvancedChartProps) {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!ref.current) return;
        const container = ref.current;
        container.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.async = true;
        script.type = "text/javascript";
        script.textContent = JSON.stringify({
            symbol: widgetSymbol,
            interval: "H1",
            timezone: "Asia/Kolkata",
            theme: "dark",
            style: "1",
            locale: "en",
            backgroundColor: "rgba(13,13,15,0)",
            gridColor: "rgba(255,255,255,0.04)",
            allow_symbol_change: false,
            calendar: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            withdateranges: true,
            width: "100%",
            height: "100%",
        });

        const wrapper = document.createElement("div");
        wrapper.className = "tradingview-widget-container__widget";
        wrapper.style.height = "100%";
        container.appendChild(wrapper);
        container.appendChild(script);

        return () => { container.innerHTML = ""; };
    }, [widgetSymbol]);

    return (
        <div
            ref={ref}
            className="tradingview-widget-container h-full w-full overflow-hidden rounded-2xl"
        />
    );
}
