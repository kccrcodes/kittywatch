"use client";

import { useState } from "react";

import { mockCats } from "@/lib/mock-data";
import { fromMockCat, type MapCat } from "@/lib/map-cats";
import { Button } from "@/components/ui/button";
import { CatProfileSheet } from "@/components/catwatch/cat-profile-sheet";

/**
 * UI Lab demo for the profile sheet: open a healthy cat and the missing
 * variant side by side. Demo pins have non-UUID ids, so the sheet skips
 * the live fetch and shows pin-level info with the demo notice — the
 * full gallery/timeline appear on real registered cats.
 */
export function CatProfileSheetDemo() {
  const [cat, setCat] = useState<MapCat | null>(null);
  const [open, setOpen] = useState(false);

  const healthy = mockCats.find((c) => c.status === "healthy") ?? mockCats[0];
  const missing = mockCats.find((c) => c.status === "missing") ?? mockCats[0];

  function show(mock: typeof healthy) {
    setCat(fromMockCat(mock));
    setOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => show(healthy)}
          className="rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600"
        >
          Open {healthy.name} (healthy)
        </Button>
        <Button
          variant="secondary"
          onClick={() => show(missing)}
          className="rounded-full border border-border-soft font-bold"
        >
          Open {missing.name} (missing)
        </Button>
      </div>
      <CatProfileSheet
        key={cat?.id ?? "no-cat"}
        cat={cat}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
