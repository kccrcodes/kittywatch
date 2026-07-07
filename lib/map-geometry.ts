/**
 * Coordinate system of the illustrated campus map (leaflet-free so the
 * SSR-safe panel shell can import it without touching Leaflet).
 *
 * The map is an interactive image map: Leaflet runs in CRS.Simple over
 * `public/maps/campus-map-illustrated.png`, whose coordinate space is the
 * source SVG's 800×600 viewBox (`illustrated-map-art.tsx`). Positions are
 * `[y, x]` with y measured UP from the bottom-left corner — exactly what
 * the dev click-logger prints, so log → paste into `mapPosition`.
 */
export const MAP_IMAGE_WIDTH = 800;
export const MAP_IMAGE_HEIGHT = 600;

export const MAP_IMAGE_BOUNDS: [[number, number], [number, number]] = [
  [0, 0],
  [MAP_IMAGE_HEIGHT, MAP_IMAGE_WIDTH],
];

export const MAP_IMAGE_URL = "/maps/campus-map-illustrated.png";

/** Schematic pseudo-NUS bounds the mock lat/lngs were authored against. */
const GEO_BOUNDS = {
  north: 1.308,
  south: 1.288,
  west: 103.768,
  east: 103.784,
};

/**
 * Projects a mock lat/lng onto the illustrated image, replicating the old
 * placeholder's percentage projection (6–94% clamp included) so markers
 * land exactly where the previous design put them. Returns `[y, x]` in
 * CRS.Simple image coordinates. Prefer an explicit `mapPosition` (from the
 * dev click-logger) when a cat has one.
 */
export function projectToImage(lat: number, lng: number): [number, number] {
  const clamp = (v: number) => Math.min(Math.max(v, 6), 94);
  const xPct = clamp(
    ((lng - GEO_BOUNDS.west) / (GEO_BOUNDS.east - GEO_BOUNDS.west)) * 100
  );
  const yPct = clamp(
    ((GEO_BOUNDS.north - lat) / (GEO_BOUNDS.north - GEO_BOUNDS.south)) * 100
  );
  return [
    MAP_IMAGE_HEIGHT - (yPct / 100) * MAP_IMAGE_HEIGHT,
    (xPct / 100) * MAP_IMAGE_WIDTH,
  ];
}
