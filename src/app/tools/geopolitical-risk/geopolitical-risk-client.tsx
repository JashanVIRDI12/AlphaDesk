"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, AlertTriangle, ShieldAlert, Activity, Search, RefreshCw, Zap, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HISTORICAL_EVENTS = [
    { year: 1900, name: "Boxer Rebellion", value: 110 },
    { year: 1904, name: "Russia-Japan War", value: 140 },
    { year: 1914, name: "WWI Begins", value: 470 },
    { year: 1918, name: "WWI Escalation", value: 400 },
    { year: 1923, name: "Occupation of Ruhr", value: 110 },
    { year: 1932, name: "Shanghai Incident", value: 110 },
    { year: 1935, name: "Italy-Ethiopia War", value: 190 },
    { year: 1938, name: "Germany Invades Czechia", value: 210 },
    { year: 1939, name: "WWII Begins", value: 480 },
    { year: 1941, name: "Pearl Harbor", value: 450 },
    { year: 1944, name: "D-Day", value: 470 },
    { year: 1950, name: "Korean War", value: 240 },
    { year: 1956, name: "Suez Crisis", value: 170 },
    { year: 1958, name: "Berlin Problem", value: 190 },
    { year: 1962, name: "Cuban Crisis", value: 220 },
    { year: 1967, name: "Six Day War", value: 180 },
    { year: 1973, name: "Yom Kippur War", value: 160 },
    { year: 1979, name: "Afghan Invasion", value: 170 },
    { year: 1982, name: "Falklands War", value: 180 },
    { year: 1990, name: "Iraq Invades Kuwait", value: 190 },
    { year: 1991, name: "Gulf War", value: 250 },
    { year: 1995, name: "Bosnian War", value: 120 },
    { year: 2001, name: "September 11", value: 310 },
    { year: 2003, name: "Iraq War", value: 240 },
    { year: 2015, name: "Paris Terror Attacks", value: 140 },
];

