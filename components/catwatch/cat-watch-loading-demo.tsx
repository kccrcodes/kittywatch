"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { mockStats } from "@/lib/mock-data";
import { CatWatchLoading } from "@/components/catwatch/cat-watch-loading";
import { StatCard } from "@/components/catwatch/stat-card";

/**
 * UI Lab demo of the full loading → ready → dashboard flow: the loading
 * card plays inline, and after the CTA's exit animation a small dashboard
 * preview slides in. Replay restarts the flow with a fresh mount.
 */
export function CatWatchLoadingDemo() {
  const [run, setRun] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return (
      <CatWatchLoading
        key={run}
        className="min-h-[380px]"
        onExited={() => setShowDashboard(true)}
      />
    );
  }

  return (
    <div className="cw-rise flex min-h-[380px] flex-col justify-center gap-4 rounded-(--radius-lg) bg-cream p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium text-cocoa">
          Dashboard
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowDashboard(false);
            setRun((n) => n + 1);
          }}
          className="rounded-full border border-border-soft font-bold"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Replay loading
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mockStats.slice(0, 4).map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </div>
  );
}
