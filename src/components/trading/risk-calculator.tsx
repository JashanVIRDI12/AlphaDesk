"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X, IndianRupee, Percent, Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function RiskCalculator() {
    const [open, setOpen] = React.useState(false);

    // Form state
    const [accountSize, setAccountSize] = React.useState<string>("10000");
    const [riskPercent, setRiskPercent] = React.useState<string>("1.0");
    const [stopLoss, setStopLoss] = React.useState<string>("20");
    const [currencyPair, setCurrencyPair] = React.useState<string>("XXX/USD");

    // Calculation logic
    // For standard lots: 1 lot = $10 per pip for pairings where USD is quote currency.
    const numericAccountSize = parseFloat(accountSize) || 0;
    const numericRiskPercent = parseFloat(riskPercent) || 0;
    const numericStopLoss = parseFloat(stopLoss) || 0;

    const riskAmount = (numericAccountSize * numericRiskPercent) / 100;

    // Lot Size calculation
    // Risk Amount = Lot Size * Stop Loss * Pip Value
    // Lot Size = Risk Amount / (Stop Loss * Pip Value)
    // Assuming Pip Value for Standard Lot = $10
    let standardLots = 0;
    let miniLots = 0;
    let microLots = 0;

    if (numericStopLoss > 0) {
        standardLots = riskAmount / (numericStopLoss * 10);
        miniLots = standardLots * 10;
        microLots = standardLots * 100;
    }

    return (
        <>
            {/* Toggle Button for Header */}
            <button
                onClick={() => setOpen(true)}
                className="group flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.08] px-3 py-1.5 text-[10px] font-semibold tracking-wide text-indigo-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/10"
            >
                <Calculator className="h-3 w-3" />
                <span className="hidden sm:inline">Risk Calc</span>
            </button>

            {/* Slide-out Overlay */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Slide-out Panel */}
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-white/[0.08] bg-[#0c0c0e]/95 p-6 shadow-2xl backdrop-blur-2xl sm:w-[400px]"
                        >
                            <div className="flex h-full flex-col">
                                {/* Header */}
                                <div className="mb-6 flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                                                <Calculator className="h-4 w-4 text-indigo-400" />
                                            </div>
                                            <h2 className="text-lg font-bold text-zinc-100">Risk Manager</h2>
                                        </div>
                                        <p className="mt-2 text-xs text-zinc-400">Calculate exact position sizing before you trade.</p>
                                    </div>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="rounded-full p-2 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Form Body */}
                                <div className="flex-1 space-y-5 overflow-y-auto pr-2">

                                    {/* Account Size */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Account Size ($)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-zinc-400">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                value={accountSize}
                                                onChange={(e) => setAccountSize(e.target.value)}
                                                className="w-full rounded-xl border border-white/[0.07] bg-[#121215] py-2.5 pl-7 pr-3 text-sm font-medium text-zinc-100 outline-none transition-all focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Risk % */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Risk Percentage</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={riskPercent}
                                                onChange={(e) => setRiskPercent(e.target.value)}
                                                className="w-full rounded-xl border border-white/[0.07] bg-[#121215] py-2.5 pl-9 pr-3 text-sm font-medium text-zinc-100 outline-none transition-all focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>

                                    {/* Stop Loss Pips */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Stop Loss (Pips)</label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                            <input
                                                type="number"
                                                value={stopLoss}
                                                onChange={(e) => setStopLoss(e.target.value)}
                                                className="w-full rounded-xl border border-white/[0.07] bg-[#121215] py-2.5 pl-9 pr-3 text-sm font-medium text-zinc-100 outline-none transition-all focus:border-indigo-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent my-4" />

                                    {/* Live Output Box */}
                                    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent p-5">
                                        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Position Sizing</h3>

                                        <div className="space-y-4">
                                            {/* Top Level Risk Amount */}
                                            <div className="flex items-end justify-between border-b border-indigo-500/10 pb-4">
                                                <div>
                                                    <p className="text-xs text-zinc-400">Amount at Risk</p>
                                                    <p className="font-mono text-xl font-bold text-rose-400">
                                                        ${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-zinc-400">Standard Lots</p>
                                                    <p className="font-mono text-xl font-bold text-emerald-400">
                                                        {standardLots.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Micro / Mini Lots Breakdown */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/[0.03]">
                                                    <p className="text-[10px] uppercase text-zinc-500">Mini Lot (0.10)</p>
                                                    <p className="mt-0.5 font-mono text-sm font-medium text-zinc-200">{miniLots.toFixed(1)}</p>
                                                </div>
                                                <div className="rounded-xl bg-black/40 px-3 py-2 border border-white/[0.03]">
                                                    <p className="text-[10px] uppercase text-zinc-500">Micro Lot (0.01)</p>
                                                    <p className="mt-0.5 font-mono text-sm font-medium text-zinc-200">{microLots.toFixed(0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Note */}
                                <div className="mt-6 border-t border-white/[0.08] pt-4 px-1">
                                    <p className="text-center text-[10px] leading-relaxed text-zinc-500">
                                        Based on XXX/USD pairings (1 Standard Lot = $10/pip). Keep risk below 2% per trade for optimal long-term survival.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
