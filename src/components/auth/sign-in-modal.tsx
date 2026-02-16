"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Mail, Shield, User, Building2, Phone, ArrowRight, CheckCircle2, Copy, Loader2, KeyRound, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/* ──── component ──── */

export function SignInModal({
  open,
  onOpenChange,
  title = "Sign in",
  initialMode = "signIn",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initialMode?: "signIn" | "signUp";
}) {
  const [mode, setMode] = React.useState<"signIn" | "signUp">(initialMode);
  const [step, setStep] = React.useState<1 | 2>(1);

  // Sign-in fields
  const [terminalId, setTerminalId] = React.useState("");
  const [accessCode, setAccessCode] = React.useState("");

  // Sign-up fields
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [organization, setOrganization] = React.useState("");

  // State
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<"id" | "code" | null>(null);

  // Generated credentials (after sign-up)
  const [generatedId, setGeneratedId] = React.useState("");
  const [generatedCode, setGeneratedCode] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setMode(initialMode);
      setStep(1);
      setTerminalId("");
      setAccessCode("");
      setFullName("");
      setEmail("");
      setPhone("");
      setOrganization("");
      setError(null);
      setSubmitting(false);
      setGeneratedId("");
      setGeneratedCode("");
      setCopied(null);
    }
  }, [open, initialMode]);

  React.useEffect(() => {
    setError(null);
    setSubmitting(false);
    setStep(1);
    setTerminalId("");
    setAccessCode("");
    setFullName("");
    setEmail("");
    setPhone("");
    setOrganization("");
    setGeneratedId("");
    setGeneratedCode("");
    setCopied(null);
  }, [mode]);

  const handleClose = () => onOpenChange(false);

  const handleCopy = async (text: string, type: "id" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  const [emailSent, setEmailSent] = React.useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("A valid email address is required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          organization: organization.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitting(false);
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setGeneratedId(data.terminalId);
      setGeneratedCode(data.accessCode);
      setEmailSent(data.emailSent === true);
      setSubmitting(false);
      setStep(2);
    } catch {
      setSubmitting(false);
      setError("Network error. Please try again.");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn("credentials", {
      name: terminalId.trim() || fullName.trim(),
      password: accessCode.trim(),
      redirect: false,
    });

    if (!res || res.error) {
      setSubmitting(false);
      const code = res?.error ?? "UNKNOWN";
      const message =
        code === "AUTH_PASSWORD_NOT_SET"
          ? "Terminal authentication is not configured. Contact your administrator."
          : code === "NAME_REQUIRED"
            ? "Terminal ID is required."
            : code === "PASSWORD_REQUIRED"
              ? "Access code is required."
              : code === "INVALID_PASSWORD"
                ? "Invalid access code. Please check your credentials."
                : "Authentication failed. Please try again.";

      setError(message);
      return;
    }

    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f]/95 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
          {/* ── Header ── */}
          <div className="relative overflow-hidden border-b border-white/[0.06] px-6 py-5">
            {/* Glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <Shield className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight">
                    {mode === "signUp"
                      ? step === 2
                        ? "Access Granted"
                        : "Request Terminal Access"
                      : title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {mode === "signUp"
                      ? step === 2
                        ? "Your credentials are ready"
                        : "Institutional-grade trading terminal"
                      : "Enter your terminal credentials"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
              >
                ×
              </button>
            </div>
          </div>

          {/* ── Mode Tabs ── */}
          {step === 1 && (
            <div className="px-6 pt-5">
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
                <button
                  type="button"
                  onClick={() => setMode("signIn")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 ${mode === "signIn"
                    ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signUp")}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 ${mode === "signUp"
                    ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  Request Access
                </button>
              </div>
            </div>
          )}

          {/* ── Sign In Form ── */}
          {mode === "signIn" && (
            <form onSubmit={handleSignIn} className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  <KeyRound className="h-3 w-3" />
                  Terminal ID
                </label>
                <input
                  value={terminalId}
                  onChange={(e) => setTerminalId(e.target.value)}
                  placeholder="HT-XXXXXXXX"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 font-mono text-sm tracking-wider outline-none ring-offset-background placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 transition-all"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  <Shield className="h-3 w-3" />
                  Access Code
                </label>
                <input
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  type="password"
                  placeholder="••••-••••-••••"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 font-mono text-sm tracking-wider outline-none ring-offset-background placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 transition-all"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-xs text-red-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setMode("signUp")}
                  className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  Don&apos;t have credentials?
                </button>
                <Button
                  type="submit"
                  disabled={submitting || !terminalId.trim() || !accessCode.trim()}
                  className="gap-2 rounded-xl bg-white/[0.08] px-5 text-sm font-medium text-zinc-100 hover:bg-white/[0.12] disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      Authenticate
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* ── Sign Up Form (Step 1) ── */}
          {mode === "signUp" && step === 1 && (
            <form onSubmit={handleSignUp} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    <User className="h-3 w-3" />
                    Full Name
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jashan Singh"
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm outline-none ring-offset-background placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 transition-all"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    <Building2 className="h-3 w-3" />
                    Organization
                  </label>
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Optional"
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm outline-none ring-offset-background placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 transition-all"
                    autoComplete="organization"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  <Mail className="h-3 w-3" />
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="trader@institution.com"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm outline-none ring-offset-background placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 transition-all"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm outline-none ring-offset-background placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/10 transition-all"
                  autoComplete="tel"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-xs text-red-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setMode("signIn")}
                  className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  Already have credentials?
                </button>
                <Button
                  type="submit"
                  disabled={submitting || !fullName.trim() || !email.trim()}
                  className="gap-2 rounded-xl bg-white/[0.08] px-5 text-sm font-medium text-zinc-100 hover:bg-white/[0.12] disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Provisioning Access…
                    </>
                  ) : (
                    <>
                      Generate Credentials
                      <Sparkles className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* ── Sign Up (Step 2 — Credentials Generated) ── */}
          {mode === "signUp" && step === 2 && (
            <div className="space-y-5 px-6 py-5">
              {/* Success banner */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <div className="text-sm font-medium text-emerald-200">
                    Terminal access provisioned
                  </div>
                  <div className="mt-0.5 text-[11px] text-emerald-300/60">
                    {emailSent ? (
                      <>
                        Credentials emailed to{" "}
                        <span className="font-medium text-emerald-300/80">{email}</span>
                      </>
                    ) : (
                      <>
                        Save credentials below — email delivery is not configured
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Applicant info */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Applicant
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-200">
                  {fullName}
                  {organization && (
                    <span className="ml-2 text-xs text-zinc-500">
                      · {organization}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">{email}</div>
                {phone && (
                  <div className="text-xs text-zinc-500">{phone}</div>
                )}
              </div>

              {/* Generated Terminal ID */}
              <div className="space-y-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Terminal ID
                    </div>
                    <button
                      onClick={() => handleCopy(generatedId, "id")}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-zinc-500 transition-all hover:bg-white/[0.06] hover:text-zinc-300"
                    >
                      {copied === "id" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 font-mono text-lg font-semibold tracking-wider text-zinc-100">
                    {generatedId}
                  </div>
                </div>

                {/* Generated Access Code */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Access Code
                    </div>
                    <button
                      onClick={() => handleCopy(generatedCode, "code")}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-zinc-500 transition-all hover:bg-white/[0.06] hover:text-zinc-300"
                    >
                      {copied === "code" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 font-mono text-lg font-semibold tracking-wider text-zinc-100">
                    {generatedCode}
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.04] px-4 py-2.5 text-[11px] leading-5 text-amber-200/60">
                <span className="font-medium text-amber-200/80">Important:</span>{" "}
                Save your credentials securely. For security reasons, this access code cannot be recovered once this window is closed.
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="rounded-xl text-zinc-500 hover:text-zinc-300"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setMode("signIn");
                    setStep(1);
                    setTerminalId(generatedId);
                    setAccessCode("");
                  }}
                  className="flex-1 gap-2 rounded-xl bg-white/[0.08] text-sm font-medium text-zinc-100 hover:bg-white/[0.12]"
                >
                  Sign in with credentials
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="border-t border-white/[0.04] px-6 py-3">
            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600">
              <Shield className="h-3 w-3" />
              <span>256-bit TLS encrypted · Institutional grade security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
