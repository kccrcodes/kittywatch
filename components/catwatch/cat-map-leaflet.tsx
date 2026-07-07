"use client";

import { useEffect, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CRS, divIcon, type Map as LeafletMap } from "leaflet";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import type { MapCat } from "@/lib/map-cats";
import {
  MAP_IMAGE_BOUNDS,
  MAP_IMAGE_URL,
  projectToImage,
} from "@/lib/map-geometry";
import { CatFaceDoodle } from "@/components/catwatch/doodles";
import { MapMarker } from "@/components/catwatch/map-marker";
import { StatusBadge } from "@/components/catwatch/status-badge";

/**
 * The interactive illustrated map (issue #13, phase 1): Leaflet in
 * CRS.Simple over the campus illustration as an ImageOverlay — an image
 * map with pixel coordinates, NOT a geographic basemap. Real GPS tiles are
 * a later phase; positions here are schematic by design.
 *
 * Client-only: Leaflet touches `window` at import, so this module must be
 * loaded with `next/dynamic` + `ssr: false` (see `cat-map-panel.tsx`).
 * Markers reuse the existing `MapMarker` pins via `divIcon`; popups are
 * real React children (name, status, zone, last seen).
 */

/** Static decorations, carried over from the placeholder map. */
const HOME_BASES = [
  { id: "home-utown", lat: 1.3055, lng: 103.7735 },
  { id: "home-kr", lat: 1.2928, lng: 103.7785 },
];

const RECENT_DOTS = [
  { id: "dot-1", lat: 1.2995, lng: 103.7762 },
  { id: "dot-2", lat: 1.2938, lng: 103.7718 },
  { id: "dot-3", lat: 1.3028, lng: 103.7752 },
];

/** Wraps a React node as a Leaflet divIcon, anchored at the latlng. */
function nodeIcon(node: React.ReactElement, translate: string) {
  return divIcon({
    html: `<div style="transform: translate(${translate}); width: max-content;">${renderToStaticMarkup(node)}</div>`,
    className: "cw-map-divicon",
    iconSize: [0, 0],
  });
}

/** Keeps Leaflet's size in sync with the responsive panel. */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

/**
 * Dev-only calibration helper: click anywhere on the map and the
 * CRS.Simple coordinate is logged, ready to paste into a cat's
 * `mapPosition` in `lib/mock-data.ts`.
 */
function DevClickLogger() {
  useMapEvents({
    click(e) {
      console.log(
        `map click → mapPosition: [${Math.round(e.latlng.lat)}, ${Math.round(e.latlng.lng)}]`
      );
    },
  });
  return null;
}

export function CatMapLeaflet({
  cats,
  onMapReady,
}: {
  cats: MapCat[];
  onMapReady?: (map: LeafletMap) => void;
}) {
  const catMarkers = useMemo(
    () =>
      cats.map((cat) => ({
        cat,
        position: cat.mapPosition ?? projectToImage(cat.lat, cat.lng),
        icon: nodeIcon(
          <MapMarker
            variant="cat"
            status={cat.status}
            tint={cat.tint}
            label={cat.status === "missing" ? `${cat.name} — missing` : cat.name}
          />,
          "-50%, -100%"
        ),
      })),
    [cats]
  );

  const homeIcon = useMemo(
    () => nodeIcon(<MapMarker variant="home" />, "-50%, -100%"),
    []
  );
  const sightingIcon = useMemo(
    () => nodeIcon(<MapMarker variant="sighting" />, "-50%, -50%"),
    []
  );

  return (
    <MapContainer
      ref={(map) => {
        if (map) onMapReady?.(map);
      }}
      crs={CRS.Simple}
      bounds={MAP_IMAGE_BOUNDS}
      maxBounds={MAP_IMAGE_BOUNDS}
      maxBoundsViscosity={1}
      minZoom={-1}
      maxZoom={2}
      zoomSnap={0.1}
      zoomDelta={0.5}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <ImageOverlay url={MAP_IMAGE_URL} bounds={MAP_IMAGE_BOUNDS} />
      <MapResizer />
      {process.env.NODE_ENV === "development" ? <DevClickLogger /> : null}

      {HOME_BASES.map((base) => (
        <Marker
          key={base.id}
          position={projectToImage(base.lat, base.lng)}
          icon={homeIcon}
        >
          <Popup className="cw-map-popup" offset={[0, -46]} closeButton={false}>
            <p className="text-xs font-semibold text-cocoa-body">
              Cat home base — food & shelter spot
            </p>
          </Popup>
        </Marker>
      ))}

      {RECENT_DOTS.map((dot) => (
        <Marker
          key={dot.id}
          position={projectToImage(dot.lat, dot.lng)}
          icon={sightingIcon}
        >
          <Popup className="cw-map-popup" offset={[0, -10]} closeButton={false}>
            <p className="text-xs font-semibold text-cocoa-body">
              Recent sighting reported here
            </p>
          </Popup>
        </Marker>
      ))}

      {catMarkers.map(({ cat, position, icon }) => (
        <Marker
          key={cat.id}
          position={position}
          icon={icon}
          zIndexOffset={cat.status === "missing" ? 500 : 0}
        >
          <Popup className="cw-map-popup" offset={[0, -48]} closeButton={false}>
            <div className="flex items-center gap-3">
              {cat.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- small avatar in a Leaflet popup
                <img
                  src={cat.photoUrl}
                  alt={cat.name}
                  className="size-12 shrink-0 rounded-(--radius-sm) border border-border-soft object-cover"
                />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-(--radius-sm) border border-border-soft bg-cream">
                  <CatFaceDoodle tint={cat.tint} className="size-9" />
                </span>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-cocoa">{cat.name}</p>
                  <StatusBadge status={cat.status} />
                </div>
                <p className="text-xs font-medium text-cocoa-muted">
                  {[cat.locationLabel, `last seen ${cat.lastSeenLabel}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
