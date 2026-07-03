import { Camera, LocateFixed, Minus, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MockCat, MockZone } from "@/lib/mock-data";
import { MapMarker } from "@/components/catwatch/map-marker";

/**
 * The map hero (design.md §6): softened illustrated base — parks lightly
 * green, roads warm beige, water pale blue — with cat-face pins, home-base
 * pins, pulsing sighting dots, legend and rounded controls.
 *
 * Milestone 1 ships a styled placeholder surface. To swap in Leaflet /
 * MapLibre later: replace `PlaceholderMapSurface` + the `project()`-based
 * absolute positioning with a real map layer, and render the same
 * `MapMarker`s inside the library's marker slots. Nothing outside this
 * file needs to change.
 */

const MAP_BOUNDS = {
  north: 1.308,
  south: 1.288,
  west: 103.768,
  east: 103.784,
};

function project(lat: number, lng: number) {
  const x =
    ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y =
    ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;
  const clamp = (v: number) => Math.min(Math.max(v, 6), 94);
  return { left: `${clamp(x)}%`, top: `${clamp(y)}%` };
}

const homeBases = [
  { id: "home-utown", lat: 1.3055, lng: 103.7735 },
  { id: "home-kr", lat: 1.2928, lng: 103.7785 },
];

const recentDots = [
  { id: "dot-1", lat: 1.2995, lng: 103.7762 },
  { id: "dot-2", lat: 1.2938, lng: 103.7718 },
  { id: "dot-3", lat: 1.3028, lng: 103.7752 },
];

function PlaceholderMapSurface() {
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 size-full"
    >
      <rect width="800" height="600" fill="#f3eae0" />

      {/* water */}
      <path
        d="M690 40 C 780 60, 800 160, 770 240 C 745 300, 690 290, 660 230 C 630 170, 620 70, 690 40 Z"
        fill="var(--blue-soft)"
        opacity="0.5"
      />
      <ellipse cx="90" cy="470" rx="80" ry="55" fill="var(--blue-soft)" opacity="0.45" />

      {/* parks */}
      <path
        d="M40 380 C 120 320, 260 340, 300 420 C 330 490, 240 560, 140 550 C 60 540, 0 440, 40 380 Z"
        fill="var(--green-200)"
        opacity="0.9"
      />
      <path
        d="M470 60 C 560 30, 640 70, 630 150 C 620 220, 520 240, 460 190 C 410 145, 410 85, 470 60 Z"
        fill="var(--green-200)"
        opacity="0.8"
      />
      <ellipse cx="380" cy="330" rx="90" ry="60" fill="var(--green-100)" />
      <ellipse cx="620" cy="430" rx="100" ry="70" fill="var(--green-100)" />

      {/* roads */}
      <g fill="none" stroke="#e9d7c2" strokeLinecap="round">
        <path d="M-20 260 C 150 230, 300 260, 420 230 C 540 200, 660 220, 820 180" strokeWidth="16" />
        <path d="M200 620 C 230 480, 300 380, 380 300 C 450 230, 520 180, 560 40" strokeWidth="14" />
        <path d="M-20 430 C 120 420, 260 440, 360 480 C 460 520, 600 500, 820 540" strokeWidth="12" />
        <path d="M520 620 C 560 520, 640 470, 780 450" strokeWidth="10" />
        <path d="M80 40 C 130 120, 160 200, 150 300" strokeWidth="10" />
      </g>

      {/* buildings */}
      <g fill="#f0e2d1" stroke="#e4d0ba" strokeWidth="2">
        <rect x="300" y="120" width="70" height="44" rx="10" transform="rotate(-8 335 142)" />
        <rect x="420" y="330" width="80" height="50" rx="10" transform="rotate(5 460 355)" />
        <rect x="250" y="250" width="56" height="40" rx="10" />
        <rect x="540" y="300" width="64" height="42" rx="10" transform="rotate(-6 572 321)" />
        <rect x="180" y="150" width="52" height="38" rx="10" transform="rotate(6 206 169)" />
        <rect x="620" y="330" width="52" height="36" rx="10" />
      </g>

      {/* sports track */}
      <ellipse
        cx="680"
        cy="120"
        rx="52"
        ry="30"
        fill="none"
        stroke="var(--pink-300)"
        strokeWidth="8"
        opacity="0.8"
      />

      {/* trees */}
      <g fill="var(--green-300)" opacity="0.85">
        <circle cx="120" cy="420" r="9" />
        <circle cx="180" cy="480" r="7" />
        <circle cx="250" cy="440" r="8" />
        <circle cx="520" cy="110" r="8" />
        <circle cx="560" cy="160" r="6" />
        <circle cx="360" cy="300" r="7" />
        <circle cx="640" cy="460" r="8" />
        <circle cx="590" cy="410" r="6" />
        <circle cx="90" cy="350" r="7" />
      </g>

      {/* paw trail */}
      <path
        d="M180 520 C 260 470, 300 420, 370 400 C 440 380, 480 330, 500 280"
        fill="none"
        stroke="var(--pink-300)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1 16"
      />

      {/* labels */}
      <g
        fill="#a08b7c"
        fontSize="14"
        fontWeight="600"
        fontFamily="var(--font-nunito), sans-serif"
      >
        <text x="110" y="395">Kent Ridge Park</text>
        <text x="480" y="140">University Town</text>
        <text x="330" y="270">Central Library</text>
        <text x="190" y="230">Faculty of Science</text>
        <text x="560" y="470">Prince George&apos;s Park</text>
        <text x="655" y="270">Kent Vale</text>
      </g>
    </svg>
  );
}

