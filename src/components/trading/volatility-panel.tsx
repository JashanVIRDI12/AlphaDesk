"use client";

import { useInstruments } from "@/hooks/use-dashboard-data";
import { VolatilityLineChart } from "@/components/trading/volatility-line-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function VolatilitySkeleton() {
  return (
    <Card className="border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="sk h-2 w-16 rounded" />
            <div className="sk h-4 w-48 rounded" />
          </div>
          <div className="sk h-7 w-20 rounded-md" />
        </div>
        <div className="sk h-2.5 w-40 rounded mt-1" />
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Chart area */}
        <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25 p-2">
          <div className="relative h-[280px] w-full overflow-hidden rounded">
            <div className="sk absolute inset-0 rounded-lg" />
            {/* Fake chart lines */}
            <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 280" preserveAspectRatio="none">
              <polyline points="0,200 40,180 80,160 120,140 160,120 200,100 240,120 280,90 320,110 360,80 400,95" fill="none" stroke="#34d399" strokeWidth="2" />
              <polyline points="0,160 40,150 80,170 120,155 160,165 200,145 240,155 280,140 320,150 360,135 400,145" fill="none" stroke="#60a5fa" strokeWidth="2" />
              <polyline points="0,220 40,210 80,215 120,205 160,210 200,195 240,205 280,190 320,200 360,185 400,195" fill="none" stroke="#f59e0b" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[["#34d399", "EURUSD"], ["#60a5fa", "GBPUSD"], ["#f59e0b", "USDJPY"]].map(([color, label]) => (
            <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-2.5 py-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <div className="sk h-2.5 w-14 rounded" />
              </div>
              <div className="sk h-3.5 w-10 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function VolatilityPanel() {
  const { data, isLoading } = useInstruments();

  if (isLoading) return <VolatilitySkeleton />;

  return <VolatilityLineChart volatility={data?.volatility} />;
}
