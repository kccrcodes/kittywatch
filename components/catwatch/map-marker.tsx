import { Home } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CatStatus } from "@/lib/mock-data";
import { CatFaceDoodle } from "@/components/catwatch/doodles";

/**
 * Map pins per design.md §6: pastel cat-face pin (known cat), green house
 * pin (home base), pulsing pink dot (recent sighting). Status is expressed
 * with a ring *and* the pin body so it never relies on colour alone.
 */
export type MapMarkerProps = {
  variant?: "cat" | "home" | "sighting";
  status?: CatStatus;
  tint?: string;
  label?: string;
  className?: string;
};

const statusRing: Record<CatStatus, string> = {
  healthy: "border-green-400 bg-green-100",
  needs_attention: "border-orange-soft bg-yellow-soft/70",
  missing: "border-pink-500 bg-red-soft/70",
};

export function MapMarker({
  variant = "cat",
  status = "healthy",
  tint = "var(--pink-200)",
  label,
  className,
}: MapMarkerProps) {
  if (variant === "sighting") {
    return (
      <span className={cn("relative inline-flex size-3", className)} title={label}>
        <span className="cw-motion absolute inset-0 rounded-full bg-pink-400/70 [animation:cw-pulse_1.8s_ease-in-out_infinite]" />
        <span className="relative size-3 rounded-full border-2 border-white bg-pink-400 shadow-(--shadow-soft)" />
      </span>
    );
  }

  const teardrop =
    "flex size-10 -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] border-[2.5px] shadow-(--shadow-soft)";

  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <span className="relative">
        {variant === "cat" && status === "missing" ? (
          <span className="cw-motion absolute -inset-1.5 rounded-full bg-red-soft/70 [animation:cw-pulse_1.6s_ease-in-out_infinite]" />
        ) : null}
        {variant === "home" ? (
          <span className={cn(teardrop, "relative border-green-600/60 bg-green-500")}>
            <Home className="size-4 rotate-45 text-white" aria-hidden="true" />
          </span>
        ) : (
          <span className={cn(teardrop, "relative", statusRing[status])}>
            <span className="rotate-45">
              <CatFaceDoodle tint={tint} className="size-6" />
            </span>
          </span>
        )}
      </span>
      {label ? (
        <span className="mt-1.5 rounded-full border border-border-soft bg-surface/95 px-2 py-0.5 text-[10px] font-semibold text-cocoa-body shadow-(--shadow-soft)">
          {label}
        </span>
      ) : null}
    </span>
  );
}
