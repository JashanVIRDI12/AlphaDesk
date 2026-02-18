"use client";

import * as React from "react";
import {
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  LineSeries,
  createChart,
} from "lightweight-charts";

import type { VolatilityPayload } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type VolatilityLineChartProps = {
  volatility?: VolatilityPayload;
  className?: string;
};

const SERIES_COLORS: Record<string, string> = {
  EURUSD: "#34d399",
  GBPUSD: "#60a5fa",
  USDJPY: "#f59e0b",
  XAUUSD: "#f97316",
};

export function VolatilityLineChart({ volatility, className }: VolatilityLineChartProps) {
  const chartElRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<Array<{ symbol: string; series: ISeriesApi<"Line"> }>>([]);

  const instruments = React.useMemo(() => {
    return (volatility?.instruments ?? []).filter((inst) => inst.points.length > 0);
  }, [volatility]);

  React.useEffect(() => {
    if (!chartElRef.current || instruments.length === 0) return;

    const element = chartElRef.current;
    const chart = createChart(element, {
      width: element.clientWidth,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(228,228,231,0.72)",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(161,161,170,0.08)" },
        horzLines: { color: "rgba(161,161,170,0.08)" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.12 },
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      crosshair: {
        vertLine: {
          color: "rgba(212,212,216,0.2)",
          labelBackgroundColor: "rgba(39,39,42,0.95)",
        },
        horzLine: {
          color: "rgba(212,212,216,0.2)",
          labelBackgroundColor: "rgba(39,39,42,0.95)",
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    const created = instruments.map((inst) => {
      const lineSeries = chart.addSeries(LineSeries, {
        color: SERIES_COLORS[inst.symbol] ?? "#a78bfa",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const lineData: LineData[] = inst.points.map((p) => ({
        time: p.time as never,
        value: p.value,
      }));
      lineSeries.setData(lineData);
      return { symbol: inst.symbol, series: lineSeries };
    });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = created;

    const observer = new ResizeObserver(() => {
      if (!chartElRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: chartElRef.current.clientWidth });
      chartRef.current.timeScale().fitContent();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = [];
    };
  }, [instruments]);

  React.useEffect(() => {
    if (!chartRef.current || seriesRef.current.length === 0) return;

    for (const { symbol, series } of seriesRef.current) {
      const inst = instruments.find((entry) => entry.symbol === symbol);
      if (!inst) continue;
      const lineData: LineData[] = inst.points.map((p) => ({
        time: p.time as never,
        value: p.value,
      }));
      series.setData(lineData);
    }

    chartRef.current.timeScale().fitContent();
  }, [instruments]);

  if (instruments.length === 0) return null;

  return (
    <Card className={cn("border-white/[0.08] bg-zinc-950/45", className)}>
      <CardHeader className="gap-1 pb-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Volatility
        </div>
        <div className="text-sm font-semibold text-zinc-100">ATR% Line Chart (4 pairs)</div>
        <div className="text-[11px] text-zinc-500">
          {volatility?.timeframe ?? "1H"} · ATR {volatility?.period ?? 14} · Higher line = more volatile
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25 p-2">
          <div ref={chartElRef} className="h-[280px] w-full" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {instruments.map((inst) => (
            <div
              key={inst.symbol}
              className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: SERIES_COLORS[inst.symbol] ?? "#a78bfa" }}
                />
                <span className="text-[10px] font-medium tracking-wide text-zinc-300">
                  {inst.symbol}
                </span>
              </div>
              <div className="mt-1 text-[11px] font-semibold text-zinc-100">
                {inst.currentAtrPct.toFixed(3)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
