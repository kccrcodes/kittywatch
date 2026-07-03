import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Shared card/panel per design.md §6: bg-surface, soft border, radius 24,
 * light shadow, title row with icon + title + optional "view all" action.
 */
export function Panel({
  icon,
  title,
  action,
  children,
  className,
  contentClassName,
}: {
  icon?: ReactNode;
  title: string;
  action?: { label: string; href: string } | ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const isLinkAction =
    action !== null &&
    typeof action === "object" &&
    "label" in (action as object) &&
    "href" in (action as object);

  return (
    <section
      className={cn(
        "rounded-(--radius-lg) border border-border-soft bg-surface p-4 shadow-(--shadow-soft) sm:p-5",
        className
      )}
    >
      <header className="mb-4 flex items-center gap-2.5">
        {icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
            {icon}
          </span>
        ) : null}
        <h2 className="font-display text-lg font-medium text-cocoa sm:text-xl">
          {title}
        </h2>
        <span className="ml-auto">
          {isLinkAction ? (
            <Link
              href={(action as { href: string }).href}
              className="inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-500"
            >
              {(action as { label: string }).label}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : (
            (action as ReactNode)
          )}
        </span>
      </header>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
