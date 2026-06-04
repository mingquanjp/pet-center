import { PawPrint } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DoctorMedicalRecord,
  DoctorMedicalRecordPagination as DoctorMedicalRecordPaginationInfo,
} from "../../types/medical-record.types";
import { formatMedicalRecordDate, getPetDisplayName } from "../../utils/medical-record-format";
import { DoctorMedicalRecordEmptyState } from "./DoctorMedicalRecordEmptyState";
import { DoctorMedicalRecordPagination } from "./DoctorMedicalRecordPagination";
import { DoctorMedicalRecordWarningBadge } from "./DoctorMedicalRecordWarningBadge";

interface Props {
  records: DoctorMedicalRecord[];
  pagination: DoctorMedicalRecordPaginationInfo;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onViewDetail: (recordId: string) => void;
}

function getPetInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DoctorMedicalRecordTable({
  records,
  pagination,
  onPageChange,
  onResetFilters,
  onViewDetail,
}: Props) {
  return (
    <div className="overflow-hidden rounded-card border border-petcenter-border bg-petcenter-card shadow-card">
      {records.length === 0 ? (
        <DoctorMedicalRecordEmptyState onReset={onResetFilters} />
      ) : (
        <>
          <Table className="min-w-250 table-fixed">
            <TableHeader className="bg-petcenter-success-bg">
              <TableRow className="border-petcenter-border hover:bg-petcenter-success-bg">
                <TableHead className="w-[12%] px-6 py-4 text-sm font-semibold text-petcenter-primary">
                  Mã thú cưng
                </TableHead>
                <TableHead className="w-[20%] px-6 py-4 text-sm font-semibold text-petcenter-primary">
                  Thú cưng
                </TableHead>
                <TableHead className="w-[15%] px-6 py-4 text-sm font-semibold text-petcenter-primary">
                  Chủ nuôi
                </TableHead>
                <TableHead className="w-[15%] px-6 py-4 text-sm font-semibold text-petcenter-primary">
                  Lần khám gần nhất
                </TableHead>
                <TableHead className="w-[20%] px-6 py-4 text-sm font-semibold text-petcenter-primary">
                  Chẩn đoán gần nhất
                </TableHead>
                <TableHead className="w-[10%] px-6 py-4 text-sm font-semibold text-petcenter-primary">
                  Cảnh báo
                </TableHead>
                <TableHead className="w-[13%] px-6 py-4 text-center text-sm font-semibold text-petcenter-primary">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-petcenter-border bg-white">
              {records.map((record) => (
                <TableRow key={record.id} className="border-petcenter-border hover:bg-petcenter-background/60">
                  <TableCell className="px-6 py-4 font-semibold text-petcenter-text">
                    {record.pet.code}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-10 w-10 bg-petcenter-filter">
                        {record.pet.avatarUrl ? (
                          <AvatarImage src={record.pet.avatarUrl} alt={record.pet.name} />
                        ) : null}
                        <AvatarFallback className="bg-petcenter-filter text-xs font-bold text-petcenter-primary">
                          {record.pet.avatarUrl ? (
                            getPetInitials(record.pet.name)
                          ) : (
                            <PawPrint className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-petcenter-text">{record.pet.name}</p>
                        <p className="body-sm mt-0.5 truncate text-petcenter-text-secondary">
                          {getPetDisplayName(record)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-petcenter-text">
                    {record.owner.fullName}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="font-medium text-petcenter-text">
                      {formatMedicalRecordDate(record.latestExam.examinedAt)}
                    </p>
                    <p className="body-sm mt-0.5 text-petcenter-text-secondary">
                      {record.latestExam.examTypeName}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-petcenter-text">
                    <p className="line-clamp-2 whitespace-normal">{record.latestExam.diagnosis}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <DoctorMedicalRecordWarningBadge alertLevel={record.alertLevel} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Button
                      variant="outline"
                      className="h-9 rounded-control border-petcenter-border bg-white px-4 text-petcenter-primary hover:bg-petcenter-background"
                      onClick={() => onViewDetail(record.id)}
                      type="button"
                    >
                      Xem bệnh án
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DoctorMedicalRecordPagination pagination={pagination} onPageChange={onPageChange} />
        </>
      )}
    </div>
  );
}
