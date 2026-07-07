/**
 * Typed client for the CatWatch API — the exact shapes from docs/SPEC.md
 * §"API contract" (kept in sync with the routes by PR #52). UI components
 * import from here instead of hand-rolling fetch calls, so the contract
 * lives in one place.
 *
 * Photo flow reminder: upload the image with `uploadCatPhoto()` first and
 * pass the returned Storage URL — the API rejects any other `photo_url`.
 */

import type { CatStatus } from "@/lib/mock-data";

/** GET /api/cats item — everything a map pin needs, nothing heavier. */
export interface ApiCat {
  id: string;
  name: string | null;
  status: CatStatus;
  lat: number;
  lng: number;
  last_seen_at: string | null;
  thumbnail_url: string | null;
}

export type SightingStatus = "healthy" | "injured" | "not_found";

/** Entry in GET /api/cats/[id]'s `sightings` array, newest first. */
export interface ApiSightingEntry {
  id: string;
  photo_url: string;
  status_update: SightingStatus | null;
  notes: string | null;
  match_score: number | null;
  submitted_by_name: string | null;
  created_at: string;
}

/** GET /api/cats/[id] — the full profile for the bottom sheet. */
export interface ApiCatProfile {
  id: string;
  name: string | null;
  breed: string | null;
  estimated_age: string | null;
  vaccinated: boolean;
  tnr: boolean;
  status: CatStatus;
  last_seen_at: string | null;
  lat: number;
  lng: number;
  sightings: ApiSightingEntry[];
}

/** POST /api/sightings response — feeds the re-ID reveal. */
export interface ApiSightingResult {
  id: string;
  cat_id: string;
  /** null when CLIP is unavailable or the cat has no prior embedding. */
  match_score: number | null;
  /** true when match_score < REID_THRESHOLD — show the "flagged" state. */
  flagged: boolean;
  status_update: SightingStatus;
  created_at: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON error body; fall through to the status-based message
  }
  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return body as T;
}

/** Cats in a bounding box around lat/lng (radius in metres, default 5km). */
export function getCats(params: {
  lat: number;
  lng: number;
  radius?: number;
}): Promise<ApiCat[]> {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
  });
  if (params.radius) query.set("radius", String(params.radius));
  return request<ApiCat[]>(`/api/cats?${query}`);
}

export function getCat(id: string): Promise<ApiCatProfile> {
  return request<ApiCatProfile>(`/api/cats/${encodeURIComponent(id)}`);
}

export function postSighting(input: {
  cat_id: string;
  photo_url: string;
  status_update: SightingStatus;
  notes?: string;
}): Promise<ApiSightingResult> {
  return request<ApiSightingResult>("/api/sightings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
