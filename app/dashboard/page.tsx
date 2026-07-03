import type { Metadata } from "next";
import { PawPrint } from "lucide-react";

import {
  mockAlerts,
  mockCats,
  mockSightings,
  mockStats,
  mockZones,
} from "@/lib/mock-data";
import { AlertsPanel } from "@/components/catwatch/alerts-panel";
import { CatDirectory } from "@/components/catwatch/cat-directory";
import { CatMapPanel } from "@/components/catwatch/cat-map-panel";
import { DashboardShell } from "@/components/catwatch/dashboard-shell";
import { LivePhotoSightingCard } from "@/components/catwatch/live-photo-sighting-card";
import { Panel } from "@/components/catwatch/panel";
import { RegisterCatCard } from "@/components/catwatch/register-cat-card";
import { StatCard } from "@/components/catwatch/stat-card";

export const metadata: Metadata = {
  title: "Dashboard — CatWatch",
};

export default function DashboardPage() {
  return (
    <DashboardShell active="dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <CatMapPanel
          cats={mockCats}
          zones={mockZones}
          className="min-h-[420px] lg:col-span-2 lg:min-h-[600px]"
        />
        <div className="space-y-5">
          <CatDirectory cats={mockCats} zones={mockZones} />
          <AlertsPanel alerts={mockAlerts} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <Panel
          title="Latest Sighting Updates"
          icon={<PawPrint className="size-4" aria-hidden="true" />}
          action={{ label: "View all", href: "#" }}
          className="lg:col-span-2"
          contentClassName="divide-y divide-border-soft"
        >
          {mockSightings.map((sighting) => (
            <LivePhotoSightingCard key={sighting.id} sighting={sighting} />
          ))}
        </Panel>
        <RegisterCatCard />
      </div>
    </DashboardShell>
  );
}
