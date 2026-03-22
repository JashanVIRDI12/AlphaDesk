import type { Metadata } from "next";
import { GeopoliticalRiskClient } from "./geopolitical-risk-client";

export const metadata: Metadata = {
    title: "Geopolitical Risk Index Tracker — Global News & Alerts",
    description: "Track geopolitical risk over time using global news and events. View the historical Geopolitical Risk Index chart from 1900.",
    openGraph: {
        title: "Geopolitical Risk Index Tracker | GetTradingBias",
        description: "Interactive chart showcasing historical geopolitical risks based on news and global events.",
        type: "website",
        url: "https://gettradingbias.com/tools/geopolitical-risk",
    },
    alternates: {
        canonical: "https://gettradingbias.com/tools/geopolitical-risk",
    },
};

export default function GeopoliticalRiskPage() {
    return <GeopoliticalRiskClient />;
}
