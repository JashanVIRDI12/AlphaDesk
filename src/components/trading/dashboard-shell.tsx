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
        "min-h-screen bg-[#06060a] bg-[radial-gradient(1200px_620px_at_50%_-15%,rgba(129,140,248,0.14),transparent_62%),radial-gradient(900px_420px_at_0%_8%,rgba(139,92,246,0.10),transparent_60%),radial-gradient(900px_500px_at_100%_12%,rgba(99,102,241,0.10),transparent_58%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
