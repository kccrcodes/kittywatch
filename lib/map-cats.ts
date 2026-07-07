/**
 * View model for map pins: one shape the Leaflet layer renders, with
 * converters from both data sources — live `GET /api/cats` pins and the
 * UI Lab's mock cats. Keeps `cat-map-leaflet.tsx` ignorant of where the
 * data came from.
 */

import type { ApiCat } from "@/lib/api";
import type { CatStatus, MockCat } from "@/lib/mock-data";
import { timeAgo } from "@/lib/format";

export interface MapCat {
  id: string;
  name: string;
  status: CatStatus;
  lat: number;
  lng: number;
  /** Pastel fill for the cat-face pin (design.md §6). */
  tint: string;
  /** e.g. "10m ago" · "3 days ago" · "not seen yet" */
  lastSeenLabel: string;
  /** Zone name for mock cats; live pins don't carry one. */
  locationLabel?: string;
  photoUrl?: string;
  /** Optional calibrated CRS.Simple override (see lib/map-geometry.ts). */
  mapPosition?: [number, number];
}

/** Deterministic pastel per cat so pins keep their colour across reloads. */
const PIN_TINTS = [
  "var(--pink-200)",
  "var(--blue-soft)",
  "var(--orange-soft)",
  "var(--green-200)",
  "var(--yellow-soft)",
];

function tintFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return PIN_TINTS[Math.abs(hash) % PIN_TINTS.length];
}

export function fromApiCat(cat: ApiCat): MapCat {
  return {
    id: cat.id,
    name: cat.name ?? "Unnamed kitty",
    status: cat.status,
    lat: cat.lat,
    lng: cat.lng,
    tint: tintFor(cat.id),
    lastSeenLabel: timeAgo(cat.last_seen_at) ?? "not seen yet",
    photoUrl: cat.thumbnail_url ?? undefined,
  };
}

export function fromMockCat(cat: MockCat): MapCat {
  return {
    id: cat.id,
    name: cat.name,
    status: cat.status,
    lat: cat.lat,
    lng: cat.lng,
    tint: cat.tint,
    lastSeenLabel: cat.lastSeen,
    locationLabel: cat.zone,
    photoUrl: cat.photoUrl,
    mapPosition: cat.mapPosition,
  };
}
