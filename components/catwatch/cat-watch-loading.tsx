"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedCat } from "@/components/catwatch/animated-cat";
import { LoadingProgressBar } from "@/components/catwatch/loading-progress-bar";
import { LeafDoodle, PawDoodle } from "@/components/catwatch/doodles";

type Phase = "loading" | "ready" | "leaving" | "gone";

const EXIT_MS = 520;

/**
 * Branded loading screen (design.md §8 / references/loading screen.png):
 * cream base, pink blob corners, drifting leaf + pulsing paw doodles, an
 * outlined card with the hand-drawn animated cat, and the UI Lab progress
 * bar (pink fill, pale track, sage paw marker in a white bubble).
 *
 * Runs a 3-phase flow on mount: progress fills 0→100 over ~2.8s (loading),
 * then the CTA appears (ready); clicking it fades the card out, fires
 * `onOpenDashboard`, and the component renders null once the exit ends.
 *
 * The card is ONE stable layout across phases — the cat stays mounted, the
 * status/subtitle swaps happen inside fixed-height slots via crossfade, and
 * the CTA row reserves its space from the start (hidden with opacity +
 * transform + pointer-events) — so nothing jumps when loading turns ready.
 * Looping motion respects prefers-reduced-motion; progress and the CTA
 * still work there.
 */
export function CatWatchLoading({
  title = "KittyWatch",
  loadingMessage = "Looking for kitties nearby...",
  readyMessage = "Kitties found nearby",
  readyTitle = "Ready!",
  ctaLabel = "Open the dashboard",
  duration = 2800,
  fullScreen = false,
  className,
  onOpenDashboard,
  onExited,
}: {
  /** App title shown in the card, above the status heading. */
  title?: string;
  loadingMessage?: string;
  readyMessage?: string;
  readyTitle?: string;
  ctaLabel?: string;
  /** Milliseconds for the 0→100 progress fill. */
  duration?: number;
  fullScreen?: boolean;
  className?: string;
  /** Fired when the CTA is clicked, as the card starts fading out. */
  onOpenDashboard?: () => void;
  /** Fired once the exit animation finishes and the screen unmounts itself. */
  onExited?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setProgress(eased * 100);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("ready");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const id = window.setTimeout(() => {
      setPhase("gone");
      onExited?.();
    }, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [phase, onExited]);

  if (phase === "gone") return null;

  const ready = phase === "ready" || phase === "leaving";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden bg-[#fbece6] transition-opacity duration-500",
        fullScreen
          ? "fixed inset-0 z-50"
          : "min-h-[420px] w-full rounded-(--radius-lg) py-10",
        phase === "leaving" && "pointer-events-none opacity-0",
        className
      )}
    >
      {/* soft pink blob corners */}
      <div className="absolute -top-24 -left-24 size-72 rounded-full bg-pink-200/80 blur-2xl" />
      <div className="absolute -right-28 -bottom-28 size-80 rounded-full bg-pink-200/80 blur-2xl" />
      <div className="absolute -right-10 top-1/4 size-24 rounded-full bg-pink-100 blur-xl" />

      {/* drifting leaves */}
      <span className="absolute left-[12%] top-[38%] -rotate-12">
        <LeafDoodle className="cw-motion cw-leaf-drift size-6 opacity-70" />
      </span>
      <span className="absolute right-[10%] top-[14%] rotate-45">
        <LeafDoodle className="cw-motion cw-leaf-drift size-7 opacity-70 [animation-delay:1.4s]" />
      </span>
      <span className="absolute bottom-[12%] left-[18%] rotate-12">
        <LeafDoodle className="cw-motion cw-leaf-drift size-6 opacity-60 [animation-delay:2.6s]" />
      </span>

      {/* pulsing paw prints */}
      <span className="absolute left-[22%] top-[16%] -rotate-12">
        <PawDoodle className="cw-motion cw-paw-pulse size-5 text-pink-300/80" />
      </span>
      <span className="absolute right-[20%] bottom-[22%] rotate-12">
        <PawDoodle className="cw-motion cw-paw-pulse size-5 text-pink-300/80 [animation-delay:1.1s]" />
      </span>

      {/* tiny pink dots */}
      <span className="absolute left-[38%] top-[10%] size-2 rounded-full bg-pink-300/70" />
      <span className="absolute right-[30%] top-[42%] size-1.5 rounded-full bg-pink-300/70" />
      <span className="absolute bottom-[16%] right-[42%] size-2 rounded-full bg-pink-300/60" />
      <span className="absolute bottom-[30%] left-[8%] size-1.5 rounded-full bg-pink-300/60" />

      {/* card — one stable layout for every phase; only text/classes change */}
      <div
        className={cn(
          "relative z-10 mx-4 w-full max-w-lg rounded-(--radius-2xl) border-[2.5px] border-cocoa-line bg-surface px-8 py-10 text-center shadow-(--shadow-lifted) sm:px-12",
          phase === "leaving" && "cw-card-out"
        )}
      >
        <AnimatedCat className="mx-auto w-44" />

        <p className="mt-5 font-display text-4xl font-semibold text-cocoa">
          {title}
        </p>

        {/* status heading slot — fixed height, states stacked + crossfaded */}
        <div className="mt-2 grid h-9 place-items-center font-display text-2xl font-medium text-cocoa">
          <span
            aria-hidden={ready}
            className={cn(
              "cw-swap col-start-1 row-start-1",
              ready ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            Loading
            <span aria-hidden="true">.</span>
            <span aria-hidden="true" className="cw-motion cw-dot-2">
              .
            </span>
            <span aria-hidden="true" className="cw-motion cw-dot-3">
              .
            </span>
          </span>
          <span
            aria-hidden={!ready}
            className={cn(
              "cw-swap col-start-1 row-start-1",
              ready ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            )}
          >
            {readyTitle}
          </span>
        </div>

        <LoadingProgressBar
          progress={progress}
          celebrate={ready}
          className="mt-4"
        />

        {/* subtitle slot — fixed height, crossfaded */}
        <div className="mt-4 grid h-6 place-items-center text-sm font-semibold text-cocoa-body">
          <span
            aria-hidden={ready}
            className={cn(
              "cw-swap col-start-1 row-start-1 inline-flex items-center gap-1.5",
              ready ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            {loadingMessage}
            <Heart
              className="size-3.5 fill-pink-400 text-pink-400"
              aria-hidden="true"
            />
          </span>
          <span
            aria-hidden={!ready}
            className={cn(
              "cw-swap col-start-1 row-start-1 inline-flex items-center gap-1.5",
              ready ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            )}
          >
            {readyMessage}
            <Heart
              className="size-3.5 fill-pink-400 text-pink-400"
              aria-hidden="true"
            />
          </span>
        </div>

        {/* CTA slot — height reserved from the start so the card never grows */}
        <div className="mt-5 flex h-10 items-center justify-center">
          <Button
            size="lg"
            aria-hidden={!ready}
            tabIndex={ready ? undefined : -1}
            onClick={() => {
              if (phase !== "ready") return;
              setPhase("leaving");
              onOpenDashboard?.();
            }}
            className={cn(
              "cw-swap rounded-full bg-pink-500 px-6 font-bold text-white hover:bg-pink-600",
              ready
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-1 opacity-0"
            )}
          >
            {ctaLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
