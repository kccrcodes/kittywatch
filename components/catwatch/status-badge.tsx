import { CircleAlert, PawPrint, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { statusLabels, type CatStatus } from "@/lib/mock-data";

/**
 * Status chips per SPEC: colour is functional and always paired with an
 * icon shape so it survives colourblindness and sunlight.
 */
const statusStyles: Record<CatStatus, string> = {
  healthy: "bg-green-100 text-green-600",
  needs_attention: "bg-yellow-soft text-[#7a5a2e]",
  missing: "bg-red-soft text-[#8f3a34]",
};

const statusIcons: Record<CatStatus, typeof PawPrint> = {
  healthy: PawPrint,
  needs_attention: TriangleAlert,
  missing: CircleAlert,
};

export function StatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: CatStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        statusStyles[status],
        className
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
