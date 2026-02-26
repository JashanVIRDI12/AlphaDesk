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
    date: "2026-02-27",
    title: "AlphaDesk PRO: Institutional Upgrade",
    improved: [
      "Upgraded the main layout to an expansive max-w-[1800px] edge-to-edge template for larger screens.",
      "Integrated Global Risk Bias and Market Session clocks directly into the top navigation bar to save vertical space.",
      "Rebuilt the Macro Desk into a unified deep-glass interface, unifying the layout and removing disjointed card borders.",
      "Condensed the global economic overview (FX, RATE, CPI, GDP) into a single high-density table for rapid multi-currency comparisons.",
      "Upgraded the Live News feed to dynamically adapt its height to its content, rather than arbitrarily restricting scrolling.",
      "Upgraded the Calendar engine to parse, track, and color-code both High and Medium-impact news releases for a more comprehensive pulse.",
      "Added a new 'Co-Pilot Check-in' to the dashboard greeting that rotates through daily psychological trading discipline tips.",
      "Significantly upgraded the AI Analysis engine structure to generate sharper, faster, and more analytically robust macro 'Scenarios' summaries.",
    ],
    removed: [
      "Removed the rigid Market Overview banner and merged its logic cleanly into the top header.",
      "Removed the 'Show More' buttons from the Live News feed in favor of an organic flow.",
    ],
  },
  {
    date: "2026-02-20",
    title: "Dashboard UX compact pass",
    improved: [
      "Refreshed the Terminal button with a premium look.",
      "Improved micro-interactions and visual polish across the landing navigation.",
      "Added a compact market overview strip for quick at-a-glance context.",
      "Made the dashboard more mobile-friendly with tighter spacing and better readability.",
      "Added mobile quick links for faster navigation between dashboard sections.",
      "News: introduced topic filters with counts.",
      "News: added a High Impact mode for breaking / market-moving headlines.",
      "News: improved refresh behavior so headlines stay current.",
      "News: improved the mix of headlines so one topic doesn’t dominate.",
      "Instrument cards: added a compact Drivers view to explain the bias (“why now”).",
      "Macro panel: added a Drivers summary to make decisions easier to trust.",
      "Reorganized the dashboard layout for a cleaner, less cluttered experience.",
      "Moved volatility into the right column under fundamentals for better scanning.",
      "Added a public Updates page so users can track improvements over time.",
    ],
    removed: [
      "Removed distracting UI accents from the Terminal button.",
      "Removed extra wording from risk labels to keep the UI cleaner.",
      "Removed background styling behind the mobile quick-link bar (kept the buttons).",
    ],
    fixed: [
      "Fixed mobile navigation behavior for more reliable open/close.",
      "Fixed a few UI inconsistencies that could cause occasional rendering glitches.",
      "Fixed interaction issues inside instrument cards.",
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
