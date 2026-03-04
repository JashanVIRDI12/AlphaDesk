"use client";

import * as React from "react";
import { signOut, useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

import { SignInModal } from "@/components/auth/sign-in-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthControls() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name ?? null;
  const email = session?.user?.email ?? null;
  const [signInOpen, setSignInOpen] = React.useState(false);

  const initials = (userName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase())
    .join("") || "HF";

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="h-9 w-9 rounded-full bg-white/[0.04] animate-pulse" />
    );
  }

  return (
    <>
      {userName ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative ml-0.5 h-8 w-8 rounded-full ring-1 ring-white/10 outline-none transition-all focus:ring-indigo-500/50 hover:ring-white/30">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-white/[0.04] text-[10px] font-medium text-zinc-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#0c0c0e]/95 backdrop-blur-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-zinc-100">{userName}</p>
                {email && (
                  <p className="text-xs leading-none text-zinc-500">
                    {email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button
          type="button"
          onClick={() => setSignInOpen(true)}
          className="group flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.08] px-3 py-1.5 text-[10px] font-semibold tracking-wide text-indigo-300 transition-all duration-200 hover:border-indigo-500/40 hover:bg-indigo-500/10"
        >
          <LogIn className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span className="hidden sm:inline">Sign In</span>
        </button>
      )}

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  );
}
