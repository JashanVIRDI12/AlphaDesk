"use client";

import * as React from "react";

import { useSession } from "next-auth/react";
import Link from "next/link";

import { TrendingUp, LogOut } from "lucide-react";

import { AuthControls } from "@/components/auth/auth-controls";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TopStatusStrip } from "@/components/trading/top-status-strip";
import type { MarketSession } from "@/data/market";

export function DashboardHeader({ sessions }: { sessions: MarketSession[] }) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase())
    .join("") || "HF";

  return (
    <header className="sticky top-0 z-30 relative border-b border-white/10 bg-[#0c0c0e] backdrop-blur-2xl">
      <div className="relative mx-auto w-full max-w-[1800px] 2xl:max-w-[2400px] flex flex-wrap items-center justify-between gap-y-3 gap-x-2 px-4 py-3 md:px-6 lg:flex-nowrap">

        {/* Left: Branding */}
        <Link href="/" className="group flex items-center gap-2 sm:gap-3 w-max">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] transition-all duration-300 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/[0.08]">
            <TrendingUp className="h-4 w-4 text-zinc-400 transition-colors duration-300 group-hover:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-semibold tracking-tight">AlphaDesk</div>
              <span className="rounded bg-white/[0.03] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.18em] text-zinc-400">
                PRO
              </span>
            </div>
            <div className="hidden text-[9px] font-medium tracking-wide text-zinc-600 sm:block">
              INSTITUTIONAL TERMINAL
            </div>
          </div>
        </Link>

        {/* Middle: Integrated Status Strip */}
        <div className="flex-1 flex w-full justify-center order-last pt-3 pb-1 border-t border-white/[0.06] lg:order-none lg:w-auto lg:py-0 lg:border-none">
          <TopStatusStrip sessions={sessions} />
        </div>

        {/* Right: Exit + Auth + Avatar */}
        <div className="flex items-center justify-end gap-2 w-max">

          {/* Exit Dashboard */}
          <Link
            href="/"
            className="group hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[10px] font-semibold tracking-wide text-zinc-500 transition-all duration-200 hover:border-rose-500/20 hover:bg-rose-500/[0.06] hover:text-rose-400"
          >
            <LogOut className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Exit
          </Link>

          <AuthControls />

          <Avatar className="ml-0.5 h-8 w-8 ring-1 ring-white/10">
            <AvatarFallback className="bg-white/[0.04] text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
