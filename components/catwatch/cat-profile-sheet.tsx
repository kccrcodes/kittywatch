"use client";

import { useCallback, useEffect, useState } from "react";
import { Camera, CircleAlert, RefreshCw, ShieldCheck, Syringe } from "lucide-react";

import { cn } from "@/lib/utils";
import { getCat, type ApiCatProfile } from "@/lib/api";
import { daysSince, timeAgo } from "@/lib/format";
import type { MapCat } from "@/lib/map-cats";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/catwatch/bottom-sheet";
import { CatFaceDoodle } from "@/components/catwatch/doodles";
import { HeartbeatLine } from "@/components/catwatch/heartbeat-line";
import { SightingTimeline } from "@/components/catwatch/sighting-timeline";
import { StatusBadge } from "@/components/catwatch/status-badge";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "demo" }
  | { status: "ready"; profile: ApiCatProfile };

/**
 * Cat profile bottom sheet (#14): opens on pin tap (SPEC screen flow —
 * sheet, not a page), fetches GET /api/cats/[id], and shows the heartbeat
 * header, gallery, and sighting history. Skeletons while loading, retry
 * on error; demo pins (non-UUID ids) skip the fetch and show pin-level
 * info with a notice.
 *
 * The missing state (#21) is a variant, not a different layout: the
 * heartbeat flatlines, a days-missing banner lands the "digital
 * heartbeat" narrative, the photo mutes, the timeline opens with the
 * trail going quiet — and the CTA becomes "I've seen {name}!", wiring
 * straight into the sighting flow that restarts the heartbeat.
 *
 * Mount with a `key` per cat so each open starts from a clean fetch.
 */
