import { Cat, Heart, PawPrint, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MockStat } from "@/lib/mock-data";

const icons: Record<MockStat["icon"], typeof Cat> = {
  cats: Cat,
  sightings: PawPrint,
  followup: Heart,
  watchers: Users,
};

const bubbleTones: Record<MockStat["icon"], string> = {
  cats: "bg-pink-100 text-pink-600",
  sightings: "bg-green-100 text-green-600",
  followup: "bg-red-soft/60 text-[#8f3a34]",
  watchers: "bg-blue-soft/60 text-[#4a6b93]",
};

function Sparkline({ points, tone }: { points: number[]; tone: "pink" | "green" }) {
  const max = Math.max(...points, 1);
  const step = 100 / (points.length - 1 || 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(30 - (p / max) * 26).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-20" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke={tone === "pink" ? "var(--pink-400)" : "var(--green-400)"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({ stat, className }: { stat: MockStat; className?: string }) {
  const Icon = icons[stat.icon];
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-(--radius-lg) border border-border-soft bg-surface p-4 shadow-(--shadow-soft) sm:p-5",
        className
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl",
          bubbleTones[stat.icon]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-2xl font-semibold leading-tight text-cocoa sm:text-3xl">
          {stat.value}
        </p>
        <p className="truncate text-sm text-cocoa-body">{stat.label}</p>
        {stat.hint ? (
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
              stat.hintTone === "green"
                ? "bg-green-100 text-green-600"
                : "bg-pink-100 text-pink-600"
            )}
          >
            {stat.hint}
          </span>
        ) : null}
      </div>
      {stat.sparkline ? (
        <Sparkline points={stat.sparkline} tone={stat.hintTone ?? "pink"} />
      ) : null}
    </div>
  );
}
