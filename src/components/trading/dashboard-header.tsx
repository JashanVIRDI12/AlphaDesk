"use client";

import * as React from "react";

import { useSession } from "next-auth/react";
import Link from "next/link";

import { Bell, TrendingUp } from "lucide-react";

import { AuthControls } from "@/components/auth/auth-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/40 relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] ring-1 ring-white/10 shadow-[0_0_24px_rgba(255,255,255,0.06)]">
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_55%)]" />
            <TrendingUp className="relative h-4 w-4 text-zinc-200" />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight">AlphaDesk</div>
            <div className="hidden text-[10px] font-medium tracking-wide text-muted-foreground sm:block">
              INSTITUTIONAL TERMINAL
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full transition-colors hover:bg-white/[0.06]"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <AuthControls />

          <ThemeToggle />

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
