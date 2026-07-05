export const STATUS = {
  HEALTHY: "healthy",
  NEEDS_ATTENTION: "needs_attention",
  MISSING: "missing",
} as const

export const SIGHTING_STATUS = {
  HEALTHY: "healthy",
  INJURED: "injured",
  NOT_FOUND: "not_found",
} as const

export const COORD_FUZZ = 0.0005 // ~50m
export const REID_THRESHOLD = 0.7
export const MISSING_THRESHOLD_DAYS = 7
export const RATE_LIMIT_PER_HOUR = 10
