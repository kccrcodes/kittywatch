import Image from "next/image";
import { Bell, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MockAlert } from "@/lib/mock-data";
import { Panel } from "@/components/catwatch/panel";

const severityStyles: Record<MockAlert["severity"], string> = {
  high: "bg-red-soft text-[#8f3a34]",
  medium: "bg-yellow-soft text-[#7a5a2e]",
};

export function AlertsPanel({
  alerts,
  className,
}: {
  alerts: MockAlert[];
  className?: string;
}) {
  return (
    <Panel
      title="Alerts"
      icon={<Bell className="size-4" aria-hidden="true" />}
      action={{ label: "View all", href: "#" }}
      className={className}
      contentClassName="space-y-2.5"
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-center gap-3 rounded-(--radius-md) border border-border-soft p-2.5",
            alert.severity === "high" ? "bg-pink-100/60" : "bg-cream"
          )}
        >
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border-soft">
            <Image
              src={alert.photoUrl}
              alt={`Photo of ${alert.catName}`}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-cocoa">{alert.title}</p>
            <p className="truncate text-xs text-cocoa-muted">{alert.meta}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize",
              severityStyles[alert.severity]
            )}
          >
            {alert.severity}
          </span>
          <ChevronRight className="size-4 shrink-0 text-cocoa-muted" aria-hidden="true" />
        </div>
      ))}
    </Panel>
  );
}
