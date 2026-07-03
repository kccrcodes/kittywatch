import { Heart, PawPrint } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CatWalkDoodle,
  LeafDoodle,
  PawDoodle,
} from "@/components/catwatch/doodles";

/**
 * Branded loading screen (design.md §8 / references/loading-screen.png):
 * cream base, pink blob corners, leaf + paw doodles, outlined card with a
 * hand-drawn cat, and a pink progress bar with a green paw knob.
 *
 * Pass `progress` (0–100) for a determinate bar; omit it for a gentle
 * indeterminate crawl. Animations respect prefers-reduced-motion.
 */
export function CatWatchLoading({
  title = "Loading...",
  message = "Looking for kitties nearby...",
  progress,
  fullScreen = false,
  className,
}: {
  title?: string;
  message?: string;
  progress?: number;
  fullScreen?: boolean;
  className?: string;
}) {
  const determinate = typeof progress === "number";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden bg-[#fbece6]",
        fullScreen
          ? "fixed inset-0 z-50"
          : "min-h-[420px] w-full rounded-(--radius-lg)",
        className
      )}
    >
      {/* soft pink blob corners */}
      <div className="absolute -top-24 -left-24 size-72 rounded-full bg-pink-200/80 blur-2xl" />
      <div className="absolute -right-28 -bottom-28 size-80 rounded-full bg-pink-200/80 blur-2xl" />
      <div className="absolute -right-10 top-1/4 size-24 rounded-full bg-pink-100 blur-xl" />

      {/* scattered doodles */}
      <LeafDoodle className="absolute left-[12%] top-[38%] size-6 -rotate-12 opacity-70" />
      <LeafDoodle className="absolute right-[10%] top-[14%] size-7 rotate-45 opacity-70" />
      <LeafDoodle className="absolute bottom-[12%] left-[18%] size-6 rotate-12 opacity-60" />
      <PawDoodle className="absolute left-[22%] top-[16%] size-5 -rotate-12 text-pink-300/80" />
      <PawDoodle className="absolute right-[20%] bottom-[22%] size-5 rotate-12 text-pink-300/80" />
      <span className="absolute left-[38%] top-[10%] size-2 rounded-full bg-pink-300/70" />
      <span className="absolute right-[30%] top-[42%] size-1.5 rounded-full bg-pink-300/70" />
      <span className="absolute bottom-[16%] right-[42%] size-2 rounded-full bg-pink-300/60" />
      <span className="absolute bottom-[30%] left-[8%] size-1.5 rounded-full bg-pink-300/60" />

      {/* card */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-(--radius-xl) border-[2.5px] border-cocoa-line bg-surface px-8 py-10 text-center shadow-(--shadow-lifted) sm:px-12">
        <CatWalkDoodle className="cw-motion mx-auto h-24 w-40 [animation:cw-bob_2.6s_ease-in-out_infinite]" />
        <p className="mt-4 font-display text-3xl font-semibold text-cocoa">
          {title}
        </p>

        <div
          className="mt-6 h-3.5 w-full rounded-full bg-[#f4e4de]"
          aria-hidden="true"
        >
          <div
            className={cn(
              "relative h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500",
              !determinate && "cw-motion [animation:cw-progress_2.8s_ease-in-out_infinite_alternate]"
            )}
            style={determinate ? { width: `${Math.min(Math.max(progress, 0), 100)}%` } : { width: "70%" }}
          >
            <span className="absolute -right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-(--shadow-soft)">
              <PawPrint className="size-3 text-white" aria-hidden="true" />
            </span>
          </div>
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa-body">
          {message}
          <Heart
            className="size-3.5 fill-pink-400 text-pink-400"
            aria-hidden="true"
          />
        </p>
      </div>
    </div>
  );
}
