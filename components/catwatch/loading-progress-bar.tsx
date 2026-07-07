import { cn } from "@/lib/utils";
import { PawDoodle } from "@/components/catwatch/doodles";

/**
 * The CatWatch progress bar from the UI Lab loading card (design.md §8):
 * pale-pink pill track, pink gradient fill, and a paw marker riding the
 * fill edge — a sage paw inside a soft white bubble, per the loading-screen
 * reference. Set `celebrate` when loading completes for a tiny success pop.
 */
export function LoadingProgressBar({
  progress,
  celebrate = false,
  className,
}: {
  /** 0–100; the marker follows the fill edge. */
  progress: number;
  /** One-shot success bounce for the paw marker (ready state). */
  celebrate?: boolean;
  className?: string;
}) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("relative h-4 w-full rounded-full bg-[#f4e4de]", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500"
        style={{ width: `${clamped}%` }}
      />
      {/* positioning span keeps its translate; the inner span owns the pop
          animation so the two transforms never fight */}
      <span
        className="absolute top-1/2 -translate-y-1/2"
        style={{ left: `clamp(0px, calc(${clamped}% - 14px), calc(100% - 28px))` }}
      >
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full border border-pink-100 bg-white shadow-(--shadow-soft)",
            celebrate && "cw-paw-pop"
          )}
        >
          <PawDoodle className="size-3.5 text-green-500" />
        </span>
      </span>
    </div>
  );
}
