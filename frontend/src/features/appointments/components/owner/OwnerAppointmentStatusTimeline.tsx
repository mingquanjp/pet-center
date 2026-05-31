import { CheckCircle, Circle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OwnerAppointmentTimelineItem } from "../../types/appointment.types";
import { formatAppointmentDateTimeUtc } from "../../utils/appointment-format";

interface OwnerAppointmentStatusTimelineProps {
  timeline: OwnerAppointmentTimelineItem[];
}

export function OwnerAppointmentStatusTimeline({ timeline }: OwnerAppointmentStatusTimelineProps) {
  return (
    <Card className="flex-1 gap-0 rounded-2xl border-petcenter-border bg-petcenter-card p-6 shadow-card ring-0">
      <h2 className="title-md mb-6 text-petcenter-text">Trạng thái xử lý</h2>
      <div className="ml-3 space-y-7 border-l-2 border-petcenter-border pl-6">
        {timeline.map((item) => (
          <TimelineItem key={item.key} item={item} />
        ))}
      </div>
    </Card>
  );
}

function TimelineItem({ item }: { item: OwnerAppointmentTimelineItem }) {
  const isDone = item.status === "DONE";
  const isCurrent = item.status === "CURRENT";

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-4 border-petcenter-card",
          isDone && "bg-petcenter-primary text-white",
          isCurrent && "bg-petcenter-warning-bg text-petcenter-warning-text",
          item.status === "UPCOMING" && "bg-petcenter-background text-petcenter-text-muted"
        )}
      >
        {isDone ? (
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
        ) : isCurrent ? (
          <span className="h-2.5 w-2.5 rounded-full bg-petcenter-warning-text" />
        ) : (
          <Circle className="h-3 w-3" aria-hidden="true" />
        )}
      </div>
      <div>
        <h3
          className={cn(
            "label-md font-semibold",
            isCurrent ? "text-petcenter-warning-text" : "text-petcenter-text",
            item.status === "UPCOMING" && "font-medium text-petcenter-text-secondary"
          )}
        >
          {item.label}
        </h3>
        {item.occurredAt ? (
          <p className="body-sm mt-1 text-petcenter-text-secondary">
            {formatAppointmentDateTimeUtc(item.occurredAt)}
          </p>
        ) : null}
        {item.description ? (
          <p className="body-sm mt-1 max-w-2xl text-petcenter-text-secondary">
            {item.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
