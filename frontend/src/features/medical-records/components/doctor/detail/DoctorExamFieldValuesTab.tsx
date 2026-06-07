import React from "react";
import { DoctorMedicalExamFieldValue, DoctorMedicalExamHistoryItem } from "../../../types/medical-record.types";
import { formatDateTime, getDisplayValueForExamField } from "../../../utils/medical-record-format";

interface Props {
  fieldValues: DoctorMedicalExamFieldValue[];
  exams: DoctorMedicalExamHistoryItem[];
}

export function DoctorExamFieldValuesTab({ fieldValues, exams }: Props) {
  if (fieldValues.length === 0) {
    return <div className="py-12 text-center text-petcenter-text-secondary">Chưa có kết quả khám chi tiết.</div>;
  }

  const groupedFields = fieldValues.reduce<Record<string, DoctorMedicalExamFieldValue[]>>((acc, field) => {
    acc[field.examId] = acc[field.examId] ?? [];
    acc[field.examId].push(field);
    return acc;
  }, {});

  const sortedExamIds = Object.keys(groupedFields).sort((a, b) => {
    const examA = exams.find((exam) => exam.examId === a);
    const examB = exams.find((exam) => exam.examId === b);
    if (!examA || !examB) return 0;
    return new Date(examB.examDate).getTime() - new Date(examA.examDate).getTime();
  });

  return (
    <div className="mt-4 space-y-6">
      {sortedExamIds.map((examId) => {
        const exam = exams.find((item) => item.examId === examId);
        const fields = [...groupedFields[examId]].sort((a, b) => a.displayOrder - b.displayOrder);

        return (
          <div key={examId} className="overflow-hidden rounded-xl border border-petcenter-border">
            <div className="flex flex-col justify-between gap-2 border-b border-petcenter-border bg-gray-50 px-5 py-3 md:flex-row md:items-center">
              <h4 className="font-semibold text-petcenter-text">{exam?.examTypeName || "Phiếu khám"}</h4>
              <span className="text-sm text-petcenter-text-secondary">
                Ngày khám: {exam ? formatDateTime(exam.examDate) : "Không rõ"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-petcenter-border bg-white">
                  <tr>
                    <th className="w-1/3 px-5 py-3 font-medium text-petcenter-text-secondary">Chỉ số / tên trường</th>
                    <th className="px-5 py-3 font-medium text-petcenter-text-secondary">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fields.map((field) => (
                    <tr key={field.fieldValueId} className="bg-white hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium text-petcenter-text">{field.fieldLabel}</td>
                      <td className="px-5 py-3 text-petcenter-text">
                        {field.fieldType === "file" && field.fileUrl ? (
                          <a
                            href={field.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-petcenter-primary hover:underline"
                          >
                            Xem tệp đính kèm
                          </a>
                        ) : (
                          getDisplayValueForExamField(field)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
