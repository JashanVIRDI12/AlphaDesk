"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, LineChart, FileText, Globe, Volume2, X } from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-indigo-500/20 bg-[#0c0c0e]/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <Command label="Command Palette" className="flex h-full w-full flex-col overflow-hidden bg-transparent">

                    <div className="flex items-center border-b border-white/10 px-4">
                        <Search className="mr-3 h-5 w-5 text-indigo-400" />
                        <Command.Input
                            autoFocus
                            placeholder="Type a command or search (e.g., USDJPY, News...)"
                            className="flex h-14 w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                        />
                        <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-white/10 text-zinc-400 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="JUMP TO CHART" className="text-[10px] font-medium text-zinc-500 px-2 py-1.5 uppercase tracking-widest">
                            {[
                                { label: "USD/JPY - Dollar Yen", hint: "Bullish setup" },
                                { label: "EUR/USD - Euro Dollar", hint: "Consolidating" },
                                { label: "GBP/USD - British Pound", hint: "High vol" },
                                { label: "XAU/USD - Gold", hint: "Safe haven bid" },
                            ].map(pair => (
                                <Command.Item
                                    key={pair.label}
                                    onSelect={() => {
                                        document.getElementById('instruments')?.scrollIntoView({ behavior: 'smooth' });
                                        setOpen(false);
                                    }}
                                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm text-zinc-300 aria-selected:bg-indigo-500/10 aria-selected:text-white mt-1 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <LineChart className="h-4 w-4 text-indigo-400" />
                                        <span>{pair.label}</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500">{pair.hint}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>

                        <Command.Group heading="ACTIONS & TOOLS" className="text-[10px] font-medium text-zinc-500 px-2 pt-4 pb-1.5 uppercase tracking-widest">
                            <Command.Item
                                onSelect={() => {
                                    document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' });
                                    setOpen(false);
                                }}
                                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-300 aria-selected:bg-indigo-500/10 aria-selected:text-white mt-1 hover:bg-white/5 transition-colors"
                            >
                                <FileText className="h-4 w-4 text-indigo-400" />
                                <span>Jump to Macro & News Desk</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => {
                                    alert("Audio Playback feature triggered!");
                                    setOpen(false);
                                }}
                                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-300 aria-selected:bg-indigo-500/10 aria-selected:text-white mt-1 hover:bg-white/5 transition-colors"
                            >
                                <Volume2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-emerald-100">Play Daily AI Audio Briefing</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => {
                                    document.getElementById('volatility')?.scrollIntoView({ behavior: 'smooth' });
                                    setOpen(false);
                                }}
                                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-300 aria-selected:bg-indigo-500/10 aria-selected:text-white mt-1 hover:bg-white/5 transition-colors"
                            >
                                <Globe className="h-4 w-4 text-indigo-400" />
                                <span>View Volatility Matrix</span>
                            </Command.Item>
                        </Command.Group>

                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
