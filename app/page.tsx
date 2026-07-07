import { DashboardEntry } from "@/components/catwatch/dashboard-entry";
import { DashboardHome } from "@/components/catwatch/dashboard-home";
import { DashboardShell } from "@/components/catwatch/dashboard-shell";

/**
 * Site entry: the KittyWatch loading screen plays immediately (no landing
 * page), and its CTA fades the dashboard in on this same route — no
 * navigation, so there's no flash between the loader and the dashboard.
 */
export default function Home() {
  return (
    <DashboardEntry>
      <DashboardShell active="dashboard">
        <DashboardHome />
      </DashboardShell>
    </DashboardEntry>
  );
}
