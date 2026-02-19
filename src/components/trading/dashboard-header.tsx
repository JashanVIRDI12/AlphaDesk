"use client";

import * as React from "react";

import { useSession } from "next-auth/react";
import Link from "next/link";

import { TrendingUp } from "lucide-react";

import { AuthControls } from "@/components/auth/auth-controls";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardHeader() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase())
    .join("") || "HF";

  return (
    <header className="sticky top-0 z-30 relative border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] transition-all duration-300 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/[0.08]">
            <TrendingUp className="h-4 w-4 text-zinc-400 transition-colors duration-300 group-hover:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-[13px] font-semibold tracking-tight">GetTradingBias</div>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-zinc-300">
                BETA
              </span>
            </div>
            <div className="hidden text-[10px] font-medium tracking-wide text-zinc-500 sm:block">
              INSTITUTIONAL TERMINAL
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <AuthControls />

          <Avatar className="ml-1 h-9 w-9 ring-1 ring-white/10">
            <AvatarFallback className="bg-white/[0.04] text-[11px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
