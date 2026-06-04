import Link from "next/link";

import { cn } from "@/lib/utils";

import type { DoctorRecentActivity } from "../../types/doctor-dashboard.types";

interface DoctorRecentActivitiesProps {
  activities: DoctorRecentActivity[];
}

const activityToneByType: Record<DoctorRecentActivity["type"], string> = {
  MEDICAL_RECORD: "bg-petcenter-primary",
  SURGERY_REQUEST: "bg-petcenter-cta",
  PRESCRIPTION: "bg-petcenter-info-text",
  FOLLOW_UP: "bg-petcenter-danger-text",
};

export function DoctorRecentActivities({ activities }: DoctorRecentActivitiesProps) {
  return (
    <section className="flex h-full flex-col rounded-card border border-petcenter-border bg-petcenter-card shadow-card">
      <div className="flex items-start justify-between gap-4 border-b border-petcenter-border px-5 py-4 sm:px-6">
        <h2 className="heading-sm text-petcenter-text">
          Hoạt động chuyên môn gần đây
        </h2>
        <Link
          className="label-md shrink-0 font-semibold text-petcenter-primary hover:underline"
          href="/doctor/medical-records"
        >
          Xem lịch sử đầy đủ
        </Link>
      </div>

      <div className="flex-1 px-5 py-5 sm:px-6">
        {activities.length > 0 ? (
          <div className="relative space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-petcenter-border">
            {activities.map((activity) => (
              <article className="relative flex gap-4" key={activity.id}>
                <span
                  className={cn(
                    "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white",
                    activityToneByType[activity.type]
                  )}
                />
                <div className="min-w-0 flex-1">
                  <span className="label-md inline-flex rounded-pill bg-petcenter-sidebar px-3 py-1 text-petcenter-text-secondary">
                    {activity.timeLabel}
                  </span>
                  <h3 className="body-md mt-2 font-semibold text-petcenter-text">
                    {activity.title}
                  </h3>
                  <p className="body-sm mt-1 text-petcenter-text-secondary">
                    {activity.description}
                  </p>
                  {activity.note ? (
                    <div className="body-sm mt-3 rounded-control border border-petcenter-border bg-petcenter-filter p-3 text-petcenter-text-secondary">
                      {activity.note}
                    </div>
                  ) : null}
                  {activity.tag ? (
                    <span className="label-md mt-3 inline-flex rounded-pill bg-petcenter-primary/10 px-3 py-1 font-semibold text-petcenter-primary">
                      {activity.tag}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="body-sm text-petcenter-text-secondary">
            Chưa có hoạt động chuyên môn gần đây.
          </p>
        )}
      </div>
    </section>
  );
}
