"use client";

import type { ApiCat } from "@/lib/api";
import type { MockAlert } from "@/lib/mock-data";
import { CAMPUS_CENTER } from "@/lib/map-geometry";
import { daysSince, timeAgo } from "@/lib/format";
import { useCats } from "@/lib/use-cats";
import { AlertsPanel } from "@/components/catwatch/alerts-panel";
import { Panel } from "@/components/catwatch/panel";
import { Bell, Heart } from "lucide-react";

const FALLBACK_PHOTO = "https://placecats.com/neo/200/200";

/**
 * Alerts derived client-side from GET /api/cats — there's no alerts read
 * endpoint yet (the cron writes rows nobody serves), so the "neighbourhood
 * knows" panel reflects live cat status instead: missing cats become
 * high-severity alerts, needs_attention cats medium. Renders through the
 * existing AlertsPanel so UI Lab's mock version stays the visual contract.
 */
function toAlert(cat: ApiCat): MockAlert {
  const name = cat.name ?? "Unnamed kitty";
  const days = daysSince(cat.last_seen_at);
  const lastSeen = timeAgo(cat.last_seen_at);
  const missing = cat.status === "missing";
  return {
    id: `alert-${cat.id}`,
    catName: name,
    photoUrl: cat.thumbnail_url ?? FALLBACK_PHOTO,
    title: missing
      ? days !== null && days > 0
        ? `${name} hasn't been seen for ${days} ${days === 1 ? "day" : "days"}`
        : `${name} hasn't been seen in a while`
      : `${name} was flagged as needs care`,
    meta: lastSeen ? `Last seen ${lastSeen}` : "No sightings logged yet",
    severity: missing ? "high" : "medium",
  };
}

export function LiveAlertsPanel({
  fallback,
  className,
}: {
  /** Demo alerts shown if the live fetch fails (video-safe). */
  fallback: MockAlert[];
  className?: string;
}) {
  const { query } = useCats(CAMPUS_CENTER);

  if (query.status === "loading") {
    return (
      <Panel
        title="Alerts"
        icon={<Bell className="size-4" aria-hidden="true" />}
        className={className}
        contentClassName="space-y-2.5"
      >
        <span className="block h-14 animate-pulse rounded-(--radius-md) bg-cream-soft" />
        <span className="block h-14 animate-pulse rounded-(--radius-md) bg-cream-soft" />
      </Panel>
    );
  }

  if (query.status === "error") {
    return <AlertsPanel alerts={fallback} className={className} />;
  }

  const alerts = query.cats
    .filter((cat) => cat.status === "missing" || cat.status === "needs_attention")
    .sort((a, b) => (a.status === "missing" ? -1 : 0) - (b.status === "missing" ? -1 : 0))
    .map(toAlert);

  if (alerts.length === 0) {
    return (
      <Panel
        title="Alerts"
        icon={<Bell className="size-4" aria-hidden="true" />}
        className={className}
      >
        <p className="flex items-center justify-center gap-1.5 rounded-(--radius-md) bg-green-100 px-3 py-4 text-center text-xs font-semibold text-green-600">
          <Heart className="size-3.5 fill-green-400 text-green-400" aria-hidden="true" />
          All heartbeats steady — every kitty accounted for.
        </p>
      </Panel>
    );
  }

  return <AlertsPanel alerts={alerts} className={className} />;
}
