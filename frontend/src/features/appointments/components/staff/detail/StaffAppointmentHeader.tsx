import Link from "next/link";
import { StaffAppointmentDetail, StaffAppointmentDetailMode } from "../../../types/appointment.types";
import { StaffAppointmentStatusBadge } from "../StaffAppointmentStatusBadge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Props {
  appointment: StaffAppointmentDetail;
  mode: StaffAppointmentDetailMode;
}

export function StaffAppointmentHeader({ appointment, mode }: Props) {
  const isProcess = mode === "PROCESS";

  return (
    <div className="space-y-4">
      <div className="flex items-center h-10">
        <Breadcrumb>
          <BreadcrumbList className="text-base text-petcenter-text-secondary">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-petcenter-primary transition-colors">
                <Link href="/staff/appointments">Khám bệnh</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-petcenter-text">
                {appointment.appointmentCode}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-petcenter-text tracking-tight">
          {isProcess ? "Xử lý lịch khám" : "Chi tiết lịch khám"}
        </h1>
        <StaffAppointmentStatusBadge status={appointment.status} />
      </div>

      <p className="text-base font-normal text-petcenter-text-secondary">
        {isProcess
          ? "Kiểm tra thông tin, xác nhận hoặc từ chối lịch khám của chủ nuôi."
          : "Xem thông tin chi tiết lịch khám và bác sĩ phụ trách."}
      </p>
    </div>
  );
}
