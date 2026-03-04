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
    date: "2026-03-04",
    title: "Free Tools Hub · Instrument Page Upgrade · Faster Charts",
    improved: [
      "Launched a free Forex Lot Size Calculator at /tools/lot-size-calculator — enter your account balance, risk %, stop loss (pips), and currency pair and it instantly outputs standard, mini, and micro lot sizes, dollar risk, R:R ratio, and potential profit. Supports 12 pairs including EUR/USD, GBP/USD, USD/JPY, GBP/JPY, and XAU/USD (gold).",
      "Launched a Tools hub at /tools listing all available and upcoming calculators in one place.",
      "Trade Journal announced — a free, fully private trade log (stored in your browser, nothing sent to our servers) showing win rate, R:R ratio, equity curve, session breakdown, and an AI review mode. Currently in development.",
      "Dedicated instrument analysis pages (/dashboard/instruments/EURUSD, GBPUSD, USDJPY, XAUUSD) now load significantly faster — the TradingView chart is now loaded in the background after the AI analysis panels appear, so you see your bias, news driver, technicals, and macro data instantly rather than waiting for the chart.",
      "TradingView chart skeletons added — instead of a blank area while the chart loads, you now see a clean loading indicator while the chart initialises.",
      "Added a 'Tools' link to the main navigation (desktop + mobile menu) for quick access.",
      "Instrument pages now show breadcrumb navigation — Home → Dashboard → [SYMBOL] — making it easier to understand where you are and go back.",
    ],
    fixed: [
      "Fixed a potential chart hydration issue where the TradingView widget could cause a brief visual flicker on first load.",
    ],
  },
  {
    date: "2026-03-02",
    title: "Dedicated Instrument Pages · Reddit AI Pillar · Layout Overhaul",
    improved: [
      "Launched dedicated analysis pages for each currency pair (EURUSD, GBPUSD, USDJPY, XAUUSD) at /dashboard/instruments/[pair] — full 1H TradingView advanced chart, all four AI pillars, share-to-story card, and a live Refresh AI button.",
      "Dashboard instrument section redesigned as a compact summary list — each row shows the AI bias, conviction ring, and a one-line takeaway. Tap any row to go to the full analysis page.",
      "Added Reddit Sentiment as a dedicated fourth AI pillar alongside News Driver, Technical Levels, and Macro Backdrop. The AI synthesises what r/Forex traders are discussing about each pair and surfaces it as a structured insight — not raw posts.",
      "Macro Desk brief now includes a Community Pulse section — the AI's synthesis of overall r/Forex trader mood and positioning, shown inside the Desk Summary card.",
      "Reddit data feeds AI analysis silently in the backend for both the instruments and macro desk APIs. No raw post feed is shown in the UI — only the AI-digested insight.",
      "Added an Exit Dashboard button in the top-right header — subtle ghost style, turns rose-red on hover, takes you back to the homepage without signing out.",
      "Dashboard sidebar simplified to Volatility panel only — cleaner, less noise.",
      "Exit button added on the dedicated instrument page (← Dashboard breadcrumb) with a sticky nav bar showing pair breadcrumb and Refresh AI.",
      "Launched a dedicated News page at /dashboard/news — hero featured card, 3-column grid layout, per-topic colour coding (USD · EUR · GBP · JPY · Geopolitics · FX), live search, and a High Impact toggle.",
      "News feed now fetches up to 25 quality-filtered articles (was 10). Clickbait, opinion, lifestyle, and non-market headlines are automatically removed before display.",
      "Live News in the Macro Desk now shows only the top 8 headlines with a 'View all' link to the full news page.",
    ],
    removed: [
      "Removed the old instrument card grid from the main dashboard — replaced by the new compact summary list.",
    ],
  },
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

import { UpdatesClient } from "./updates-client";

export default function UpdatesPage() {
  return <UpdatesClient updates={UPDATES} />;
}
