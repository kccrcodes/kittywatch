import type { Metadata } from "next";

import { DashboardHome } from "@/components/catwatch/dashboard-home";
import { DashboardShell } from "@/components/catwatch/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard — CatWatch",
};

/**
 * Direct dashboard route. The branded loading flow lives on `/` (the site
 * entry) — in-app navigation lands here without replaying the loader.
 */
export default function DashboardPage() {
  return (
    <DashboardShell active="dashboard">
      <DashboardHome />
    </DashboardShell>
  );
}
