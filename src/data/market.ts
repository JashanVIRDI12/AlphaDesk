import market from "@/data/mock/market.json";

export type MarketSessionStatus = "Open" | "Pre-market" | "Closed";

export type MarketSession = {
  name: "Asia" | "London" | "New York";
  status: MarketSessionStatus;
  localTime: string;
};

export type InstrumentBias = "Bullish" | "Bearish";

export type InstrumentSeriesPoint = {
  time: number;
  value: number;
};

export type Instrument = {
  symbol: string;
  displayName: string;
  price: number;
  changePct: number;
  bias: InstrumentBias;
  confidence: number;
  summary: string;
  series: InstrumentSeriesPoint[];
};

export type HighImpactEvent = {
  time: string;
  title: string;
  impact: "High" | "Medium" | "Low";
  consensus: string;
  previous: string;
};

export type MarketData = {
  greeting: {
    title: string;
    subtitle: string;
  };
  sessions: MarketSession[];
  instruments: Instrument[];
  macroDesk: {
    title: string;
    bias: string;
    bullets: string[];
    notes: string;
  };
  fundamentals: {
    riskMode: "Risk-on" | "Risk-off";
    events: HighImpactEvent[];
  };
};

export function getAggregateMarketStatus(
  sessions: MarketSession[],
): MarketSessionStatus {
  if (sessions.some((s) => s.status === "Open")) return "Open";
  if (sessions.some((s) => s.status === "Pre-market")) return "Pre-market";
  return "Closed";
}

export function getMockMarketData(): MarketData {
  // TODO: Replace mock JSON with real API response (prices, AI macro notes, fundamentals calendar).
  return market as MarketData;
}
