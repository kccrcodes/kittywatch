"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReIdReveal } from "@/components/catwatch/re-id-reveal";

/**
 * UI Lab demo for the re-ID reveal: the two scored outcomes side by side
 * (confident match vs flagged under REID_THRESHOLD), replayable with a
 * fresh mount. The score-unavailable case is plain text in the sighting
 * sheet, so it isn't animated here.
 */
export function ReIdRevealDemo() {
  const [run, setRun] = useState(0);

  return (
    <div key={run} className="space-y-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-(--radius-md) bg-cream-soft p-4">
          <ReIdReveal score={0.92} flagged={false} catName="Mochi" />
          <p className="mt-3 text-center text-[10px] font-semibold text-cocoa-muted">
            match_score 0.92 · ≥ threshold
          </p>
        </div>
        <div className="rounded-(--radius-md) bg-cream-soft p-4">
          <ReIdReveal score={0.55} flagged catName="Patches" />
          <p className="mt-3 text-center text-[10px] font-semibold text-cocoa-muted">
            match_score 0.55 · flagged (&lt; 0.70)
          </p>
        </div>
      </div>
      <div className="text-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setRun((n) => n + 1)}
          className="rounded-full border border-border-soft font-bold"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Replay reveal
        </Button>
      </div>
    </div>
  );
}