export function CatMapPanel({
  cats,
  zones,
  className,
}: {
  cats: MockCat[];
  zones: MockZone[];
  className?: string;
}) {
  return (
    <section
      aria-label="Community cat map"
      className={cn(
        "relative isolate min-h-[420px] overflow-hidden rounded-(--radius-lg) border border-border-soft bg-cream-soft shadow-(--shadow-soft)",
        className
      )}
    >
      <PlaceholderMapSurface />

      {/* markers */}
      {homeBases.map((base) => (
        <div
          key={base.id}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={project(base.lat, base.lng)}
        >
          <MapMarker variant="home" />
        </div>
      ))}
      {recentDots.map((dot) => (
        <div
          key={dot.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={project(dot.lat, dot.lng)}
        >
          <MapMarker variant="sighting" />
        </div>
      ))}
      {cats.map((cat) => (
        <div
          key={cat.id}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={project(cat.lat, cat.lng)}
        >
          <MapMarker
            variant="cat"
            status={cat.status}
            tint={cat.tint}
            label={cat.status === "missing" ? `${cat.name} — missing` : cat.name}
          />
        </div>
      ))}

      {/* search */}
      <label className="absolute left-4 top-4 flex w-56 items-center gap-2 rounded-full border border-border-soft bg-surface/95 px-3.5 py-2 shadow-(--shadow-soft) backdrop-blur-sm sm:w-64">
        <Search className="size-4 shrink-0 text-cocoa-muted" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search campus locations..."
          className="w-full bg-transparent text-sm text-cocoa outline-none placeholder:text-cocoa-muted"
        />
      </label>

      {/* marker key */}
      <div className="absolute right-4 top-4 hidden flex-col gap-1.5 rounded-(--radius-md) border border-border-soft bg-surface/95 p-2.5 text-xs font-semibold text-cocoa-body shadow-(--shadow-soft) backdrop-blur-sm sm:flex">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-pink-400" />
          Recent Sighting
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-green-500" />
          Cat Home Base
        </span>
      </div>

      {/* zoom / locate */}
      <div className="absolute left-4 top-18 flex flex-col overflow-hidden rounded-(--radius-sm) border border-border-soft bg-surface shadow-(--shadow-soft)">
        <button
          type="button"
          aria-label="Zoom in"
          className="flex size-9 items-center justify-center text-cocoa-body hover:bg-cream"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="flex size-9 items-center justify-center border-t border-border-soft text-cocoa-body hover:bg-cream"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Centre on my location"
          className="flex size-9 items-center justify-center border-t border-border-soft text-cocoa-body hover:bg-cream"
        >
          <LocateFixed className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* zone legend */}
      <div className="absolute bottom-4 left-4 hidden rounded-(--radius-md) border border-border-soft bg-surface/95 p-3 shadow-(--shadow-soft) backdrop-blur-sm md:block">
        <p className="mb-2 text-xs font-bold text-cocoa">Campus Zones</p>
        <ul className="space-y-1.5">
          {zones.map((zone) => (
            <li
              key={zone.name}
              className="flex items-center gap-2 text-xs text-cocoa-body"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ background: zone.dot }}
              />
              {zone.name}
              <span className="ml-auto pl-3 font-semibold text-cocoa-muted">
                {zone.cats}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* report FAB */}
      <button
        type="button"
        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-(--shadow-lifted) transition-colors hover:bg-pink-600"
      >
        <Camera className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Report a Sighting</span>
      </button>

      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-surface/80 px-2.5 py-1 text-[10px] font-medium text-cocoa-muted backdrop-blur-sm">
        Illustrated preview — live map coming soon
      </span>
    </section>
  );
}
