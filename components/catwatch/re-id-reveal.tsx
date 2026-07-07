"use client";

import { useEffect, useId, useState } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { REID_THRESHOLD } from "@/lib/config";

/**
 * The re-ID match reveal (#19) — design.md §7's "single most demo-able
 * animation": a ring fills to the CLIP match score while the number counts
 * up, then pops and lands on the verdict. Pure React state + rAF + the
 * existing one-shot keyframes; no animation libraries.
 *
 * Visual language stays on the UI Lab progress bar's tokens: the same pale
 * pink track (#f4e4de) and the design.md §8 progress gradient
 * (pink-400 → pink-500) for a confident match; needs-attention amber when
 * the score fell under REID_THRESHOLD and the sighting was flagged. A tick
 * on the ring marks the threshold so "why flagged" is visible, not just
 * stated. Reduced motion skips straight to the final state.
 *
 * Screen readers get the final verdict immediately (sr-only); the animated
 * ring and counter are aria-hidden.
 */
export function ReIdReveal({
  score,
  flagged,
  catName,
  className,
}: {
  /** Raw match_score from POST /api/sightings (0–1). */
  score: number;
  /** Server verdict: true when score < REID_THRESHOLD. */
  flagged: boolean;
  catName: string;
  className?: string;
}) {
  const gradientId = useId();
  const target = Math.min(Math.max(score, 0), 1);
  const { value, done } = useCountUp(target, 1700);

  const RADIUS = 54;
  const circumference = 2 * Math.PI * RADIUS;
  const percent = Math.round(value * 100);
  const finalPercent = Math.round(target * 100);
  const thresholdAngle = REID_THRESHOLD * 360;

  return (
    <div className={cn("text-center", className)}>
      <p className="sr-only" role="status">
        {flagged
          ? `${finalPercent}% match — this photo doesn't confidently match ${catName}; a caretaker will double-check it.`
          : `${finalPercent}% match — looks like ${catName}! Sighting logged.`}
      </p>

      <div
        aria-hidden="true"
        className={cn("relative mx-auto size-36", done && "cw-paw-pop")}
      >
        <svg viewBox="0 0 132 132" className="size-full -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              {flagged ? (
                <>
                  <stop offset="0%" stopColor="var(--orange-soft)" />
                  <stop offset="100%" stopColor="#dd9a5b" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="var(--pink-400)" />
                  <stop offset="100%" stopColor="var(--pink-500)" />
                </>
              )}
            </linearGradient>
          </defs>
          {/* track — same pale pink as the loading bar */}
          <circle cx="66" cy="66" r={RADIUS} fill="none" stroke="#f4e4de" strokeWidth="10" />
          {/* REID_THRESHOLD tick: the "flagged below this" line */}
          <line
            x1={66 + RADIUS - 8}
            y1="66"
            x2={66 + RADIUS + 8}
            y2="66"
            stroke="var(--line-brown)"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${thresholdAngle} 66 66)`}
          />
          {/* fill */}
          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-semibold text-cocoa">
            {percent}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-cocoa-muted">
            match
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "mt-3 transition-opacity duration-300",
          done ? "cw-rise opacity-100" : "opacity-0"
        )}
      >
        {flagged ? (
          <p className="mx-auto max-w-xs rounded-(--radius-md) bg-yellow-soft/70 px-3 py-2 text-xs font-semibold text-[#7a5a2e]">
            Hmm, that photo doesn&apos;t confidently match {catName} — a
            caretaker will double-check this one.
          </p>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
            <Sparkles className="size-4" aria-hidden="true" />
            Looks like {catName}! Sighting logged.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * rAF count-up with ease-out; ring offset and counter derive from the same
 * value so they can never drift. Honours prefers-reduced-motion by jumping
 * straight to the target (still via one rAF so no sync setState in effect).
 */
function useCountUp(target: number, durationMs: number) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      raf = requestAnimationFrame(() => {
        setValue(target);
        setDone(true);
      });
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - t) ** 3;
      setValue(target * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return { value, done };
}