export function CatProfileSheet({
  cat,
  open,
  onOpenChange,
  onReportSighting,
}: {
  cat: MapCat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportSighting?: (cat: MapCat) => void;
}) {
  const isLive = cat !== null && UUID_RE.test(cat.id);
  const [state, setState] = useState<ProfileState>(
    isLive ? { status: "loading" } : { status: "demo" }
  );
  const [attempt, setAttempt] = useState(0);
  const catId = cat?.id;

  useEffect(() => {
    if (!catId || !UUID_RE.test(catId)) return;
    let cancelled = false;
    getCat(catId)
      .then((profile) => {
        if (!cancelled) setState({ status: "ready", profile });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({
            status: "error",
            message:
              err instanceof Error ? err.message : "Something went wrong.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [catId, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  if (!cat) return null;

  const profile = state.status === "ready" ? state.profile : null;
  const status = profile?.status ?? cat.status;
  const missing = status === "missing";
  const name = profile?.name ?? cat.name;
  const lastSeenAt = profile?.last_seen_at ?? null;
  const lastSeenLabel = profile
    ? (timeAgo(lastSeenAt) ?? "not seen yet")
    : cat.lastSeenLabel;
  const missingDays = daysSince(lastSeenAt);
  const photoUrl = profile?.sightings[0]?.photo_url ?? cat.photoUrl;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={name}
      description={
        missing
          ? "This kitty's heartbeat has gone quiet."
          : "Community cat profile"
      }
    >
      <div className="space-y-4">
        {/* header: photo + identity + heartbeat */}
        <div className="flex items-center gap-3.5">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Storage/demo photo
            <img
              src={photoUrl}
              alt={name}
              className={cn(
                "size-16 shrink-0 rounded-(--radius-md) border border-border-soft object-cover",
                missing && "opacity-80 grayscale-[0.35]"
              )}
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-(--radius-md) border border-border-soft bg-cream">
              <CatFaceDoodle tint={cat.tint} className="size-11" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              {profile?.tnr ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  TNR
                </span>
              ) : null}
              {profile?.vaccinated ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  <Syringe className="size-3" aria-hidden="true" />
                  Vaccinated
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-xs text-cocoa-muted">
              {[
                profile?.breed ?? undefined,
                profile?.estimated_age ?? undefined,
                cat.locationLabel,
              ]
                .filter(Boolean)
                .join(" · ") || "Details coming as sightings roll in"}
            </p>
            <HeartbeatLine status={status} className="mt-1.5" />
          </div>
        </div>

        {/* the digital-heartbeat line, in words */}
        {missing ? (
          <div className="rounded-(--radius-md) border border-red-soft bg-red-soft/25 p-3.5 text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8f3a34]">
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span>
                {missingDays !== null && missingDays > 0
                  ? `${name} hasn't been seen for ${missingDays} ${missingDays === 1 ? "day" : "days"}`
                  : `${name} hasn't been seen in a while`}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-cocoa-muted">
              Last seen {lastSeenLabel}
            </p>
            <p className="mt-1 text-xs text-cocoa-body">
              If you spot {name}, one photo brings this heartbeat back.
            </p>
            <Button
              size="lg"
              onClick={() => onReportSighting?.(cat)}
              className="mt-3 w-full rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600"
            >
              <Camera className="size-4" aria-hidden="true" />
              I&apos;ve seen {name}!
            </Button>
          </div>
        ) : (
          <p className="text-center text-xs font-semibold text-cocoa-muted">
            Last seen {lastSeenLabel}
          </p>
        )}

        {/* body per data state */}
        {state.status === "loading" ? <ProfileSkeleton /> : null}

        {state.status === "error" ? (
          <div className="rounded-(--radius-md) bg-cream p-4 text-center">
            <p className="text-xs font-semibold text-cocoa-body">
              Couldn&apos;t load the full profile — {state.message}
            </p>
            <Button
              size="sm"
              onClick={retry}
              className="mt-2.5 rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : null}

        {state.status === "demo" ? (
          <p className="rounded-(--radius-md) bg-cream px-4 py-3 text-center text-xs text-cocoa-muted">
            Demo pin — register real kitties to grow their live profiles.
          </p>
        ) : null}

        {profile ? (
          <>
            {profile.sightings.length > 1 ? (
              <div>
                <p className="mb-1.5 text-xs font-bold text-cocoa-body">
                  Photo gallery
                </p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {profile.sightings.slice(0, 8).map((sighting) => (
                    // eslint-disable-next-line @next/next/no-img-element -- gallery thumbs
                    <img
                      key={sighting.id}
                      src={sighting.photo_url}
                      alt=""
                      className={cn(
                        "size-20 shrink-0 rounded-(--radius-sm) border border-border-soft object-cover",
                        missing && "opacity-80 grayscale-[0.35]"
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-xs font-bold text-cocoa-body">
                Sighting history
              </p>
              <SightingTimeline
                sightings={profile.sightings}
                missing={missing}
              />
            </div>
          </>
        ) : null}

        {!missing ? (
          <Button
            size="lg"
            onClick={() => onReportSighting?.(cat)}
            className="w-full rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600"
          >
            <Camera className="size-4" aria-hidden="true" />
            Report a sighting
          </Button>
        ) : null}
      </div>
    </BottomSheet>
  );
}

/** Skeletons, not spinners (design.md §11). */
function ProfileSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="flex gap-2">
        <span className="h-20 w-20 shrink-0 animate-pulse rounded-(--radius-sm) bg-cream-soft" />
        <span className="h-20 w-20 shrink-0 animate-pulse rounded-(--radius-sm) bg-cream-soft" />
        <span className="h-20 w-20 shrink-0 animate-pulse rounded-(--radius-sm) bg-cream-soft" />
      </div>
      <span className="block h-4 w-1/3 animate-pulse rounded-full bg-cream-soft" />
      <span className="block h-12 w-full animate-pulse rounded-(--radius-sm) bg-cream-soft" />
      <span className="block h-12 w-full animate-pulse rounded-(--radius-sm) bg-cream-soft" />
    </div>
  );
}
