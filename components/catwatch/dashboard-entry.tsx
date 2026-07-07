"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { CatWatchLoading } from "@/components/catwatch/cat-watch-loading";

/**
 * Wraps the dashboard in the loading → ready → dashboard flow: the
 * full-screen CatWatchLoading overlay plays first; clicking its CTA fades
 * the card out while the dashboard fades and slides in underneath. The
 * overlay unmounts itself once its exit animation finishes.
 */
export function DashboardEntry({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false);
  return (
    <>
      <CatWatchLoading fullScreen onOpenDashboard={() => setEntered(true)} />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-700 ease-out motion-reduce:transition-none",
          entered
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0"
        )}
      >
        {children}
      </div>
    </>
  );
}
