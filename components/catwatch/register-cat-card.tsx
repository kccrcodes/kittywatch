"use client";

import { useState } from "react";
import { PawPrint, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { mockZones } from "@/lib/mock-data";
import { LeafDoodle } from "@/components/catwatch/doodles";
import { Panel } from "@/components/catwatch/panel";

const inputStyles =
  "w-full rounded-[14px] border border-border-soft bg-cream px-3.5 py-2.5 text-sm text-cocoa outline-none placeholder:text-cocoa-muted focus:border-pink-400 focus:ring-3 focus:ring-pink-200/60";

/**
 * Register-a-cat form, visual only for Milestone 1 — submit shows a demo
 * confirmation instead of hitting POST /api/cats.
 */
export function RegisterCatCard({ className }: { className?: string }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [registered, setRegistered] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("cat-name");
    setRegistered(typeof name === "string" && name.trim() ? name.trim() : "New kitty");
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
            {fileName ?? "Upload a clear photo"}
          </span>
          <span className="text-xs text-cocoa-muted">PNG, JPG up to 5MB</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
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

        <div>
          <label htmlFor="cat-zone" className="mb-1.5 block text-xs font-bold text-cocoa-body">
            Location Spotted
          </label>
          <select id="cat-zone" name="cat-zone" className={inputStyles} defaultValue="">
            <option value="" disabled>
              Select a campus zone
            </option>
            {mockZones.map((zone) => (
              <option key={zone.name} value={zone.name}>
                {zone.name}
              </option>
            ))}
          </select>
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
          className="w-full rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600"
        >
          Register Cat
          <PawPrint className="size-4" aria-hidden="true" />
        </Button>

        {registered ? (
          <p
            role="status"
            className="flex items-center justify-center gap-1.5 rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-600"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            {registered} registered! (demo only — no data saved)
          </p>
        ) : null}
      </form>
    </Panel>
  );
}
