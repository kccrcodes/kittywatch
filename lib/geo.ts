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
