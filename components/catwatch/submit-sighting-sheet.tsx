"use client";

import { useState } from "react";
import { Camera, Loader2, PawPrint, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  postSighting,
  type ApiSightingResult,
  type SightingStatus,
} from "@/lib/api";
import { uploadCatPhoto } from "@/lib/upload-photo";
import type { MapCat } from "@/lib/map-cats";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/catwatch/bottom-sheet";
import { CameraCaptureField } from "@/components/catwatch/camera-capture-field";
import { SightingStatusPicker } from "@/components/catwatch/sighting-status-picker";
import { CatFaceDoodle } from "@/components/catwatch/doodles";

const inputStyles =
  "w-full rounded-[14px] border border-border-soft bg-cream px-3.5 py-2.5 text-sm text-cocoa outline-none placeholder:text-cocoa-muted focus:border-pink-400 focus:ring-3 focus:ring-pink-200/60";

/**
 * The sighting submission flow (#15), as a thumb-reach bottom sheet:
 * pick the cat → snap a photo (uploaded to Storage first, per SPEC's
 * photo flow) → how is it? → optional note → POST /api/sightings.
 *
 * On success it shows the re-ID result — a simple score view for now,
 * deliberately isolated in `SightingResultView` so the #19 reveal
 * animation can replace its internals without touching the flow.
 *
 * Mount with a fresh `key` per open so every session starts clean.
 */
export function SubmitSightingSheet({
  open,
  onOpenChange,
  cats,
  preselectedCatId,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cats: MapCat[];
  preselectedCatId?: string;
  onSubmitted?: (result: ApiSightingResult) => void;
}) {
  const [catId, setCatId] = useState<string | null>(
    preselectedCatId ?? (cats.length === 1 ? cats[0].id : null)
  );
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<SightingStatus>("healthy");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiSightingResult | null>(null);

  const selectedCat = cats.find((cat) => cat.id === catId) ?? null;

  async function handleSubmit() {
    setError(null);
    if (!selectedCat) {
      setError("Pick which kitty you spotted.");
      return;
    }
    if (!file) {
      setError("Add a photo — it powers the re-ID check.");
      return;
    }
    setSubmitting(true);
    try {
      const photoUrl = await uploadCatPhoto(file);
      const submitted = await postSighting({
        cat_id: selectedCat.id,
        photo_url: photoUrl,
        status_update: status,
        notes: notes.trim() || undefined,
      });
      setResult(submitted);
      onSubmitted?.(submitted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setFile(null);
    setStatus("healthy");
    setNotes("");
    setError(null);
    setResult(null);
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Report a Sighting"
      description={
        result
          ? "Sighting logged — thank you for looking out!"
          : "Spotted a kitty? Log it so the neighbourhood knows it's okay."
      }
    >
      {result ? (
        <SightingResultView
          result={result}
          catName={selectedCat?.name ?? "this kitty"}
          onDone={() => onOpenChange(false)}
          onLogAnother={reset}
        />
      ) : (
        <div className="space-y-4">
          {cats.length === 0 ? (
            <p className="rounded-(--radius-md) bg-cream px-4 py-6 text-center text-sm text-cocoa-body">
              No cats on the map to report yet — register a kitty first and
              give it a digital heartbeat.
            </p>
          ) : (
            <>
              <div>
                <p className="mb-1.5 text-xs font-bold text-cocoa-body">
                  Which kitty?
                </p>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {cats.map((cat) => {
                    const selected = cat.id === catId;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        aria-pressed={selected}
                        disabled={submitting}
                        onClick={() => setCatId(cat.id)}
                        className={cn(
                          "flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-(--radius-sm) border-2 p-1.5 transition-colors",
                          selected
                            ? "border-pink-400 bg-pink-100/70"
                            : "border-border-soft bg-cream hover:bg-pink-100/40"
                        )}
                      >
                        {cat.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- small avatar chip
                          <img
                            src={cat.photoUrl}
                            alt=""
                            className="size-10 rounded-full border border-border-soft object-cover"
                          />
                        ) : (
                          <span className="flex size-10 items-center justify-center rounded-full border border-border-soft bg-surface">
                            <CatFaceDoodle tint={cat.tint} className="size-7" />
                          </span>
                        )}
                        <span className="w-full truncate text-center text-[10px] font-semibold text-cocoa-body">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <CameraCaptureField
                file={file}
                onChange={setFile}
                disabled={submitting}
              />

              <div>
                <p className="mb-1.5 text-xs font-bold text-cocoa-body">
                  How is the cat?
                </p>
                <SightingStatusPicker
                  value={status}
                  onChange={setStatus}
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="sighting-notes"
                  className="mb-1.5 block text-xs font-bold text-cocoa-body"
                >
                  Notes{" "}
                  <span className="font-medium text-cocoa-muted">(optional)</span>
                </label>
                <textarea
                  id="sighting-notes"
                  rows={2}
                  value={notes}
                  disabled={submitting}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. napping by the bike racks"
                  className={inputStyles}
                />
              </div>

              <Button
                type="button"
                size="lg"
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="size-4" aria-hidden="true" />
                )}
                {submitting ? "Checking the kitty..." : "Submit sighting"}
              </Button>

              {error ? (
                <p
                  role="alert"
                  className="rounded-full bg-red-soft px-3 py-2 text-center text-xs font-semibold text-[#8f3a34]"
                >
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

/**
 * Post-submit re-ID result. Phase-3 seam: the #19 reveal animation (ring
 * filling to the match score) replaces the inside of this component; the
 * three outcomes it must keep are match / flagged / score-unavailable.
 */
function SightingResultView({
  result,
  catName,
  onDone,
  onLogAnother,
}: {
  result: ApiSightingResult;
  catName: string;
  onDone: () => void;
  onLogAnother: () => void;
}) {
  const percent =
    result.match_score !== null ? Math.round(result.match_score * 100) : null;

  return (
    <div className="space-y-4 py-2 text-center">
      {percent !== null ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-muted">
            Re-ID match
          </p>
          <p className="font-display text-5xl font-semibold text-cocoa">
            {percent}%
          </p>
          {result.flagged ? (
            <p className="mx-auto max-w-xs rounded-(--radius-md) bg-yellow-soft/70 px-3 py-2 text-xs font-semibold text-[#7a5a2e]">
              Hmm, that photo doesn&apos;t confidently match {catName} — a
              caretaker will double-check this one.
            </p>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <Sparkles className="size-4" aria-hidden="true" />
              Looks like {catName}! Sighting logged.
            </p>
          )}
        </>
      ) : (
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa-body">
          <PawPrint className="size-4 text-pink-400" aria-hidden="true" />
          Sighting logged! (re-ID check unavailable right now)
        </p>
      )}

      <div className="flex items-center justify-center gap-2 pt-1">
        <Button
          onClick={onDone}
          className="rounded-full bg-pink-500 px-6 font-bold text-white hover:bg-pink-600"
        >
          Done
        </Button>
        <Button
          variant="secondary"
          onClick={onLogAnother}
          className="rounded-full border border-border-soft font-bold"
        >
          Log another
        </Button>
      </div>
    </div>
  );
}
