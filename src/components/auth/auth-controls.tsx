"use client";

import * as React from "react";
import { signOut, useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SignInModal } from "@/components/auth/sign-in-modal";

export function AuthControls() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name ?? null;
  const [signInOpen, setSignInOpen] = React.useState(false);

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full transition-colors hover:bg-white/[0.06]"
        disabled
      />
    );
  }

  return (
    <>
      {userName ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full transition-colors hover:bg-white/[0.06]"
              type="button"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sign out</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full transition-colors hover:bg-white/[0.06]"
              onClick={() => setSignInOpen(true)}
            >
              <LogIn className="h-4 w-4" />
              <span className="sr-only">Sign in</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sign in</TooltipContent>
        </Tooltip>
      )}

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />

    </>
  );
}
