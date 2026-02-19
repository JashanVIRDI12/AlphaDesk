import * as React from "react";

import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Section</div>
      <div className="text-sm font-semibold tracking-tight text-zinc-100">{title}</div>
      {description ? (
        <div className="text-xs text-zinc-400">{description}</div>
      ) : null}
    </div>
  );
}
