import type { Metadata } from "next";
import Link from "next/link";
import {
    BookOpen, ArrowLeft, Clock, Bell, CheckCircle2,
    TrendingUp, BarChart3, Brain, Target, Zap,
    AlertTriangle, Eye, Activity, Smile, ArrowRight,
} from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
    title: "Trade Journal — Coming Soon | GetTradingBias Tools",
    description:
        "The most intelligent forex trade journal ever built. Automatically compares your trades against AI bias signals, detects emotional patterns, and tells you exactly what mistakes are costing you money. Free, private, browser-only.",
    alternates: {
        canonical: "https://gettradingbias.com/tools/trade-journal",
    },
};

/* ── Feature types ── */
type Feature = {
    icon: React.ElementType;
    tag: string;
    tagColor: string;
    title: string;
    desc: string;
    detail: string;
    accentColor: string;
    borderColor: string;
};

const CORE_FEATURES: Feature[] = [
    {
        icon: BookOpen,
        tag: "Core",
        tagColor: "border-zinc-500/20 bg-zinc-500/[0.07] text-zinc-400",
        title: "Full Trade Logging",
        desc: "Log pair, direction, entry, SL, TP, lot size, session, and notes. One entry takes 20 seconds.",
        detail: "Also records your planned R:R vs actual outcome — so you'll finally see if you're cutting winners early or moving stop losses.",
        accentColor: "text-zinc-300",
        borderColor: "border-white/[0.07]",
    },
    {
        icon: BarChart3,
        tag: "Core",
        tagColor: "border-zinc-500/20 bg-zinc-500/[0.07] text-zinc-400",
        title: "Real Performance Stats",
        desc: "Win rate, profit factor, average R:R, expectancy, largest win, largest loss, and consecutive streak tracking.",
        detail: "Broken down by currency pair, session (London/NY/Asia), day of week, and trade direction — long vs short separately.",
        accentColor: "text-zinc-300",
        borderColor: "border-white/[0.07]",
    },
    {
        icon: TrendingUp,
        tag: "Core",
        tagColor: "border-zinc-500/20 bg-zinc-500/[0.07] text-zinc-400",
        title: "Live Equity Curve",
        desc: "Visual chart of your balance growing or shrinking trade by trade. See exactly where drawdowns started.",
        detail: "Overlayed with your best and worst trading days marked — so you can study what happened before a losing streak.",
        accentColor: "text-zinc-300",
        borderColor: "border-white/[0.07]",
    },
];

const UNIQUE_FEATURES: Feature[] = [
    {
        icon: Brain,
        tag: "Only on GetTradingBias",
        tagColor: "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-300",
        title: "AI Bias vs Your Trade",
        desc: "Every time you log a trade, we compare your direction against what the GetTradingBias AI said at that time.",
        detail: "Did you trade EUR/USD long when the AI said bearish? Your dashboard will tell you: when you followed the AI bias your win rate was 68%. When you went against it — 31%. Numbers don't lie.",
        accentColor: "text-indigo-200",
        borderColor: "border-indigo-500/15",
    },
    {
        icon: AlertTriangle,
        tag: "Only on GetTradingBias",
        tagColor: "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-300",
        title: "News Event Tagging",
        desc: "The journal knows your economic calendar. It automatically flags if you entered within 30 minutes of a high-impact event.",
        detail: "You'll get a stat like: '11 of your 14 biggest losing trades were entered within 20 minutes of an NFP or FOMC release. You're a news risk taker — and it's costing you.'",
        accentColor: "text-indigo-200",
        borderColor: "border-indigo-500/15",
    },
    {
        icon: Smile,
        tag: "Only on GetTradingBias",
        tagColor: "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-300",
        title: "Emotional State Tracker",
        desc: "Before logging each trade, rate your emotional state: Calm · Confident · FOMO · Revenge · Anxious.",
        detail: "After 30 trades you'll see: 'Trades logged as FOMO have a -0.4R average. Trades logged as Calm have +0.9R average.' Most traders already know this is true — you'll finally have the proof.",
        accentColor: "text-indigo-200",
        borderColor: "border-indigo-500/15",
    },
    {
        icon: Eye,
        tag: "Only on GetTradingBias",
        tagColor: "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-300",
        title: "Mistake Pattern Detection",
        desc: "The AI reads your trade notes across all entries and surfaces the phrases you keep repeating on losing trades.",
        detail: "Things like: 'You wrote \'moved SL\' in 9 of your 11 biggest losing trades.' or 'You mention \'entered early\' 14 times. Your average loss on early entries is 1.8R vs 0.6R on patient entries.' Nobody else does this.",
        accentColor: "text-indigo-200",
        borderColor: "border-indigo-500/15",
    },
    {
        icon: Target,
        tag: "Only on GetTradingBias",
        tagColor: "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-300",
        title: "Pre-Trade Checklist",
        desc: "Before you log a trade, run a 5-point checklist: Is this with the AI bias? Is there a news event in the next hour? What's your emotional state? Where is your SL — structure or arbitrary?",
        detail: "Trades where you completed all 5 checks will be compared to trades you skipped it. You'll see the difference in your own numbers within 2 weeks.",
        accentColor: "text-indigo-200",
        borderColor: "border-indigo-500/15",
    },
    {
        icon: Activity,
        tag: "Only on GetTradingBias",
        tagColor: "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-300",
        title: "Your Best Trading Hours",
        desc: "A heatmap of the exact UTC hours you trade vs when you win. Most traders are shocked to discover they have a 2–3 hour window where 70% of their profits come from.",
        detail: "Combined with session data, you'll know: 'Stop trading after the London close. Your NY-only session win rate is 24%. Your London session win rate is 61%.' That one insight alone could turn a losing month profitable.",
        accentColor: "text-indigo-200",
        borderColor: "border-indigo-500/15",
    },
    {
        icon: Zap,
        tag: "Only on GetTradingBias",
        tagColor: "border-indigo-500/25 bg-indigo-500/[0.08] text-indigo-300",
        title: "Weekly AI Review",
        desc: "At the end of each week, the AI generates a 5-point written review of your performance — not generic advice, but observations based on your actual logged data from that specific week.",
        detail: "It reads like a coach's notes: 'This week you won 4 GBP/USD longs and lost 3 EUR/USD shorts. Your GBP/USD long setup has a 78% win rate. Your EUR/USD short setup has a 29% win rate. Consider whether EUR/USD shorts fit your strategy.'",
        accentColor: "text-indigo-200",
        borderColor: "border-indigo-500/15",
    },
];

