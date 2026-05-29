import Link from "next/link";
import Image from "next/image";
import { StaffAppointment } from "../../types/appointment.types";
import { StaffAppointmentStatusBadge } from "./StaffAppointmentStatusBadge";
import { formatAppointmentDate, formatAppointmentTime, getAppointmentPetSubtitle } from "../../utils/appointment-format";
import { StaffAppointmentEmptyState } from "./StaffAppointmentEmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  appointments: StaffAppointment[];
  pagination: { total: number; totalPages: number; currentPage: number; limit: number };
  onPageChange: (page: number) => void;
  onReset: () => void;
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) items.add(currentPage - 1)
  if (currentPage < totalPages) items.add(currentPage + 1)
  if (currentPage <= 3) {
    items.add(2)
    items.add(3)
    items.add(4)
  }
  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 3)
    items.add(totalPages - 2)
    items.add(totalPages - 1)
  }

  const sortedItems = Array.from(items)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)

  return sortedItems.flatMap((item, index) => {
    const previousItem = sortedItems[index - 1]

    if (previousItem && item - previousItem > 1) {
      return ["ellipsis", item] as Array<number | "ellipsis">
    }

    return [item]
  })
}

export function StaffAppointmentTable({ appointments, pagination, onPageChange, onReset }: Props) {
  if (appointments.length === 0) {
    return <StaffAppointmentEmptyState onReset={onReset} />;
  }

  // Generate a consistent but colorful background for avatar fallbacks
  const getAvatarColor = (name: string) => {
    const colors = ['bg-orange-100 text-orange-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="w-full flex flex-col justify-start items-start overflow-hidden">
      <div className="overflow-x-auto overflow-y-hidden w-full">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead className="bg-petcenter-background border-b border-petcenter-border">
            <tr>
              <th className="px-6 py-4 font-medium text-petcenter-text-secondary text-sm w-[14%]">Mã lịch</th>
              <th className="px-6 py-4 font-medium text-petcenter-text-secondary text-sm w-[18%]">Thú cưng</th>
              <th className="px-6 py-4 font-medium text-petcenter-text-secondary text-sm w-[18%]">Chủ nuôi</th>
              <th className="px-6 py-4 font-medium text-petcenter-text-secondary text-sm w-[12%]">Ngày giờ</th>
              <th className="px-6 py-4 font-medium text-petcenter-text-secondary text-sm w-[13%]">Loại lịch</th>
              <th className="px-6 py-4 font-medium text-petcenter-text-secondary text-sm w-[15%]">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-petcenter-text-secondary text-sm text-center w-[10%]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-petcenter-border">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-petcenter-background/50 transition-colors">
                <td className="px-6 py-4 font-medium text-petcenter-text">
                  {appointment.appointmentCode}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center ${!appointment.pet.imageUrl ? getAvatarColor(appointment.pet.name) : 'bg-petcenter-border'}`}>
                      {appointment.pet.imageUrl ? (
                        <Image src={appointment.pet.imageUrl} alt={appointment.pet.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="font-bold text-xs uppercase">{appointment.pet.name.substring(0, 2)}</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-petcenter-text">{appointment.pet.name}</p>
                      <p className="text-xs text-petcenter-text-secondary mt-0.5">{getAppointmentPetSubtitle(appointment)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-petcenter-text">
                  {appointment.owner.fullName}
                </td>
                <td className="px-6 py-4">
                  <p className="text-petcenter-text">{formatAppointmentDate(appointment.scheduledAt)}</p>
                  <p className="text-sm text-petcenter-text-secondary mt-0.5">{formatAppointmentTime(appointment.scheduledAt)}</p>
                </td>
                <td className="px-6 py-4 text-petcenter-text">
                  {appointment.examType.name}
                </td>
                <td className="px-6 py-4">
                  <StaffAppointmentStatusBadge status={appointment.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  {appointment.status === "PENDING" ? (
                    <Link href={`/staff/appointments/${appointment.id}`}>
                      <Button className="rounded-[0.75rem] bg-petcenter-primary text-white hover:bg-petcenter-primary-hover active:scale-95 transition-all h-9 px-4 shadow-sm">
                        Xử lý
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/staff/appointments/${appointment.id}`}>
                      <Button className="rounded-[0.75rem] bg-petcenter-cta text-white hover:bg-petcenter-cta-hover active:bg-petcenter-cta-active active:scale-95 transition-all h-9 px-4 shadow-sm font-semibold">
                        Xem
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="w-full px-6 py-4 border-t border-petcenter-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-petcenter-text-secondary">
            Hiển thị <span className="font-medium text-petcenter-text">{(pagination.currentPage - 1) * pagination.limit + 1}</span>-
            <span className="font-medium text-petcenter-text">{Math.min(pagination.currentPage * pagination.limit, pagination.total)}</span> của{" "}
            <span className="font-medium text-petcenter-text">{pagination.total}</span> lịch hẹn
          </p>
          <nav className="flex items-center gap-2" aria-label="Phân trang">
            <button
              aria-label="Trang trước"
              className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {getPaginationItems(pagination.currentPage, pagination.totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-9 min-w-9 items-center justify-center font-medium text-petcenter-text-secondary text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    aria-current={item === pagination.currentPage ? "page" : undefined}
                    className={cn(
                      "h-9 min-w-9 rounded-[0.75rem] px-3 font-medium text-sm transition disabled:cursor-not-allowed",
                      item === pagination.currentPage
                        ? "bg-petcenter-primary text-white shadow-sm"
                        : "border border-petcenter-border bg-white text-petcenter-text hover:bg-petcenter-background"
                    )}
                    onClick={() => onPageChange(item)}
                    type="button"
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
              aria-label="Trang sau"
              className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => onPageChange(pagination.currentPage + 1)}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
