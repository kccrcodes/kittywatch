import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Cat, Heart, Home, Map, Plus, Search, SwatchBook } from "lucide-react";

import { cn } from "@/lib/utils";
import { CatFaceDoodle, PawDoodle } from "@/components/catwatch/doodles";

/**
 * App chrome: cream header with pill nav on desktop, thumb-reach bottom
 * bar + FAB on mobile (SPEC form-factor rules). Only /dashboard and
 * /ui-lab exist in Milestone 1; other destinations render as inert pills.
 */
export function DashboardShell({
  active = "dashboard",
  children,
}: {
  active?: "dashboard" | "ui-lab";
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-cream">
      <header className="sticky top-0 z-40 border-b border-border-soft bg-cream/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-pink-100">
              <CatFaceDoodle tint="var(--pink-200)" className="size-7" />
            </span>
            <span className="leading-tight">
              <span className="flex items-center gap-1 font-display text-lg font-semibold text-cocoa">
                CatWatch
                <PawDoodle className="size-3.5 text-pink-400" />
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-cocoa-muted sm:block">
                Community Cat Tracker
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="mx-auto hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              aria-current={active === "dashboard" ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                active === "dashboard"
                  ? "bg-pink-100 text-pink-600"
                  : "text-cocoa-body hover:bg-cream-soft"
              )}
            >
              Dashboard
            </Link>
            {["Map", "Cats", "Alerts", "Community"].map((label) => (
              <span
                key={label}
                title="Coming soon"
                className="cursor-default rounded-full px-4 py-1.5 text-sm font-semibold text-cocoa-muted/70"
              >
                {label}
              </span>
            ))}
            <Link
              href="/ui-lab"
              aria-current={active === "ui-lab" ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                active === "ui-lab"
                  ? "bg-pink-100 text-pink-600"
                  : "text-cocoa-body hover:bg-cream-soft"
              )}
            >
              UI Lab
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <label className="hidden items-center gap-2 rounded-full border border-border-soft bg-surface px-3.5 py-1.5 lg:flex">
              <Search className="size-4 shrink-0 text-cocoa-muted" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search cats, locations..."
                className="w-44 bg-transparent text-sm text-cocoa outline-none placeholder:text-cocoa-muted"
              />
            </label>
            <button
              type="button"
              aria-label="Notifications (3 unread)"
              className="relative flex size-10 items-center justify-center rounded-full border border-border-soft bg-surface text-cocoa-body hover:bg-pink-100"
            >
              <Bell className="size-4.5" aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-pink-200 bg-green-200">
                <CatFaceDoodle tint="var(--green-100)" className="size-6" />
              </span>
              <span className="hidden leading-tight xl:block">
                <span className="block text-sm font-bold text-cocoa">Hello, Meowmie</span>
                <span className="block text-xs text-cocoa-muted">Community Caretaker</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-5 px-4 py-5 pb-28 md:px-6 md:py-6 md:pb-10">
        {children}
      </main>

      <footer className="hidden border-t border-border-soft py-4 text-center text-xs text-cocoa-muted md:block">
        Made with <Heart className="inline size-3 fill-pink-400 text-pink-400" aria-hidden="true" /> by
        the CatWatch community — every paw counts
      </footer>

      {/* mobile bottom bar, primary actions in thumb reach */}
      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-md items-end justify-between px-6 py-2">
          <Link
            href="/dashboard"
            aria-current={active === "dashboard" ? "page" : undefined}
            className={cn(
              "flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-semibold",
              active === "dashboard" ? "bg-pink-100 text-pink-600" : "text-cocoa-muted"
            )}
          >
            <Home className="size-5" aria-hidden="true" />
            Home
          </Link>
          <span className="flex min-w-14 cursor-default flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-semibold text-cocoa-muted/70">
            <Map className="size-5" aria-hidden="true" />
            Map
          </span>
          <button
            type="button"
            aria-label="Register a cat"
            className="-mt-6 flex size-13 items-center justify-center rounded-full bg-pink-500 text-white shadow-(--shadow-lifted) hover:bg-pink-600"
          >
            <Plus className="size-6" aria-hidden="true" />
          </button>
          <span className="flex min-w-14 cursor-default flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-semibold text-cocoa-muted/70">
            <Cat className="size-5" aria-hidden="true" />
            Cats
          </span>
          <Link
            href="/ui-lab"
            aria-current={active === "ui-lab" ? "page" : undefined}
            className={cn(
              "flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-semibold",
              active === "ui-lab" ? "bg-pink-100 text-pink-600" : "text-cocoa-muted"
            )}
          >
            <SwatchBook className="size-5" aria-hidden="true" />
            UI Lab
          </Link>
        </div>
      </nav>
    </div>
  );
}
