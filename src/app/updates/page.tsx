import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, Trash2, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Updates",
  description:
    "Track improvements, UI changes, and removals in the GetTradingBias dashboard.",
};

type UpdateItem = {
  date: string;
  title: string;
  improved: string[];
  removed?: string[];
  fixed?: string[];
};

const UPDATES: UpdateItem[] = [
  {
    date: "2026-02-20",
    title: "Dashboard UX compact pass",
    improved: [
      "Redesigned Terminal button with premium indigo→purple gradient and refined shimmer.",
      "Improved shimmer animation fade-in/fade-out for smoother sweep.",
      "Added compact market overview strip for quick context.",
      "Added mobile quick links (sticky) for faster section navigation.",
      "Reduced dashboard spacing and improved mobile readability.",
      "News: added filter chips (ALL/USD/JPY/GBP/FED) with counts.",
      "News: added High Impact toggle and HIGH badges.",
      "News: filter & impact preferences persist in localStorage.",
      "News: defaults to tighter list with show more/less.",
      "News: forced reliable refetching (no-store) and background polling.",
      "News: balanced feed output (max 5 per topic) and capped dashboard list to top 10.",
      "News: update cadence aligned to every 2 minutes (client + API cache headers).",
      "Instrument cards: added compact Drivers panel and confidence reason.",
      "Instrument cards: made Drivers panel collapsible (Quick drivers) to reduce clutter.",
      "Macro panel: added Drivers + confidence reason strip and compact analysis toggle.",
      "Dashboard layout: removed sticky right sidebar so both columns scroll together.",
      "Moved volatility panel to the right column and positioned it below fundamentals.",
      "Added /updates page and linked it from nav + footer for changelog visibility.",
      "Added Google Analytics (gtag) integration with measurement ID G-0RKN1FKFV5.",
    ],
    removed: [
      "Removed green live dot indicator from Terminal button.",
      "Removed tactical suffix from macro risk badge labels (e.g. “(TACTICAL)”).",
      "Removed sticky background overlay behind mobile quick-link bar (kept buttons).",
    ],
    fixed: [
      "Fixed mobile nav hamburger reliability (event propagation + animation behavior).",
      "Fixed hydration mismatch caused by locale clock formatting in Greeting.",
      "Fixed invalid nested button hydration error in instrument cards.",
      "Fixed GA gtag initialization so window.gtag is defined after load.",
    ],
  },
];

function UpdateCard({ item }: { item: UpdateItem }) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.45)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px] font-semibold tracking-tight text-zinc-100">{item.title}</h2>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] tracking-wide text-zinc-400">
          {item.date}
        </span>
      </div>

      <div className="space-y-4 text-[13px] leading-6 text-zinc-300">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Improved
          </div>
          <ul className="space-y-1.5">
            {item.improved.map((line) => (
              <li key={line} className="flex gap-2">
                <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {item.removed?.length ? (
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-300">
              <Trash2 className="h-3.5 w-3.5" />
              Removed
            </div>
            <ul className="space-y-1.5">
              {item.removed.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-rose-300/70" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {item.fixed?.length ? (
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              <Wrench className="h-3.5 w-3.5" />
              Fixed
            </div>
            <ul className="space-y-1.5">
              {item.fixed.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-amber-300/70" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-[#06060a] bg-[radial-gradient(1200px_620px_at_50%_-15%,rgba(129,140,248,0.14),transparent_62%),radial-gradient(900px_420px_at_0%_8%,rgba(139,92,246,0.10),transparent_60%),radial-gradient(900px_500px_at_100%_12%,rgba(99,102,241,0.10),transparent_58%)] text-zinc-100">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Changelog</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Product Updates</h1>
            <p className="mt-2 text-[13px] text-zinc-400">
              Post what improved, removed, and fixed in each dashboard release.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>

        <div className="space-y-4">
          {UPDATES.map((item) => (
            <UpdateCard key={`${item.date}-${item.title}`} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
}
