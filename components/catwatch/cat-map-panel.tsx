"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Camera, LocateFixed, Minus, Plus, Search } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

import { cn } from "@/lib/utils";
import type { MockCat, MockZone } from "@/lib/mock-data";
import { MAP_IMAGE_BOUNDS } from "@/lib/map-geometry";

/**
 * The map hero (design.md §6, issue #13 phase 1): a real Leaflet map in
 * CRS.Simple over the illustrated campus PNG — interactive pan/zoom with
 * cat-face pins, home-base pins, pulsing sighting dots and popup cards —
 * wrapped in the CatWatch chrome (search, legend, rounded controls, FAB).
 *
 * Leaflet reads `window` at import, so the map layer loads via
 * `next/dynamic` with `ssr: false`; this shell stays SSR-safe (it only
 * imports Leaflet types, which erase at compile time).
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
}: {
  cats: MockCat[];
  zones: MockZone[];
  className?: string;
}) {
  const [map, setMap] = useState<LeafletMap | null>(null);

  return (
    <section
      aria-label="Community cat map"
      className={cn(
        "relative isolate min-h-[420px] overflow-hidden rounded-(--radius-lg) border border-border-soft bg-cream-soft shadow-(--shadow-soft)",
        className
      )}
    >
      <div className="absolute inset-0">
        <CatMapLeaflet cats={cats} onMapReady={setMap} />
      </div>

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

      {/* report FAB */}
      <button
        type="button"
        className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-(--shadow-lifted) transition-colors hover:bg-pink-600"
      >
        <Camera className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Report a Sighting</span>
      </button>

      <span className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-surface/80 px-2.5 py-1 text-[10px] font-medium text-cocoa-muted backdrop-blur-sm">
        Illustrated map — drag &amp; zoom to explore
      </span>
    </section>
  );
}
