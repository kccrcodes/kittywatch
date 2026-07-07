"use client";

import { CircleAlert, EyeOff, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SightingStatus } from "@/lib/api";

/**
 * Segmented picker for SPEC's SIGHTING_STATUS, one tap per option
 * (44px+ targets). Colours follow the status chips from design.md §4 —
 * shape + colour together, never colour alone.
 */
const OPTIONS: {
  value: SightingStatus;
  label: string;
  icon: typeof Heart;
  selectedClass: string;
}[] = [
  {
    value: "healthy",
    label: "Healthy",
    icon: Heart,
    selectedClass: "border-green-400 bg-green-100 text-green-600",
  },
  {
    value: "injured",
    label: "Injured",
    icon: CircleAlert,
    selectedClass: "border-orange-soft bg-yellow-soft/70 text-[#7a5a2e]",
  },
  {
    value: "not_found",
    label: "Not there",
    icon: EyeOff,
    selectedClass: "border-pink-400 bg-red-soft/60 text-[#8f3a34]",
  },
];

export function SightingStatusPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: SightingStatus;
  onChange: (value: SightingStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="How is the cat?" className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-1.5 rounded-(--radius-sm) border-2 px-2 text-xs font-bold transition-colors",
              selected
                ? option.selectedClass
                : "border-border-soft bg-cream text-cocoa-body hover:bg-cream-soft"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
