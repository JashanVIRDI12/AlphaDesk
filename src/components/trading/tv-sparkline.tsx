"use client";

import * as React from "react";
import {
  ColorType,
  type LineData,
  LineSeries,
  type IChartApi,
  createChart,
} from "lightweight-charts";

import { cn } from "@/lib/utils";

export type SparklinePoint = {
  time: number;
  value: number;
};

export function TvSparkline({
  data,
  tone,
  height = 72,
  className,
}: {
  data: SparklinePoint[];
  tone: "up" | "down";
  height?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<{
    setData: (data: LineData[]) => void;
  } | null>(null);

  const lineData = React.useMemo<LineData[]>(
    () => data.map((p) => ({ time: p.time as never, value: p.value })),
    [data],
  );

  React.useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const chart = createChart(el, {
      height,
      width: el.clientWidth,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(228, 228, 231, 0.65)",
        fontSize: 11,
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: false,
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        vertLine: { visible: false, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    const color = tone === "up" ? "rgba(52, 211, 153, 0.95)" : "rgba(248, 113, 113, 0.95)";

    const series = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    series.setData(lineData);

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series as unknown as {
      setData: (data: LineData[]) => void;
    };

    const ro = new ResizeObserver(() => {
      if (!ref.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: ref.current.clientWidth });
      chartRef.current.timeScale().fitContent();
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, lineData, tone]);

  React.useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(lineData);
    chartRef.current?.timeScale().fitContent();
  }, [lineData]);

  return <div ref={ref} className={cn("w-full", className)} />;
}
