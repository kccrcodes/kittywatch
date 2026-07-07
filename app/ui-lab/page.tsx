import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  mockAlerts,
  mockCats,
  mockSightings,
  mockStats,
  mockZones,
} from "@/lib/mock-data";
import { AlertsPanel } from "@/components/catwatch/alerts-panel";
import { CatCard } from "@/components/catwatch/cat-card";
import { CatDirectory } from "@/components/catwatch/cat-directory";
import { CatMapPanel } from "@/components/catwatch/cat-map-panel";
import { CatProfileSheetDemo } from "@/components/catwatch/cat-profile-sheet-demo";
import { CatWatchLoadingDemo } from "@/components/catwatch/cat-watch-loading-demo";
import { HeartbeatLine } from "@/components/catwatch/heartbeat-line";
import { ReIdRevealDemo } from "@/components/catwatch/re-id-reveal-demo";
import { DashboardShell } from "@/components/catwatch/dashboard-shell";
import {
  CatFaceDoodle,
  CatWalkDoodle,
  LeafDoodle,
  PawDoodle,
} from "@/components/catwatch/doodles";
import { LivePhotoSightingCard } from "@/components/catwatch/live-photo-sighting-card";
import { MapMarker } from "@/components/catwatch/map-marker";
import { RegisterCatCard } from "@/components/catwatch/register-cat-card";
import { StatCard } from "@/components/catwatch/stat-card";
import { StatusBadge } from "@/components/catwatch/status-badge";

export const metadata: Metadata = {
  title: "UI Lab — CatWatch",
};

function LabSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-(--radius-lg) border border-border-soft bg-surface p-4 shadow-(--shadow-soft) sm:p-6">
      <h2 className="font-display text-xl font-medium text-cocoa">{title}</h2>
      {note ? <p className="mt-1 text-sm text-cocoa-muted">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const swatches = [
  { name: "cream", cls: "bg-cream" },
  { name: "surface", cls: "bg-surface" },
  { name: "cream-soft", cls: "bg-cream-soft" },
  { name: "border-soft", cls: "bg-border-soft" },
  { name: "pink-100", cls: "bg-pink-100" },
  { name: "pink-200", cls: "bg-pink-200" },
  { name: "pink-300", cls: "bg-pink-300" },
  { name: "pink-400", cls: "bg-pink-400" },
  { name: "pink-500", cls: "bg-pink-500" },
  { name: "pink-600", cls: "bg-pink-600" },
  { name: "green-100", cls: "bg-green-100" },
  { name: "green-200", cls: "bg-green-200" },
  { name: "green-300", cls: "bg-green-300" },
  { name: "green-400", cls: "bg-green-400" },
  { name: "green-500", cls: "bg-green-500" },
  { name: "green-600", cls: "bg-green-600" },
  { name: "yellow-soft", cls: "bg-yellow-soft" },
  { name: "orange-soft", cls: "bg-orange-soft" },
  { name: "red-soft", cls: "bg-red-soft" },
  { name: "blue-soft", cls: "bg-blue-soft" },
  { name: "cocoa", cls: "bg-cocoa" },
  { name: "cocoa-body", cls: "bg-cocoa-body" },
  { name: "cocoa-muted", cls: "bg-cocoa-muted" },
  { name: "cocoa-line", cls: "bg-cocoa-line" },
];

export default function UiLabPage() {
  const [healthyCat, attentionCat] = [mockCats[0], mockCats[1]];
  const missingCat = mockCats.find((c) => c.status === "missing") ?? mockCats[0];

  return (
    <DashboardShell active="ui-lab">
      <div>
        <h1 className="font-display text-3xl font-semibold text-cocoa">UI Lab</h1>
        <p className="mt-1 text-sm text-cocoa-body">
          Every CatWatch component with fake data — the visual contract for
          Milestone 1.
        </p>
      </div>

      <LabSection
        title="Design tokens"
        note="Palette from design.md §3, exposed as Tailwind utilities via @theme in globals.css."
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {swatches.map((s) => (
            <div key={s.name} className="text-center">
              <div
                className={`h-12 w-full rounded-(--radius-sm) border border-border-soft ${s.cls}`}
              />
              <p className="mt-1 text-[10px] font-semibold text-cocoa-muted">
                {s.name}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-1.5">
          <p className="font-display text-3xl font-semibold text-cocoa">
            H1 · Fredoka 600
          </p>
          <p className="font-display text-xl font-medium text-cocoa">
            H2 · Fredoka 500
          </p>
          <p className="text-base font-bold text-cocoa">Card title · Nunito Sans 700</p>
          <p className="text-sm text-cocoa-body">Body · Nunito Sans 400–500</p>
          <p className="text-xs font-medium text-cocoa-muted">Meta · Nunito Sans 500</p>
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-4">
          {(["sm", "md", "lg", "xl"] as const).map((r) => (
            <div key={r} className="text-center">
              <div
                className="size-16 border-2 border-pink-300 bg-pink-100"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <p className="mt-1 text-[10px] font-semibold text-cocoa-muted">
                radius-{r}
              </p>
            </div>
          ))}
        </div>
      </LabSection>

      <LabSection
        title="CatWatchLoading"
        note="Branded loading screen: progress fills over ~2.8s, then the CTA fades the card out and the dashboard slides in. Used full-screen as the site entry on /."
      >
        <CatWatchLoadingDemo />
      </LabSection>

      <LabSection
        title="ReIdReveal"
        note="design.md §7's most demo-able moment: the ring fills to the CLIP match score after a sighting submit. Tick on the ring = REID_THRESHOLD (0.70); below it the sighting is flagged."
      >
        <ReIdRevealDemo />
      </LabSection>

      <LabSection
        title="HeartbeatLine"
        note="The pitch, visualised: a steady ECG for a cat that's being seen, slower for needs-attention, flat for missing. Shape carries the meaning — the flatline reads even with motion off."
      >
        <div className="grid max-w-md gap-3">
          {(["healthy", "needs_attention", "missing"] as const).map((s) => (
            <div key={s} className="flex items-center gap-3 rounded-(--radius-md) bg-cream-soft px-4 py-2">
              <span className="w-32 shrink-0 text-xs font-semibold text-cocoa-muted">{s}</span>
              <HeartbeatLine status={s} />
            </div>
          ))}
        </div>
      </LabSection>

      <LabSection
        title="CatProfileSheet"
        note="Pin tap → bottom sheet (SPEC screen flow): heartbeat header, gallery, sighting history from GET /api/cats/[id]. The missing variant flatlines, counts the days, and turns the CTA into 'I've seen them!'."
      >
        <CatProfileSheetDemo />
      </LabSection>

      <LabSection title="StatusBadge" note="Functional status colours, always paired with an icon shape.">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="healthy" />
          <StatusBadge status="needs_attention" />
          <StatusBadge status="missing" />
          <StatusBadge status="healthy" size="md" />
          <StatusBadge status="needs_attention" size="md" />
          <StatusBadge status="missing" size="md" />
        </div>
      </LabSection>

      <LabSection title="Buttons" note="shadcn Button themed by the token remap — no default look.">
        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-full bg-pink-500 font-bold text-white hover:bg-pink-600">
            Primary
          </Button>
          <Button variant="secondary" className="rounded-full border border-border-soft font-bold">
            Secondary
          </Button>
          <Button variant="ghost" className="rounded-full font-bold">
            Ghost
          </Button>
          <Button variant="outline" className="rounded-full font-bold">
            Outline
          </Button>
        </div>
      </LabSection>

      <LabSection title="StatCard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {mockStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </LabSection>

      <LabSection title="MapMarker" note="Cat-face pins by status, home-base pin, and the pulsing recent-sighting dot.">
        <div className="flex flex-wrap items-end gap-8 rounded-(--radius-md) bg-cream-soft p-6">
          <MapMarker variant="cat" status="healthy" tint="var(--pink-200)" label="Mochi" />
          <MapMarker variant="cat" status="needs_attention" tint="var(--yellow-soft)" label="Patches" />
          <MapMarker variant="cat" status="missing" tint="var(--red-soft)" label="Ziggy — missing" />
          <MapMarker variant="home" label="Home base" />
          <MapMarker variant="sighting" label="Recent sighting" className="mb-4" />
        </div>
      </LabSection>

      <LabSection title="CatCard" note="Row layout for the directory, tile layout for photo grids.">
        <div className="space-y-2">
          <CatCard cat={healthyCat} />
          <CatCard cat={attentionCat} />
          <CatCard cat={missingCat} />
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {mockCats.slice(0, 4).map((cat) => (
            <CatCard key={cat.id} cat={cat} variant="tile" />
          ))}
        </div>
      </LabSection>

      <LabSection title="LivePhotoSightingCard">
        <div className="divide-y divide-border-soft">
          {mockSightings.slice(0, 3).map((s) => (
            <LivePhotoSightingCard key={s.id} sighting={s} />
          ))}
        </div>
      </LabSection>

      <LabSection title="Doodles" note="Reusable SVG assets from design.md §10.">
        <div className="flex flex-wrap items-center gap-8 rounded-(--radius-md) bg-cream-soft p-6">
          <CatWalkDoodle className="h-20 w-32" />
          <CatFaceDoodle tint="var(--pink-200)" className="size-12" />
          <CatFaceDoodle tint="var(--green-200)" className="size-12" />
          <CatFaceDoodle tint="var(--blue-soft)" className="size-12" />
          <LeafDoodle className="size-8" />
          <PawDoodle className="size-8 text-pink-300" />
        </div>
      </LabSection>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <LabSection title="CatDirectory" note="Search + tabs are live; try filtering.">
          <CatDirectory cats={mockCats} zones={mockZones} className="border-0 p-0 shadow-none" />
        </LabSection>
        <div className="space-y-5">
          <LabSection title="AlertsPanel">
            <AlertsPanel alerts={mockAlerts} className="border-0 p-0 shadow-none" />
          </LabSection>
          <LabSection title="RegisterCatCard" note="Visual only — submit shows a demo confirmation.">
            <RegisterCatCard className="border-0 p-0 shadow-none" />
          </LabSection>
        </div>
      </div>

      <LabSection
        title="CatMapPanel"
        note="Leaflet CRS.Simple over the illustrated campus PNG. Demo pins here; the dashboard passes `live` and fetches GET /api/cats with loading/empty/error states."
      >
        <CatMapPanel cats={mockCats} zones={mockZones} className="min-h-[480px]" />
      </LabSection>
    </DashboardShell>
  );
}
