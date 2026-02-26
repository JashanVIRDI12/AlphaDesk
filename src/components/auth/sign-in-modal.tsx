"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Loader2, TrendingUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SignInModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initialMode?: "signIn" | "signUp";
}) {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) setLoading(false);
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleGoogle = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f] shadow-[0_0_80px_rgba(0,0,0,0.7)]">

          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-indigo-500/[0.08] blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <TrendingUp className="h-4 w-4 text-indigo-300" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-zinc-100">
                  Sign in to GetTradingBias
                </div>
                <div className="text-[11px] text-zinc-500">
                  Institutional trading terminal
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <Button
              onClick={handleGoogle}
              disabled={loading}
              className="h-11 w-full gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-zinc-100 transition-all hover:bg-white/[0.08] hover:border-white/[0.14] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {loading ? "Redirecting…" : "Continue with Google"}
            </Button>

            <p className="mt-4 text-center text-[11px] leading-5 text-zinc-600">
              By signing in you agree to our{" "}
              <a href="/terms" className="text-zinc-500 underline-offset-2 hover:underline">Terms</a>
              {" & "}
              <a href="/privacy" className="text-zinc-500 underline-offset-2 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
