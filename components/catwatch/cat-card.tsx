"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  personalityLabels,
  type CatPersonality,
  type MockCat,
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/catwatch/status-badge";

const personalityStyles: Record<CatPersonality, string> = {
  friendly: "bg-pink-100 text-pink-600",
  shy: "bg-green-100 text-green-600",
  explorer: "bg-yellow-soft text-[#7a5a2e]",
  sleepy: "bg-blue-soft/70 text-[#4a6b93]",
};

function SexGlyph({ sex }: { sex: MockCat["sex"] }) {
  return (
    <span
      className={cn(
        "text-sm font-bold",
        sex === "female" ? "text-pink-500" : "text-[#7e9cc4]"
      )}
      title={sex}
      aria-label={sex}
    >
      {sex === "female" ? "♀" : "♂"}
    </span>
  );
}

function FavoriteButton({
  name,
  initial,
}: {
  name: string;
  initial: boolean;
}) {
  const [favorite, setFavorite] = useState(initial);
  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={favorite ? `Unfavorite ${name}` : `Favorite ${name}`}
      onClick={() => setFavorite((f) => !f)}
      className="flex size-9 items-center justify-center rounded-full text-pink-400 transition-colors hover:bg-pink-100 focus-visible:outline-2 focus-visible:outline-pink-400"
    >
      <Heart
        className={cn("size-4.5", favorite && "fill-pink-500 text-pink-500")}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * One cat, two layouts: `row` for the directory list (reference:
 * cat-directory-reference.png), `tile` for compact photo grids.
 */
export function CatCard({
  cat,
  variant = "row",
  className,
}: {
  cat: MockCat;
  variant?: "row" | "tile";
  className?: string;
}) {
  if (variant === "tile") {
    return (
      <div
        className={cn(
          "w-36 shrink-0 rounded-(--radius-md) border border-border-soft bg-surface p-2.5 shadow-(--shadow-soft)",
          className
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-(--radius-sm) border border-border-soft">
          <Image
            src={cat.photoUrl}
            alt={`Photo of ${cat.name}`}
            fill
            sizes="144px"
            className="object-cover"
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <p className="truncate text-sm font-bold text-cocoa">{cat.name}</p>
          <SexGlyph sex={cat.sex} />
        </div>
        <p className="truncate text-xs text-cocoa-muted">
          {cat.breed} · {cat.lastSeen}
        </p>
        <StatusBadge status={cat.status} className="mt-2" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-(--radius-md) border border-border-soft bg-surface p-2.5 transition-shadow hover:shadow-(--shadow-soft)",
        className
      )}
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-(--radius-sm) border border-border-soft">
        <Image
          src={cat.photoUrl}
          alt={`Photo of ${cat.name}`}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold text-cocoa">{cat.name}</p>
          <SexGlyph sex={cat.sex} />
        </div>
        <p className="truncate text-xs text-cocoa-muted">
          {cat.zone} · Last seen {cat.lastSeen}
        </p>
      </div>
      <span
        className={cn(
          "hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-block",
          personalityStyles[cat.personality]
        )}
      >
        {personalityLabels[cat.personality]}
      </span>
      <FavoriteButton name={cat.name} initial={cat.favorite} />
    </div>
  );
}
