"use client";

import { useCallback, useEffect, useState } from "react";

import { getCats, type ApiCat } from "@/lib/api";

export type CatsQuery =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; cats: ApiCat[] };

/**
 * Fetches map pins from GET /api/cats around a point. Pass `null` to skip
 * fetching entirely (demo/mock mode). `refetch` re-runs after an error.
 */
export function useCats(
  center: { lat: number; lng: number; radius?: number } | null
): { query: CatsQuery; refetch: () => void } {
  const [query, setQuery] = useState<CatsQuery>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const lat = center?.lat;
  const lng = center?.lng;
  const radius = center?.radius;

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    let cancelled = false;
    getCats({ lat, lng, radius })
      .then((cats) => {
        if (!cancelled) setQuery({ status: "ready", cats });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setQuery({
            status: "error",
            message: err instanceof Error ? err.message : "Something went wrong.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, radius, attempt]);

  // "loading" is the initial state; refetch (an event handler, where sync
  // setState is fine) resets it before re-running the effect.
  const refetch = useCallback(() => {
    setQuery({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);
  return { query, refetch };
}
