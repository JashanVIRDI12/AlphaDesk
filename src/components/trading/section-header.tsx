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
    <div className={cn("space-y-1", className)}>
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      {description ? (
        <div className="text-xs text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}
