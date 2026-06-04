import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { DoctorAssignedExam } from "../../types/doctor-dashboard.types";
import { getDoctorExamActionLabel } from "../../utils/doctor-dashboard-format";
import { AssignedExamStatusBadge } from "./AssignedExamStatusBadge";

interface AssignedExamTableProps {
  exams: DoctorAssignedExam[];
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

function getPetInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getPetSubtitle(exam: DoctorAssignedExam) {
  return [
    exam.pet.species,
    exam.pet.breed,
    exam.pet.ageText,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function AssignedExamTable({ exams }: AssignedExamTableProps) {
  return (
    <section className="overflow-hidden rounded-card border border-petcenter-border bg-petcenter-card shadow-card">
      <div className="flex items-center justify-between gap-4 border-b border-petcenter-border px-5 py-4 sm:px-6">
        <h2 className="heading-sm text-petcenter-text">
          Phiếu khám sắp tới
        </h2>
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="title-md text-petcenter-text">Không có phiếu khám phù hợp</p>
          <p className="body-md mt-2 max-w-md text-petcenter-text-secondary">
            Chưa có phiếu khám đang chờ hoặc đang khám trong hôm nay.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-200 table-fixed border-collapse text-left">
            <thead className="border-b border-petcenter-border bg-petcenter-background">
              <tr>
                <th className="w-[14%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Mã phiếu</th>
                <th className="w-[18%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Thú cưng</th>
                <th className="w-[18%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Chủ nuôi</th>
                <th className="w-[12%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Thời gian</th>
                <th className="w-[13%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Loại khám</th>
                <th className="w-[15%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">Trạng thái</th>
                <th className="w-[10%] px-6 py-4 text-center text-sm font-medium text-petcenter-text-secondary">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-petcenter-border bg-white">
              {exams.map((exam) => {
                const scheduledAt = new Date(exam.scheduledAt ?? "");

                return (
                  <tr
                    key={exam.id}
                    className="transition-colors hover:bg-petcenter-background/60"
                  >
                    <td className="px-6 py-4 font-semibold text-petcenter-text">
                      {exam.examinationCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-petcenter-filter text-xs font-bold text-petcenter-primary">
                          {exam.pet.imageUrl ? (
                            <Image
                              src={exam.pet.imageUrl}
                              alt={exam.pet.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getPetInitials(exam.pet.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-petcenter-text">{exam.pet.name}</p>
                          <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                            {getPetSubtitle(exam)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-petcenter-text">{exam.owner.fullName}</p>
                      <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                        {exam.owner.phoneNumber ?? ""}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-petcenter-text">
                        {Number.isNaN(scheduledAt.getTime()) ? "" : dateFormatter.format(scheduledAt)}
                      </p>
                      <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                        {Number.isNaN(scheduledAt.getTime()) ? exam.scheduledTime : timeFormatter.format(scheduledAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-petcenter-text">{exam.examType.name}</td>
                    <td className="px-6 py-4">
                      <AssignedExamStatusBadge status={exam.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/doctor/examinations/${exam.id}`}>
                        <Button
                          className="h-9 whitespace-nowrap rounded-control bg-petcenter-primary px-4 text-white shadow-sm hover:bg-petcenter-primary-hover active:scale-95"
                          type="button"
                        >
                          {getDoctorExamActionLabel(exam.status)}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
