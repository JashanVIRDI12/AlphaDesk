import * as React from "react";

import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[radial-gradient(1000px_520px_at_50%_-20%,rgba(255,255,255,0.06),transparent_62%),radial-gradient(900px_420px_at_8%_12%,rgba(99,102,241,0.08),transparent_58%),radial-gradient(820px_420px_at_92%_18%,rgba(16,185,129,0.06),transparent_60%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
