"use client";

import { useEffect, useMemo } from "react";
import { Camera, RefreshCw, X } from "lucide-react";

/**
 * Photo capture for the sighting flow (#15): `capture="environment"` opens
 * the rear camera directly on phones and falls back to a file picker on
 * desktop. Controlled — the parent owns the File and uploads it on submit
 * (SPEC photo flow: Storage first, then the API gets the URL).
 */
export function CameraCaptureField({
  file,
  onChange,
  disabled = false,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  // useMemo instead of state+effect so there's no setState-in-effect churn;
  // the effect below only revokes stale object URLs.
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  if (!previewUrl) {
    return (
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-(--radius-md) border-2 border-dashed border-pink-300 bg-pink-100/40 px-4 py-6 text-center transition-colors hover:bg-pink-100/70">
        <span className="flex size-10 items-center justify-center rounded-full bg-pink-200 text-pink-600">
          <Camera className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-cocoa">
          Snap a photo of the kitty
        </span>
        <span className="text-xs text-cocoa-muted">
          Opens your camera on mobile · PNG/JPG
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          disabled={disabled}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-(--radius-md) border border-border-soft">
      {/* eslint-disable-next-line @next/next/no-img-element -- local object-URL preview */}
      <img
        src={previewUrl}
        alt="Sighting photo preview"
        className="h-44 w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-cocoa/50 to-transparent p-2.5">
        <label className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-surface/95 px-3 text-xs font-bold text-cocoa shadow-(--shadow-soft)">
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Retake
          <input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={disabled}
            className="sr-only"
            onChange={(e) => onChange(e.target.files?.[0] ?? file)}
          />
        </label>
        <button
          type="button"
          aria-label="Remove photo"
          disabled={disabled}
          onClick={() => onChange(null)}
          className="flex size-9 items-center justify-center rounded-full bg-surface/95 text-cocoa shadow-(--shadow-soft)"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
