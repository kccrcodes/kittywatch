import { cn } from "@/lib/utils";
import type { ApiSightingEntry, SightingStatus } from "@/lib/api";
import { timeAgo } from "@/lib/format";

/**
 * Sighting history for the profile sheet: GET /api/cats/[id]'s
 * `sightings` array (newest first), each row a photo, status chip,
 * optional note + match score, and how long ago. When the cat is missing,
 * the history opens with a quiet "gone silent" gap so the timeline itself
 * tells the story (#21).
 */
const CHIP: Record<SightingStatus, { label: string; className: string }> = {
  healthy: { label: "Healthy", className: "bg-green-100 text-green-600" },
  injured: { label: "Injured", className: "bg-yellow-soft text-[#7a5a2e]" },
  not_found: { label: "Not found", className: "bg-red-soft/60 text-[#8f3a34]" },
};

export function SightingTimeline({
  sightings,
  missing = false,
  className,
}: {
  sightings: ApiSightingEntry[];
  /** Adds the "gone quiet" gap header when the cat is missing. */
  missing?: boolean;
  className?: string;
}) {
  if (sightings.length === 0) {
    return (
      <p className={cn("rounded-(--radius-md) bg-cream px-4 py-5 text-center text-xs text-cocoa-muted", className)}>
        No sightings logged yet.
      </p>
    );
  }

  const lastSeen = timeAgo(sightings[0].created_at);

  return (
    <div className={cn("divide-y divide-border-soft", className)}>
      {missing && lastSeen ? (
        <p className="rounded-(--radius-sm) border border-dashed border-red-soft bg-red-soft/20 px-3 py-2.5 text-center text-xs font-semibold text-[#8f3a34]">
          The trail goes quiet here — nothing since {lastSeen}.
        </p>
      ) : null}
      {sightings.map((sighting) => {
        const chip = sighting.status_update ? CHIP[sighting.status_update] : null;
        return (
          <div key={sighting.id} className="flex items-center gap-3 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- Storage photo thumb */}
            <img
              src={sighting.photo_url}
              alt=""
              className="size-11 shrink-0 rounded-(--radius-sm) border border-border-soft object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {chip ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      chip.className
                    )}
                  >
                    {chip.label}
                  </span>
                ) : null}
                {sighting.match_score !== null ? (
                  <span className="text-[10px] font-semibold text-cocoa-muted">
                    {Math.round(sighting.match_score * 100)}% match
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-cocoa-body">
                {sighting.notes ?? "Spotted and logged"}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-cocoa-muted">
              {timeAgo(sighting.created_at)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
