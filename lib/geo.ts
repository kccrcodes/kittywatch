import { COORD_FUZZ } from "@/lib/config"

/**
 * Offsets a coordinate by up to ±COORD_FUZZ (~50m) on each axis. Applied at
 * write time so stored coordinates are never the real location — protects
 * cat locations from being used to cause harm. See docs/SPEC.md §Security.
 */
export function fuzzCoordinate(lat: number, lng: number) {
  return {
    lat: lat + (Math.random() * 2 - 1) * COORD_FUZZ,
    lng: lng + (Math.random() * 2 - 1) * COORD_FUZZ,
  }
}

const METERS_PER_DEGREE_LAT = 111_320

/**
 * Converts a center point + radius (metres) into a lat/lng bounding box.
 * Longitude degrees shrink towards the poles, so its delta is scaled by
 * cos(latitude) - a fixed degree delta would over-select near the equator
 * and under-select at high latitudes.
 */
export function boundingBoxFromRadius(lat: number, lng: number, radiusMeters: number) {
  const latDelta = radiusMeters / METERS_PER_DEGREE_LAT
  // cos(lat) -> 0 at the poles, which would blow lngDelta up to Infinity.
  // Not a real scenario for Singapore coordinates, but clamp it so a bad
  // input can't produce an unbounded query.
  const cosLat = Math.max(Math.abs(Math.cos((lat * Math.PI) / 180)), 1e-6)
  const lngDelta = radiusMeters / (METERS_PER_DEGREE_LAT * cosLat)

  return {
    minLat: Math.max(-90, lat - latDelta),
    maxLat: Math.min(90, lat + latDelta),
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}
