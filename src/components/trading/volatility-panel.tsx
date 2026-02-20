"use client";

import { useInstruments } from "@/hooks/use-dashboard-data";
import { VolatilityLineChart } from "@/components/trading/volatility-line-chart";

export function VolatilityPanel() {
  const { data } = useInstruments();
  return <VolatilityLineChart volatility={data?.volatility} />;
}