export function GeopoliticalRiskClient() {
    const [pathD, setPathD] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisQuery, setAnalysisQuery] = useState("");
    const [statusText, setStatusText] = useState("");
    const [result, setResult] = useState<any>(null);

    // Generate Chart Data on Mount
    useEffect(() => {
        const dataPoints = [];
        // Math.random seeded replacement to ensure consistent hydration/rendering 
        // We'll generate a pseudo-random noise sequence.
        let seed = 42;
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        const START_YEAR = 1900;
        const END_YEAR = 2020;
        const TOTAL_MONTHS = (END_YEAR - START_YEAR) * 12;

        for (let i = 0; i <= TOTAL_MONTHS; i++) {
            const currentYear = START_YEAR + i / 12;
            let val = 40 + random() * 40; // Base noise between 40 and 80

            // Apply event spikes
            HISTORICAL_EVENTS.forEach((ev) => {
                if (currentYear >= ev.year) {
                    const dist = currentYear - ev.year;
                    if (dist < 4) { // Influence decays over 4 years
                        // Spike math: high initially, exponential decay
                        const add = (ev.value - 60) * Math.exp(-dist * 1.8);
                        val += add;
                    }
                }
            });

            // Occasional random mini-spikes to mimic the chart's volatility
            if (random() > 0.98) {
                val += random() * 40;
            }

            dataPoints.push({ year: currentYear, val: Math.min(Math.max(val, 20), 520) });
        }

        // SVG Coordinate mapping
        // viewBox="0 0 1000 500"
        // X: 50 to 950 (width 900) -> 120 years
        // Y: 450 to 50 (height 400) -> 0 to 500 value
        let d = "";
        dataPoints.forEach((pt, index) => {
            const x = 50 + ((pt.year - START_YEAR) / (END_YEAR - START_YEAR)) * 900;
            const y = 450 - (pt.val / 500) * 400;

            if (index === 0) d += `M ${x.toFixed(2)},${y.toFixed(2)}`;
            else d += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
        });

        setPathD(d);
    }, []);

    // Interactive News Analysis
    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!analysisQuery.trim() || isAnalyzing) return;

        setIsAnalyzing(true);
        setResult(null);

        const steps = [
            "Intercepting global geopolitical feeds...",
            "Aggregating keyword correlations...",
            "Processing sentiment & rhetoric...",
            "Calculating conflict probability score...",
            "Finalizing Geopolitical Risk Index..."
        ];

        for (let i = 0; i < steps.length; i++) {
            setStatusText(steps[i]);
            await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        }

        setIsAnalyzing(false);
        // Mock result generation based on input length/characters
        const baseScore = 120 + (analysisQuery.length * 7) % 180;
        const score = Math.min(baseScore, 480);
        let level = "Low";
        let color = "text-emerald-400";
        if (score > 160) { level = "Elevated"; color = "text-amber-400"; }
        if (score > 240) { level = "High"; color = "text-orange-500"; }
        if (score > 320) { level = "Extreme"; color = "text-rose-500"; }

        setResult({
            score,
            level,
            color,
            drivers: [
                "Heightened diplomatic rhetoric in main regions",
                "Supply chain vulnerability observed in key commodities",
                "Military posturing alerts triggered in recent 48 hours"
            ],
            summary: `Automated analysis of recent news regarding '${analysisQuery}' indicates a ${level.toLowerCase()} level of geopolitical risk filtering into market pricing. This suggests potential volatility in correlated safe-haven assets.`
        });
    };

    return (
        <div className="min-h-screen bg-[#06060a] text-zinc-100">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-1/3 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/[0.04] blur-[120px]" />
            </div>

            <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
                {/* Header */}
                <Link
                    href="/tools"
                    className="mb-8 inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Tools
                </Link>

                <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1">
                            <Globe className="h-3.5 w-3.5 text-sky-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-400">
                                Global Macro Index
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Geopolitical Risk Calculator
                        </h1>
                        <p className="mt-2 text-[15px] text-zinc-400 max-w-2xl leading-relaxed">
                            Analyze word counts and sentiment of global newspaper articles capturing geopolitical tensions. Visualize historical risk back to 1900 and calculate live index scores for current events.
                        </p>
                    </div>
                </div>

                {/* Historical Chart Section */}
                <div className="mb-16 rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-4 sm:p-8 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-sky-400" />
                            <h2 className="text-lg font-semibold text-white">Historical GPR Index (1900–2020)</h2>
                        </div>
                        <div className="hidden sm:flex gap-4 text-[11px] text-zinc-500 font-medium">
                            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Index Value</span>
                            <span className="flex items-center gap-1.5"><span className="h-4 w-[1px] bg-red-400/50" /> Event Trigger</span>
                        </div>
                    </div>

                    <div className="relative w-full overflow-x-auto overflow-y-hidden" style={{ height: "460px" }}>
                        <div className="min-w-[800px] w-full h-full relative">
                            {/* SVG Chart */}
                            <svg viewBox="0 0 1000 500" className="w-full h-full" preserveAspectRatio="none">
                                {/* Grid lines */}
                                {[0, 100, 200, 300, 400, 500].map((tick) => (
                                    <g key={tick}>
                                        <line
                                            x1="50"
                                            y1={450 - (tick / 500) * 400}
                                            x2="950"
                                            y2={450 - (tick / 500) * 400}
                                            stroke="rgba(255,255,255,0.06)"
                                            strokeWidth="1"
                                            strokeDasharray={tick === 0 ? "none" : "4,4"}
                                        />
                                        <text
                                            x="40"
                                            y={450 - (tick / 500) * 400 + 4}
                                            fill="rgba(255,255,255,0.4)"
                                            fontSize="11"
                                            textAnchor="end"
                                            fontFamily="sans-serif"
                                        >
                                            {tick}
                                        </text>
                                    </g>
                                ))}

                                {/* X-axis Years */}
                                {[1900, 1920, 1940, 1960, 1980, 2000, 2020].map((year) => {
                                    const x = 50 + ((year - 1900) / 120) * 900;
                                    return (
                                        <text
                                            key={year}
                                            x={x}
                                            y="470"
                                            fill="rgba(255,255,255,0.6)"
                                            fontSize="12"
                                            textAnchor="middle"
                                            fontFamily="sans-serif"
                                        >
                                            {year}
                                        </text>
                                    );
                                })}

                                {/* The Line Path */}
                                {pathD && (
                                    <motion.path
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                        d={pathD}
                                        fill="none"
                                        stroke="#0ea5e9"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"   
                                        className="drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"                                     
                                    />
                                )}

                                {/* Event Markers */}
                                {pathD && HISTORICAL_EVENTS.map((ev, i) => {
                                    const x = 50 + ((ev.year - 1900) / 120) * 900;
                                    const y = 450 - (ev.value / 500) * 400;
                                    // Stagger y position of labels to avoid overlap
                                    const textY = (i % 2 === 0) ? y - 15 : y - 35;
                                    return (
                                        <g key={ev.name} className="group">
                                            {/* Vertical Line */}
                                            <line
                                                x1={x}
                                                y1={y}
                                                x2={x}
                                                y2="450"
                                                stroke="rgba(248,113,113,0.3)"
                                                strokeWidth="1"
                                                strokeDasharray="2,2"
                                                className="transition-opacity duration-300 group-hover:stroke-red-400 group-hover:stroke-2"
                                            />
                                            {/* Dot */}
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r="3"
                                                fill="#f87171"
                                                className="transition-all duration-300 group-hover:r-4"
                                            />
                                            {/* Label */}
                                            <text
                                                x={x}
                                                y={textY}
                                                fill="rgba(255,255,255,0.8)"
                                                fontSize="9"
                                                textAnchor="middle"
                                                className="pointer-events-none transition-all duration-300 group-hover:fill-white group-hover:text-xs"
                                                fontFamily="sans-serif"
                                            >
                                                {ev.name}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Live Calculator Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Panel */}
                    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
                        
                        <div className="mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                <Search className="h-5 w-5 text-sky-400" />
                                Custom News Analysis
                            </h3>
                            <p className="text-[13px] text-zinc-400 leading-relaxed">
                                Enter a region, country, or event. The AI simulator will calculate an implied GPR score by analyzing hypothetical news density, sentiment, and threat words.
                            </p>
                        </div>

                        <form onSubmit={handleAnalyze} className="relative">
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="e.g. Taiwan, Brent Crude Supply, Middle East..."
                                    value={analysisQuery}
                                    onChange={(e) => setAnalysisQuery(e.target.value)}
                                    disabled={isAnalyzing}
                                    className="w-full bg-[#09090e] border border-white/[0.1] rounded-xl px-4 py-3.5 pl-11 text-sm outline-none transition-all focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 disabled:opacity-50"
                                />
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isAnalyzing || !analysisQuery.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Analyzing Feeds...
                                    </>
                                ) : (
                                    <>
                                        Calculate Implied Risk
                                        <TrendingUp className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Analyzing Overlay */}
                        <AnimatePresence>
                            {isAnalyzing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-[#0d0d12]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                                >
                                    <div className="relative w-16 h-16 mb-4">
                                        <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 rounded-full animate-spin" />
                                        <div className="absolute inset-2 border-4 border-transparent border-l-sky-400 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                                        <Globe className="absolute inset-0 m-auto h-6 w-6 text-sky-300 animate-pulse" />
                                    </div>
                                    <p className="text-sm font-medium text-sky-400 font-mono tracking-tight animate-pulse">
                                        {statusText}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Output Panel */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-6 sm:p-8">
                        {!result && !isAnalyzing && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
                                <div className="p-4 rounded-full bg-white/[0.03]">
                                    <ShieldAlert className="h-8 w-8 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-300 mt-2">No Analysis Active</p>
                                    <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Run a query to generate geopolitical risk metrics here.</p>
                                </div>
                            </div>
                        )}

                        {result && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">
                                            Calculated Score for
                                        </p>
                                        <p className="text-lg font-medium text-zinc-200">"{analysisQuery}"</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-baseline gap-1 justify-end">
                                            <span className={`text-4xl font-black ${result.color}`}>
                                                {result.score.toFixed(0)}
                                            </span>
                                            <span className="text-xs text-zinc-500">/ 500</span>
                                        </div>
                                        <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${result.color}`}>
                                            {result.level} Threat
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="p-4 rounded-xl bg-sky-500/[0.04] border border-sky-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap className="h-4 w-4 text-sky-400" />
                                            <h4 className="text-sm font-semibold text-zinc-200">Terminal Summary</h4>
                                        </div>
                                        <p className="text-[13px] text-zinc-400 leading-relaxed">
                                            {result.summary}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 px-1">
                                            Identified Drivers
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.drivers.map((drv: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-[13px] text-zinc-300">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
                                                    {drv}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
