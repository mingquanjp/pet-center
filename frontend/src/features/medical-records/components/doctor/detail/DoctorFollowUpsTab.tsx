import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { DoctorFollowUpInstructionItem } from "../../../types/medical-record.types";
import { formatDate, formatFollowUpStatus } from "../../../utils/medical-record-format";

interface Props {
  followUps: DoctorFollowUpInstructionItem[];
}

export function DoctorFollowUpsTab({ followUps }: Props) {
  if (followUps.length === 0) {
    return <div className="py-12 text-center text-petcenter-text-secondary">Chưa có lịch tái khám.</div>;
  }

  const sorted = [...followUps].sort((a, b) => new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime());

  return (
    <div className="mt-4 space-y-4">
      {sorted.map((followUp) => {
        const isPending = followUp.followUpStatus === "pending";
        const isCompleted = followUp.followUpStatus === "completed";

        return (
          <div
            key={followUp.followUpId}
            className={`flex flex-col gap-4 rounded-xl border p-5 transition-colors md:flex-row md:items-center ${
              isPending ? "border-blue-200 bg-blue-50/30" : "border-petcenter-border bg-petcenter-background"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isPending ? "bg-blue-100 text-blue-600" : isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
              }`}
            >
              {isPending && <Clock className="h-5 w-5" />}
              {isCompleted && <CheckCircle2 className="h-5 w-5" />}
              {!isPending && !isCompleted && <XCircle className="h-5 w-5" />}
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-3">
                <div className="mb-1 text-sm font-medium text-petcenter-text-secondary">Ngày tái khám</div>
                <div className={`font-semibold ${isPending ? "text-blue-700" : "text-petcenter-text"}`}>
                  {formatDate(followUp.followUpDate)}
                </div>
              </div>
              <div className="md:col-span-4">
                <div className="mb-1 text-sm font-medium text-petcenter-text-secondary">Lý do</div>
                <div className="font-medium text-petcenter-text">{followUp.reason}</div>
              </div>
              <div className="md:col-span-3">
                <div className="mb-1 text-sm font-medium text-petcenter-text-secondary">Ghi chú cho chủ nuôi</div>
                <div className="whitespace-pre-wrap text-sm text-petcenter-text">{followUp.ownerNote || "Không có ghi chú"}</div>
              </div>
              <div className="flex flex-col items-start justify-center md:col-span-2 md:items-end">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                    isPending
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : isCompleted
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {formatFollowUpStatus(followUp.followUpStatus)}
                </span>
                {followUp.completedAt && (
                  <span className="mt-1 text-xs text-petcenter-text-secondary">Hoàn thành: {formatDate(followUp.completedAt)}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
