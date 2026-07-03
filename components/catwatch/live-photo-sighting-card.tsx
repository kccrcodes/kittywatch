import Image from "next/image";

import { cn } from "@/lib/utils";
import type { MockSighting } from "@/lib/mock-data";

/**
 * A row in the live sighting feed: real photo, who was spotted where,
 * and how long ago. Photos stay real and minimally styled — that's what
 * makes the feed feel alive (design.md §1).
 */
export function LivePhotoSightingCard({
  sighting,
  className,
}: {
  sighting: MockSighting;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span className="cw-motion absolute inset-0 rounded-full bg-pink-400/60 [animation:cw-pulse_2s_ease-in-out_infinite]" />
        <span className="relative size-2 rounded-full bg-pink-500" />
      </span>
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border-soft">
        <Image
          src={sighting.photoUrl}
          alt={`${sighting.catName} sighting photo`}
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-cocoa">
          <span className="font-bold">{sighting.catName}</span>{" "}
          <span className="text-cocoa-body">
            spotted at {sighting.spottedAt}
          </span>
        </p>
        <p className="truncate text-xs text-cocoa-muted">{sighting.note}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="relative hidden h-12 w-18 overflow-hidden rounded-(--radius-sm) border border-border-soft sm:block">
          <Image
            src={sighting.photoUrl}
            alt=""
            fill
            sizes="72px"
            className="object-cover"
          />
        </div>
        <span className="text-xs font-medium text-cocoa-muted">
          {sighting.timeAgo}
        </span>
      </div>
    </div>
  );
}
