"use client";

import { useMemo, useState } from "react";
import { Cat, Home, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MockCat, MockZone } from "@/lib/mock-data";
import { CatCard } from "@/components/catwatch/cat-card";
import { Panel } from "@/components/catwatch/panel";

type Tab = "all" | "favs" | "homes";

/**
 * Searchable cat list with tabs (reference: cat-directory-reference.png).
 * The "Home Bases" tab reuses the zone data as feeding-spot rows.
 */
export function CatDirectory({
  cats,
  zones,
  className,
}: {
  cats: MockCat[];
  zones: MockZone[];
  className?: string;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const favs = useMemo(() => cats.filter((c) => c.favorite), [cats]);

  const visibleCats = useMemo(() => {
    const source = tab === "favs" ? favs : cats;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.zone.toLowerCase().includes(q) ||
        c.breed.toLowerCase().includes(q)
    );
  }, [cats, favs, tab, query]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All Cats", count: cats.length },
    { id: "favs", label: "My Favs", count: favs.length },
    { id: "homes", label: "Home Bases", count: zones.length },
  ];

  return (
    <Panel
      title="Cat Directory"
      icon={<Cat className="size-4" aria-hidden="true" />}
      action={{ label: "View all cats", href: "#" }}
      className={className}
    >
      <label className="flex items-center gap-2 rounded-full border border-border-soft bg-cream px-3.5 py-2 focus-within:border-pink-400 focus-within:ring-3 focus-within:ring-pink-200/60">
        <Search className="size-4 shrink-0 text-cocoa-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cats by name, location, or breed..."
          className="w-full bg-transparent text-sm text-cocoa outline-none placeholder:text-cocoa-muted"
        />
      </label>

      <div role="tablist" aria-label="Directory filters" className="mt-3 flex gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              tab === t.id
                ? "bg-pink-100 text-pink-600"
                : "text-cocoa-muted hover:bg-cream"
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[10px] font-bold",
                tab === t.id ? "bg-surface text-pink-600" : "bg-cream-soft"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {tab === "homes" ? (
          zones.map((zone) => (
            <div
              key={zone.name}
              className="flex items-center gap-3 rounded-(--radius-md) border border-border-soft bg-surface p-2.5"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Home className="size-4" aria-hidden="true" />
              </span>
              <p className="flex-1 text-sm font-bold text-cocoa">{zone.name}</p>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                {zone.cats} cats
              </span>
            </div>
          ))
        ) : visibleCats.length > 0 ? (
          visibleCats
            .slice(0, 5)
            .map((cat) => <CatCard key={cat.id} cat={cat} />)
        ) : (
          <div className="rounded-(--radius-md) border border-dashed border-pink-300 bg-pink-100/40 p-6 text-center">
            <p className="text-sm font-semibold text-cocoa">No kitties found</p>
            <p className="mt-1 text-xs text-cocoa-muted">
              Try another name — or register a new friend!
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