/* ── Feature card ── */
function FeatureCard({ feature }: { feature: Feature }) {
    const Icon = feature.icon;
    return (
        <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#0d0d12] to-[#0a0a0f] p-6 ${feature.borderColor}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                    <Icon className={`h-5 w-5 ${feature.accentColor}`} />
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${feature.tagColor}`}>
                    {feature.tag}
                </span>
            </div>
            <h3 className={`mb-2 text-[15px] font-bold ${feature.accentColor}`}>
                {feature.title}
            </h3>
            <p className="mb-3 text-[13px] leading-relaxed text-zinc-400">
                {feature.desc}
            </p>
            <p className="text-[12px] leading-relaxed text-zinc-600 italic border-l-2 border-white/[0.06] pl-3">
                {feature.detail}
            </p>
        </div>
    );
}

export default function TradeJournalComingSoonPage() {
    return (
        <div className="min-h-screen bg-[#06060a] text-zinc-100">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-[140px]" />
                <div className="absolute bottom-1/3 right-0 h-[400px] w-[400px] rounded-full bg-indigo-500/[0.04] blur-[100px]" />
            </div>

            <div className="relative">
                <LandingNav />

                <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">

                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[11px] text-zinc-600">
                        <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/tools" className="hover:text-zinc-400 transition-colors">Tools</Link>
                        <span>/</span>
                        <span className="text-zinc-400">Trade Journal</span>
                    </nav>

                    {/* Hero */}
                    <div className="mb-16 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                            <BookOpen className="h-8 w-8 text-violet-400" />
                        </div>

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-4 py-1.5">
                            <Clock className="h-3 w-3 text-amber-400" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-400">
                                In Development
                            </span>
                        </div>

                        <h1 className="mb-5 text-4xl font-black tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
                            The Trade Journal <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                that actually teaches you.
                            </span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-zinc-500 sm:text-[16px]">
                            Most journals just store your trades. This one reads them, finds your patterns, cross-references your AI bias data, tracks your emotional state, and tells you exactly what is costing you money — in plain English.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            {["Free forever", "Nothing sent to servers", "Works offline", "CSV export", "No signup required"].map((tag) => (
                                <span key={tag} className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] font-medium text-zinc-500">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500/70" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Section: Core features */}
                    <div className="mb-14">
                        <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                            What every trade journal has
                        </div>
                        <div className="mb-6 text-center text-[13px] text-zinc-600">
                            (Done properly, not as an afterthought)
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {CORE_FEATURES.map((f) => (
                                <FeatureCard key={f.title} feature={f} />
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-14 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-indigo-500/20" />
                        <div className="flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-1.5">
                            <Zap className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-400">
                                What nobody else has
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-indigo-500/20" />
                    </div>

                    {/* Section: Unique features */}
                    <div className="mb-14">
                        <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Exclusive to GetTradingBias
                        </div>
                        <p className="mb-8 text-center text-[13px] leading-relaxed text-zinc-600 max-w-xl mx-auto">
                            Because we have your AI bias data, your news calendar, and your instrument analysis — your journal can do things no standalone tool ever could.
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {UNIQUE_FEATURES.map((f) => (
                                <FeatureCard key={f.title} feature={f} />
                            ))}
                        </div>
                    </div>

                    {/* "How it's different" statement */}
                    <div className="mb-12 relative overflow-hidden rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.07] via-violet-500/[0.04] to-transparent p-8 md:p-10">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
                        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-60 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[60px]" />
                        <div className="relative">
                            <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/60">
                                The key difference
                            </p>
                            <h2 className="mb-5 text-center text-xl font-black text-zinc-100 sm:text-2xl">
                                Other journals ask "what did you trade?"<br />
                                <span className="text-indigo-300">We ask "why are you losing?"</span>
                            </h2>
                            <p className="mx-auto max-w-2xl text-center text-[14px] leading-relaxed text-zinc-500">
                                A spreadsheet can store your trades. What it can't do is read 60 trades, notice you've entered EUR/USD short 12 times against a bullish AI bias, and correlate that with a 91% loss rate on those specific entries. That's not a journal feature — that's a trading coach. And it's coming to GetTradingBias for free.
                            </p>
                        </div>
                    </div>

                    {/* Honest cross-device explainer */}
                    <div className="mb-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d12]">
                        <div className="border-b border-white/[0.05] px-6 py-4">
                            <h2 className="text-[14px] font-bold text-zinc-200">Where your data actually lives</h2>
                            <p className="mt-1 text-[12px] text-zinc-500">The honest answer — no marketing spin.</p>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                            {/* Guest */}
                            <div className="flex items-start gap-4 px-6 py-4">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                                    <span className="text-[11px]">👤</span>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-zinc-300">Not logged in</p>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">
                                        Trades are saved to your browser's <span className="font-mono text-zinc-400">localStorage</span> on that specific device and browser. Fast, works offline, no account needed — but{" "}
                                        <span className="text-amber-400/80">data does not sync to other devices</span>, and will be lost if you clear your browser storage or switch browsers.
                                    </p>
                                </div>
                            </div>
                            {/* Logged in */}
                            <div className="flex items-start gap-4 px-6 py-4">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06]">
                                    <span className="text-[11px]">🔐</span>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-zinc-300">Logged in with your account <span className="ml-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">Recommended</span></p>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">
                                        Your trades are saved to your account and synced — so they appear on your phone, laptop, or any device you're signed into.{" "}
                                        <span className="text-zinc-400">We store only the structured trade data</span> (pair, direction, entry, SL, TP, outcome, and session). Your personal written notes are stored per-device in localStorage and are never uploaded.
                                    </p>
                                </div>
                            </div>
                            {/* AI Review */}
                            <div className="flex items-start gap-4 px-6 py-4">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06]">
                                    <span className="text-[11px]">🤖</span>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-zinc-300">AI Review feature</p>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">
                                        When you click <span className="font-semibold text-zinc-400">"Generate AI Review"</span>, your selected trade notes are sent to an AI model (OpenAI or Gemini) to generate the review. This happens{" "}
                                        <span className="text-amber-400/80">only when you explicitly trigger it</span> — your notes are not passively monitored or stored. The review is generated fresh each time and not retained on our servers.
                                    </p>
                                </div>
                            </div>
                            {/* Export */}
                            <div className="flex items-start gap-4 px-6 py-4">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                                    <span className="text-[11px]">📤</span>
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-zinc-300">Export anytime</p>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">
                                        Export everything as a CSV or JSON file at any time — compatible with Excel, Google Sheets, and any other journal tool if you ever want to leave.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mb-10 overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-br from-violet-500/[0.06] to-transparent p-8 text-center">
                        <Bell className="mx-auto mb-3 h-6 w-6 text-violet-400/70" />
                        <h2 className="mb-2 text-lg font-bold text-zinc-100">
                            Follow development on the Updates page
                        </h2>
                        <p className="mb-5 text-[13px] text-zinc-500">
                            We post when new features go live. No email list — just check{" "}
                            <Link href="/updates" className="text-violet-400/70 underline underline-offset-2 hover:text-violet-300 transition-colors">
                                /updates
                            </Link>.
                        </p>
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <Link
                                href="/updates"
                                className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-6 py-2.5 text-[13px] font-semibold text-violet-300 transition-all hover:bg-violet-500/15"
                            >
                                View Updates
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                                href="/tools/lot-size-calculator"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-6 py-2.5 text-[13px] font-medium text-zinc-400 transition-all hover:border-white/[0.12] hover:text-zinc-200"
                            >
                                Try Lot Size Calculator while you wait
                            </Link>
                        </div>
                    </div>

                    {/* Back nav */}
                    <div className="flex items-center justify-start">
                        <Link
                            href="/tools"
                            className="flex items-center gap-1.5 text-[12px] text-zinc-600 transition-colors hover:text-zinc-400"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to all tools
                        </Link>
                    </div>
                </main>

                <LandingFooter />
            </div>
        </div>
    );
}
