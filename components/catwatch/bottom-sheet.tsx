"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * CatWatch bottom sheet (SPEC form factor: pin taps and primary flows open
 * a sheet in thumb reach, never a new page). Radix Dialog under the hood —
 * focus trap, esc-to-close, scroll lock — styled as a rounded cream sheet
 * that slides up from the bottom edge. Full-width on phones, capped at
 * max-w-lg and centred on wider screens.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cw-sheet-overlay fixed inset-0 z-[1090] bg-cocoa/25 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={description ? undefined : ""}
          className={cn(
            "cw-sheet fixed inset-x-0 bottom-0 z-[1100] mx-auto w-full max-w-lg rounded-t-(--radius-xl) border border-b-0 border-border-soft bg-surface px-5 pt-3 shadow-(--shadow-lifted) outline-none",
            "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            className
          )}
        >
          {/* drag-handle affordance */}
          <span
            className="mx-auto block h-1.5 w-10 rounded-full bg-border-soft"
            aria-hidden="true"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <Dialog.Title className="font-display text-xl font-semibold text-cocoa">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-cocoa-muted transition-colors hover:bg-cream"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="mt-0.5 text-xs text-cocoa-muted">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-4 max-h-[70dvh] overflow-y-auto overscroll-contain">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
