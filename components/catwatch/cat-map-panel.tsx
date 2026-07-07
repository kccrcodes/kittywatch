"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Camera, LocateFixed, Minus, Plus, RefreshCw, Search } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

import { cn } from "@/lib/utils";
import type { MockCat, MockZone } from "@/lib/mock-data";
import { CAMPUS_CENTER, MAP_IMAGE_BOUNDS } from "@/lib/map-geometry";
import { fromApiCat, fromMockCat, type MapCat } from "@/lib/map-cats";
import { useCats } from "@/lib/use-cats";
import { Button } from "@/components/ui/button";
import { PawDoodle } from "@/components/catwatch/doodles";
import { SubmitSightingSheet } from "@/components/catwatch/submit-sighting-sheet";

/**
 * The map hero (design.md §6, issue #13): a Leaflet CRS.Simple map over the
 * illustrated campus PNG, wrapped in the CatWatch chrome (search, legend,
 * rounded controls, FAB).
 *
 * With `live` set, pins come from GET /api/cats with loading / empty /
 * error states (design.md §11 states pass); the `cats` prop then serves as
 * demo pins the user can fall back to (safe for video takes). Without
 * `live` (UI Lab), the mock pins render directly.
 *
 * Leaflet reads `window` at import, so the map layer loads via
 * `next/dynamic` with `ssr: false`; this shell stays SSR-safe.
 */
const CatMapLeaflet = dynamic(
  () =>
    import("@/components/catwatch/cat-map-leaflet").then(
      (m) => m.CatMapLeaflet
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-pulse bg-cream-soft"
      />
    ),
  }
);

export function CatMapPanel({
  cats,
  zones,
  className,
  live = false,
}: {
  /** Demo pins: rendered directly when not `live`, offered as fallback when `live`. */
  cats: MockCat[];
  zones: MockZone[];
  className?: string;
  /** Fetch real pins from GET /api/cats instead of rendering `cats`. */
  live?: boolean;
}) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSession, setSheetSession] = useState(0);
  const demoCats = useMemo(() => cats.map(fromMockCat), [cats]);
  const { query, refetch } = useCats(live && !showDemo ? CAMPUS_CENTER : null);

  const usingLiveData = live && !showDemo;
  const mapCats: MapCat[] = !usingLiveData
    ? demoCats
    : query.status === "ready"
      ? query.cats.map(fromApiCat)
      : [];

  return (
    <section
      aria-label="Community cat map"
      className={cn(
        "relative isolate min-h-[420px] overflow-hidden rounded-(--radius-lg) border border-border-soft bg-cream-soft shadow-(--shadow-soft)",
        className
      )}
    >
      <div className="absolute inset-0">
        <CatMapLeaflet cats={mapCats} onMapReady={setMap} />
      </div>

      {/* live-data states (design.md: every state designed) */}
      {usingLiveData && query.status === "loading" ? (
        <div
          role="status"
          className="absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border-soft bg-surface/95 px-3.5 py-2 text-xs font-semibold text-cocoa-body shadow-(--shadow-soft) backdrop-blur-sm"
        >
          <PawDoodle className="cw-motion cw-paw-pulse size-4 text-pink-400" />
          Finding kitties nearby...
        </div>
      ) : null}

      {usingLiveData && query.status === "error" ? (
        <div className="absolute left-1/2 top-1/2 z-[1000] w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-(--radius-md) border border-border-soft bg-surface/95 p-4 text-center shadow-(--shadow-lifted) backdrop-blur-sm">
          <p className="text-sm font-bold text-cocoa">
            Couldn&apos;t load the cat map
          </p>
          <p className="mt-1 text-xs text-cocoa-body">{query.message}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={refetch}
              className="rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowDemo(true)}
              className="rounded-full border border-border-soft font-bold"
            >
              Show demo pins
            </Button>
          </div>
        </div>
      ) : null}

      {usingLiveData && query.status === "ready" && query.cats.length === 0 ? (
        <div className="absolute left-1/2 top-1/2 z-[1000] w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-(--radius-md) border border-border-soft bg-surface/95 p-4 text-center shadow-(--shadow-lifted) backdrop-blur-sm">
          <PawDoodle className="mx-auto size-6 text-pink-300" />
          <p className="mt-2 text-sm font-bold text-cocoa">
            No cats on the map yet
          </p>
          <p className="mt-1 text-xs text-cocoa-body">
            Register the first kitty and give it a digital heartbeat — or
            explore with sample pins.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowDemo(true)}
            className="mt-3 rounded-full border border-border-soft font-bold"
          >
            Show demo pins
          </Button>
        </div>
      ) : null}

      {/* search */}
      <label className="absolute left-4 top-4 z-[1000] flex w-56 items-center gap-2 rounded-full border border-border-soft bg-surface/95 px-3.5 py-2 shadow-(--shadow-soft) backdrop-blur-sm sm:w-64">
        <Search className="size-4 shrink-0 text-cocoa-muted" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search campus locations..."
          className="w-full bg-transparent text-sm text-cocoa outline-none placeholder:text-cocoa-muted"
        />
      </label>

      {/* marker key */}
      <div className="absolute right-4 top-4 z-[1000] hidden flex-col gap-1.5 rounded-(--radius-md) border border-border-soft bg-surface/95 p-2.5 text-xs font-semibold text-cocoa-body shadow-(--shadow-soft) backdrop-blur-sm sm:flex">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-pink-400" />
          Recent Sighting
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-green-500" />
          Cat Home Base
        </span>
      </div>

      {/* zoom / locate */}
      <div className="absolute left-4 top-18 z-[1000] flex flex-col overflow-hidden rounded-(--radius-sm) border border-border-soft bg-surface shadow-(--shadow-soft)">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => map?.zoomIn()}
          className="flex size-9 items-center justify-center text-cocoa-body hover:bg-cream"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => map?.zoomOut()}
          className="flex size-9 items-center justify-center border-t border-border-soft text-cocoa-body hover:bg-cream"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Reset map view"
          onClick={() => map?.fitBounds(MAP_IMAGE_BOUNDS)}
          className="flex size-9 items-center justify-center border-t border-border-soft text-cocoa-body hover:bg-cream"
        >
          <LocateFixed className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* zone legend */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden rounded-(--radius-md) border border-border-soft bg-surface/95 p-3 shadow-(--shadow-soft) backdrop-blur-sm md:block">
        <p className="mb-2 text-xs font-bold text-cocoa">Campus Zones</p>
        <ul className="space-y-1.5">
          {zones.map((zone) => (
            <li
              key={zone.name}
              className="flex items-center gap-2 text-xs text-cocoa-body"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ background: zone.dot }}
              />
              {zone.name}
              <span className="ml-auto pl-3 font-semibold text-cocoa-muted">
                {zone.cats}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* report FAB → sighting sheet (#15) */}
      <button
        type="button"
        onClick={() => {
          setSheetSession((n) => n + 1); // fresh key = clean form each open
          setSheetOpen(true);
        }}
        className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-(--shadow-lifted) transition-colors hover:bg-pink-600"
      >
        <Camera className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Report a Sighting</span>
      </button>

      <SubmitSightingSheet
        key={sheetSession}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        cats={mapCats}
        onSubmitted={() => {
          if (usingLiveData) refetch();
        }}
      />

      <span className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-surface/80 px-2.5 py-1 text-[10px] font-medium text-cocoa-muted backdrop-blur-sm">
        {showDemo
          ? "Illustrated map · demo pins"
          : "Illustrated map — drag & zoom to explore"}
      </span>
    </section>
  );
}
