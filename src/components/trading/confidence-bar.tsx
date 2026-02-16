import * as React from "react";

import { cn } from "@/lib/utils";

export function ConfidenceBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const segments = 12;
  const active = Math.round((clamped / 100) * segments);

  const tone =
    clamped >= 70 ? "strong" : clamped >= 55 ? "medium" : "weak";

  const toneClasses =
    tone === "strong"
      ? "from-emerald-400/70 to-emerald-300/40"
      : tone === "medium"
        ? "from-amber-400/70 to-amber-300/40"
        : "from-rose-400/70 to-rose-300/40";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">
          CONF
        </div>
        <div className="text-[11px] font-medium tabular-nums text-zinc-100">
          {clamped}%
        </div>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: segments }).map((_, idx) => {
          const on = idx < active;
          return (
            <div
              key={idx}
              className={cn(
                "h-2 flex-1 rounded-[3px] border border-white/10",
                on
                  ? `bg-gradient-to-b ${toneClasses} shadow-[0_0_0_1px_rgba(255,255,255,0.04)]`
                  : "bg-white/[0.03]",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
