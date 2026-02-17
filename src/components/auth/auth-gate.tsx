"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { Shield, Lock } from "lucide-react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const locked = status !== "authenticated";
  const [signInOpen, setSignInOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"signIn" | "signUp">("signIn");

  return (
    <div className="relative">
      <div
        className={
          locked
            ? "pointer-events-none select-none blur-[3px] opacity-40"
            : undefined
        }
        aria-hidden={locked}
      >
        {children}
      </div>

      {locked ? (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="min-h-[100dvh] w-full px-4 py-6 sm:py-8 flex items-start justify-center sm:items-center">
            <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/90 p-5 sm:p-8 text-center shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              {/* Lock icon */}
              <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400" />
              </div>

              <div className="mt-4 sm:mt-5 text-base font-semibold tracking-tight text-zinc-100">
                Terminal Access Required
              </div>
              <div className="mx-auto mt-2 max-w-xs text-[13px] leading-5 text-zinc-500">
                Authenticate with your Terminal ID and access code to unlock the
                institutional trading terminal.
              </div>

              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3">
                <Button
                  onClick={() => {
                    setMode("signIn");
                    setSignInOpen(true);
                  }}
                  className="gap-2 rounded-xl bg-white/[0.08] px-5 text-sm font-medium text-zinc-100 hover:bg-white/[0.12]"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Sign In
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMode("signUp");
                    setSignInOpen(true);
                  }}
                  className="rounded-xl text-sm text-zinc-500 hover:text-zinc-300"
                >
                  Request Access
                </Button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-600">
                <Shield className="h-3 w-3" />
                <span>Institutional-grade encrypted access</span>
              </div>

              {/* Links */}
              <div className="mt-5 sm:mt-6 border-t border-white/[0.06] pt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <Link href="/" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                  Learn More
                </Link>
                <span className="text-zinc-800">·</span>
                <Link href="/privacy" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                  Privacy
                </Link>
                <span className="text-zinc-800">·</span>
                <Link href="/terms" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                  Terms
                </Link>
                <span className="text-zinc-800">·</span>
                <Link href="/disclaimer" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">
                  Disclaimer
                </Link>
              </div>
            </div>
          </div>

          <SignInModal
            open={signInOpen}
            onOpenChange={setSignInOpen}
            title="Sign in to GetTradingBias (BETA)"
            initialMode={mode}
          />
        </div>
      ) : null}
    </div>
  );
}
