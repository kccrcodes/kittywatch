"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, PawPrint, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CAMPUS_CENTER } from "@/lib/map-geometry";
import { uploadCatPhoto } from "@/lib/upload-photo";
import { LeafDoodle } from "@/components/catwatch/doodles";
import { Panel } from "@/components/catwatch/panel";

const inputStyles =
  "w-full rounded-[14px] border border-border-soft bg-cream px-3.5 py-2.5 text-sm text-cocoa outline-none placeholder:text-cocoa-muted focus:border-pink-400 focus:ring-3 focus:ring-pink-200/60";

type Coords = { lat: number; lng: number };

function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => reject(new Error("Geolocation denied or timed out")),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  });
}

type RegisteredCat = {
  id: string;
  name: string | null;
  status: string;
  lat: number;
  lng: number;
};

/**
 * Register-a-cat form, wired to POST /api/cats (#16). Location comes from
 * the browser's Geolocation API rather than a manual pin-drop or zone
 * picker - matches the real mobile use case ("I found a cat right here")
 * and doesn't depend on the map (#13), which hasn't been built yet.
 */
export function RegisterCatCard({ className }: { className?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "locating" | "ready" | "fallback"
  >("locating");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<RegisteredCat | null>(null);

  const [locationAttempt, setLocationAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getCurrentPosition()
      .then((position) => {
        if (cancelled) return;
        setCoords(position);
        setLocationStatus("ready");
      })
      .catch(() => {
        // No GPS / permission denied (desktops especially): fall back to
        // the campus centre so registration never dead-ends - coords are
        // fuzzed ±50m server-side anyway.
        if (!cancelled) {
          setCoords(CAMPUS_CENTER);
          setLocationStatus("fallback");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [locationAttempt]);

  // Retry button handler — sync setState is fine outside effects.
  function requestLocation() {
    setLocationStatus("locating");
    setLocationAttempt((n) => n + 1);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Add a photo before registering.");
      return;
    }
    if (!coords) {
      setError("Waiting for your location - try again in a moment.");
      return;
    }

    // Capture the form element now - React's synthetic event nulls out
    // currentTarget once the handler yields (after the first await), so
    // reading it later throws "Cannot read properties of null".
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("cat-name");
    const notes = formData.get("cat-notes");

    setSubmitting(true);
    try {
      const photoUrl = await uploadCatPhoto(file);

      const res = await fetch("/api/cats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: typeof name === "string" && name.trim() ? name.trim() : undefined,
          notes: typeof notes === "string" && notes.trim() ? notes.trim() : undefined,
          lat: coords.lat,
          lng: coords.lng,
          photo_url: photoUrl,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Failed to register cat.");
      }

      setRegistered(body as RegisteredCat);
      setFile(null);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel
      title="Register New Cat"
      icon={<PawPrint className="size-4" aria-hidden="true" />}
      action={<LeafDoodle className="size-5" />}
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-(--radius-md) border-2 border-dashed border-pink-300 bg-pink-100/40 px-4 py-8 text-center transition-colors hover:bg-pink-100/70">
          <span className="flex size-10 items-center justify-center rounded-full bg-pink-200 text-pink-600">
            <Upload className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-cocoa">
            {file?.name ?? "Upload a clear photo"}
          </span>
          <span className="text-xs text-cocoa-muted">PNG, JPG up to 5MB</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div>
          <label htmlFor="cat-name" className="mb-1.5 block text-xs font-bold text-cocoa-body">
            Cat Name <span className="font-medium text-cocoa-muted">(optional)</span>
          </label>
          <input
            id="cat-name"
            name="cat-name"
            placeholder="e.g. Patches"
            className={inputStyles}
          />
        </div>

        <div className="flex items-center gap-2 rounded-[14px] border border-border-soft bg-cream px-3.5 py-2.5 text-xs">
          <MapPin className="size-4 shrink-0 text-cocoa-muted" aria-hidden="true" />
          {locationStatus === "locating" && (
            <span className="flex items-center gap-1.5 text-cocoa-muted">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" /> Getting your location…
            </span>
          )}
          {locationStatus === "ready" && (
            <span className="font-semibold text-green-600">Location captured</span>
          )}
          {locationStatus === "fallback" && (
            <span className="flex flex-wrap items-center gap-2 text-[#7a5a2e]">
              Using the campus centre — couldn&apos;t get your exact spot.
              <button type="button" onClick={requestLocation} className="font-bold underline underline-offset-2">
                Retry
              </button>
            </span>
          )}
        </div>

        <div>
          <label htmlFor="cat-notes" className="mb-1.5 block text-xs font-bold text-cocoa-body">
            Notes <span className="font-medium text-cocoa-muted">(optional)</span>
          </label>
          <textarea
            id="cat-notes"
            name="cat-notes"
            rows={3}
            placeholder="Add any visible details or behavior..."
            className={inputStyles}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <PawPrint className="size-4" aria-hidden="true" />
          )}
          {submitting ? "Registering…" : "Register Cat"}
        </Button>

        {error ? (
          <p role="alert" className="rounded-full bg-red-soft px-3 py-2 text-center text-xs font-semibold text-[#8f3a34]">
            {error}
          </p>
        ) : null}

        {registered ? (
          <p
            role="status"
            className="flex items-center justify-center gap-1.5 rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-600"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            {registered.name ?? "New kitty"} registered at {registered.lat.toFixed(4)}, {registered.lng.toFixed(4)}!
          </p>
        ) : null}
      </form>
    </Panel>
  );
}
