import { cn } from "@/lib/utils";
import type { CatStatus } from "@/lib/mock-data";

/**
 * The "digital heartbeat" made visible (SPEC pitch: "every stray cat gets
 * a digital heartbeat — if it flatlines, the neighbourhood knows"). An ECG
 * trace that scrolls steadily for a cat that's being seen, slows its wave
 * for needs_attention, and lies flat for missing.
 *
 * Shape carries the meaning, not just colour (design.md §4): reduced
 * motion stops the scroll but a beat trace still reads alive vs the
 * missing flatline.
 */
const STROKE: Record<CatStatus, string> = {
  healthy: "var(--green-500)",
  needs_attention: "#d99a56",
  missing: "#c9827b",
};

/* One 120px beat cell, repeated 3× so the loop (translateX −120px) is seamless. */
const BEAT_CELL = "h34 l6 -11 l7 22 l6 -11 h67";
const BEAT_PATH = `M0 16 ${BEAT_CELL} ${BEAT_CELL} ${BEAT_CELL}`;

export function HeartbeatLine({
  status,
  className,
}: {
  status: CatStatus;
  className?: string;
}) {
  const flat = status === "missing";
  return (
    <svg
      viewBox="0 0 240 32"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-8 w-full overflow-hidden", className)}
    >
      {flat ? (
        <line
          x1="4"
          y1="16"
          x2="236"
          y2="16"
          stroke={STROKE.missing}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ) : (
        <g
          className={cn(
            "cw-motion cw-heartbeat",
            status === "needs_attention" && "[animation-duration:2.6s]"
          )}
        >
          <path
            d={BEAT_PATH}
            fill="none"
            stroke={STROKE[status]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}
