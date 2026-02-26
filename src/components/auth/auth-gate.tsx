"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { TrendingUp, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const locked = status !== "authenticated";
  const [signInOpen, setSignInOpen] = React.useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      {/* Full-screen lock wall */}
      <div className="fixed inset-0 z-40 flex flex-col bg-[#08080f]">
        {/* Ambient gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
          <div className="absolute -bottom-20 right-0 h-[400px] w-[500px] rounded-full bg-purple-600/[0.05] blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,#08080f)]" />
        </div>

        {/* Top bar */}
        <div className="relative flex items-center justify-between border-b border-white/[0.05] px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] transition-colors group-hover:border-indigo-500/30 group-hover:bg-indigo-500/[0.08]">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-indigo-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-200">GetTradingBias</span>
          </Link>
          <Link href="/" className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-300">
            ← Back to home
          </Link>
        </div>

        {/* Main content */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_0_40px_rgba(99,102,241,0.1)]">
            <Lock className="h-7 w-7 text-zinc-300" />
          </div>

          <div className="text-center">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Restricted Access
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Terminal Access Required
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-zinc-500">
              Sign in with your Google account to access the trading terminal.
            </p>
          </div>

          <div className="mt-8 w-full max-w-xs">
            <Button
              onClick={() => setSignInOpen(true)}
              className="h-11 w-full gap-2 rounded-xl bg-indigo-600 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 active:bg-indigo-700"
            >
              <ShieldCheck className="h-4 w-4" />
              Sign In
              <ArrowRight className="ml-auto h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              Google OAuth — secure & passwordless
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/[0.04] px-6 py-4 text-[10px] text-zinc-600">
          <Link href="/" className="transition-colors hover:text-zinc-400">Home</Link>
          <span className="text-zinc-800">·</span>
          <Link href="/privacy" className="transition-colors hover:text-zinc-400">Privacy</Link>
          <span className="text-zinc-800">·</span>
          <Link href="/terms" className="transition-colors hover:text-zinc-400">Terms</Link>
          <span className="text-zinc-800">·</span>
          <Link href="/disclaimer" className="transition-colors hover:text-zinc-400">Disclaimer</Link>
        </div>
      </div>

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  );
}
