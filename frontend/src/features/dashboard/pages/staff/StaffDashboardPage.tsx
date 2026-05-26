import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  PawPrint,
  Plus,
  Receipt,
  Scissors,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const summaryCards = [
  {
    title: "Lịch hẹn hôm nay",
    value: "18",
    note: "6 lịch chờ xác nhận",
    icon: CalendarCheck,
    tone: "primary",
  },
  {
    title: "Thú cưng lưu trú",
    value: "12",
    note: "3 bé chờ check-out",
    icon: Home,
    tone: "info",
  },
  {
    title: "Yêu cầu spa",
    value: "9",
    note: "4 ca đang xử lý",
    icon: Scissors,
    tone: "warning",
  },
  {
    title: "Thanh toán tại quầy",
    value: "7",
    note: "2 hóa đơn quá hạn",
    icon: Receipt,
    tone: "danger",
  },
];

const appointmentRows = [
  {
    time: "08:30",
    pet: "Milo",
    owner: "Trần Thanh Hà",
    service: "Khám tổng quát",
    status: "Chờ xác nhận",
    statusTone: "warning",
  },
  {
    time: "09:15",
    pet: "Bông",
    owner: "Lê Minh Khang",
    service: "Tiêm vaccine",
    status: "Đã xác nhận",
    statusTone: "success",
  },
  {
    time: "10:00",
    pet: "Nâu",
    owner: "Phạm Ngọc Linh",
    service: "Tái khám da liễu",
    status: "Đang xử lý",
    statusTone: "info",
  },
  {
    time: "11:20",
    pet: "Coco",
    owner: "Võ Anh Thư",
    service: "Tư vấn dinh dưỡng",
    status: "Chờ xác nhận",
    statusTone: "warning",
  },
];

const operationQueues = [
  {
    title: "Check-in lưu trú",
    value: "5",
    description: "Cần xác minh phòng và đồ dùng kèm theo",
    href: "/staff/boarding",
    icon: Home,
  },
  {
    title: "Tiếp nhận spa",
    value: "4",
    description: "Chờ nhân viên xác nhận tình trạng lông da",
    href: "/staff/spa",
    icon: Scissors,
  },
  {
    title: "Hồ sơ cần cập nhật",
    value: "6",
    description: "Thiếu cân nặng, giống hoặc thông tin chủ nuôi",
    href: "/staff/pets",
    icon: PawPrint,
  },
];

const boardingRooms = [
  {
    room: "A-102",
    pet: "Mochi",
    care: "Ăn sáng lúc 08:00",
    status: "Đang lưu trú",
    statusTone: "primary",
  },
  {
    room: "B-204",
    pet: "Lucky",
    care: "Cần theo dõi nhiệt độ",
    status: "Cần theo dõi",
    statusTone: "warning",
  },
  {
    room: "C-011",
    pet: "Mực",
    care: "Chờ trả thú cưng",
    status: "Chờ check-out",
    statusTone: "info",
  },
];

const recentActivities = [
  {
    title: "Xác nhận lịch khám cho Bông",
    meta: "09:05 - Lịch hẹn",
    icon: CheckCircle2,
    tone: "primary",
  },
  {
    title: "Ghi nhận chăm sóc phòng A-102",
    meta: "08:42 - Lưu trú",
    icon: Home,
    tone: "info",
  },
  {
    title: "Thanh toán INV-2041 tại quầy",
    meta: "08:20 - Hóa đơn",
    icon: CreditCard,
    tone: "success",
  },
  {
    title: "Tạo hồ sơ thú cưng mới cho chủ nuôi",
    meta: "07:55 - Hồ sơ thú cưng",
    icon: UserRound,
    tone: "warning",
  },
];

const toneClasses = {
  primary: {
    icon: "bg-[#D8F3EE] text-petcenter-primary",
    badge: "bg-[#D8F3EE] text-petcenter-primary",
    dot: "bg-petcenter-primary",
  },
  success: {
    icon: "bg-petcenter-success-bg text-petcenter-success-text",
    badge: "bg-petcenter-success-bg text-petcenter-success-text",
    dot: "bg-petcenter-success-text",
  },
  warning: {
    icon: "bg-petcenter-warning-bg text-petcenter-warning-text",
    badge: "bg-petcenter-warning-bg text-petcenter-warning-text",
    dot: "bg-petcenter-cta",
  },
  info: {
    icon: "bg-petcenter-info-bg text-petcenter-info-text",
    badge: "bg-petcenter-info-bg text-petcenter-info-text",
    dot: "bg-petcenter-info-text",
  },
  danger: {
    icon: "bg-petcenter-danger-bg text-petcenter-danger-text",
    badge: "bg-petcenter-danger-bg text-petcenter-danger-text",
    dot: "bg-petcenter-danger-text",
  },
};

type Tone = keyof typeof toneClasses;

function StatusBadge({ children, tone }: { children: string; tone: Tone }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 rounded-pill border-transparent px-3 text-xs font-semibold",
        toneClasses[tone].badge
      )}
    >
      {children}
    </Badge>
  );
}

export function StaffDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label-md mb-2 text-petcenter-text-secondary">
            Trung tâm PetCenter - Ca sáng
          </p>
          <h1 className="heading-lg text-petcenter-text">
            Tổng quan nhân viên
          </h1>
          <p className="body-md mt-2 max-w-2xl text-petcenter-text-secondary">
            Theo dõi nhanh các công việc vận hành trong ngày: tiếp nhận lịch
            hẹn, cập nhật hồ sơ, spa, lưu trú và thanh toán tại quầy.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-control border-petcenter-primary bg-white px-4 text-petcenter-primary hover:bg-[#D8F3EE] hover:text-petcenter-primary"
          >
            <Link href="/staff/pets">
              <Search className="h-4 w-4" />
              Tra cứu hồ sơ
            </Link>
          </Button>
          <Button
            asChild
            className="h-11 rounded-control bg-petcenter-cta px-4 text-white hover:bg-petcenter-cta-hover"
          >
            <Link href="/staff/appointments">
              <Plus className="h-4 w-4" />
              Tạo lịch tại quầy
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          const tone = item.tone as Tone;

          return (
            <Card
              key={item.title}
              className="rounded-card border border-petcenter-border bg-white py-5 shadow-card"
            >
              <CardHeader className="px-5">
                <CardTitle className="body-md font-semibold text-petcenter-text-secondary">
                  {item.title}
                </CardTitle>
                <CardAction>
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-control",
                      toneClasses[tone].icon
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </CardAction>
              </CardHeader>
              <CardContent className="px-5">
                <div className="heading-md text-petcenter-text">
                  {item.value}
                </div>
                <p className="body-sm mt-1 text-petcenter-text-muted">
                  {item.note}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-card border border-petcenter-border bg-white py-5 shadow-card">
          <CardHeader className="px-5">
            <div>
              <CardTitle className="heading-sm text-petcenter-text">
                Lịch hẹn cần xử lý
              </CardTitle>
              <p className="body-sm mt-1 text-petcenter-text-secondary">
                Ưu tiên xác nhận lịch sắp đến và chuyển trạng thái khi khách
                tới quầy.
              </p>
            </div>
            <CardAction>
              <Button
                asChild
                variant="ghost"
                className="rounded-control text-petcenter-primary hover:bg-[#D8F3EE] hover:text-petcenter-primary"
              >
                <Link href="/staff/appointments">
                  Xem tất cả
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-5">
            <Table>
              <TableHeader className="bg-[#D8F3EE]">
                <TableRow className="border-petcenter-border hover:bg-[#D8F3EE]">
                  <TableHead className="rounded-l-control px-4 text-[#003D36]">
                    Giờ
                  </TableHead>
                  <TableHead className="px-4 text-[#003D36]">
                    Thú cưng
                  </TableHead>
                  <TableHead className="px-4 text-[#003D36]">
                    Chủ nuôi
                  </TableHead>
                  <TableHead className="px-4 text-[#003D36]">
                    Dịch vụ
                  </TableHead>
                  <TableHead className="rounded-r-control px-4 text-[#003D36]">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentRows.map((row) => (
                  <TableRow
                    key={`${row.time}-${row.pet}`}
                    className="border-petcenter-border hover:bg-petcenter-filter"
                  >
                    <TableCell className="px-4 font-semibold text-petcenter-text">
                      {row.time}
                    </TableCell>
                    <TableCell className="px-4">
                      <span className="flex items-center gap-2 font-medium text-petcenter-text">
                        <PawPrint className="h-4 w-4 text-petcenter-primary" />
                        {row.pet}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 text-petcenter-text-secondary">
                      {row.owner}
                    </TableCell>
                    <TableCell className="px-4 text-petcenter-text-secondary">
                      {row.service}
                    </TableCell>
                    <TableCell className="px-4">
                      <StatusBadge tone={row.statusTone as Tone}>
                        {row.status}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="rounded-card border border-petcenter-border bg-white py-5 shadow-card">
            <CardHeader className="px-5">
              <CardTitle className="heading-sm text-petcenter-text">
                Hàng đợi vận hành
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5">
              {operationQueues.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center gap-4 rounded-control border border-petcenter-border bg-petcenter-filter p-4 transition-colors hover:border-petcenter-border-strong hover:bg-white"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-control bg-[#D8F3EE] text-petcenter-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-petcenter-text">
                        {item.title}
                      </span>
                      <span className="body-sm mt-1 block text-petcenter-text-secondary">
                        {item.description}
                      </span>
                    </span>
                    <span className="heading-sm text-petcenter-primary">
                      {item.value}
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-card border border-petcenter-border bg-white py-5 shadow-card">
            <CardHeader className="px-5">
              <CardTitle className="heading-sm text-petcenter-text">
                Tìm nhanh tại quầy
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
                <Input
                  aria-label="Tìm kiếm tại quầy"
                  placeholder="Nhập tên thú cưng, số điện thoại, mã lịch..."
                  className="h-11 rounded-control border-petcenter-border-strong bg-white pl-10 text-sm placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/15"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-control border-petcenter-border-strong bg-white text-petcenter-text-secondary hover:bg-petcenter-filter hover:text-petcenter-primary"
                >
                  <Link href="/staff/pets">Hồ sơ</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-control border-petcenter-border-strong bg-white text-petcenter-text-secondary hover:bg-petcenter-filter hover:text-petcenter-primary"
                >
                  <Link href="/staff/invoices">Hóa đơn</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-card border border-petcenter-border bg-white py-5 shadow-card">
          <CardHeader className="px-5">
            <CardTitle className="heading-sm text-petcenter-text">
              Phòng lưu trú
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-5">
            {boardingRooms.map((room) => (
              <div
                key={room.room}
                className="flex items-center justify-between gap-4 rounded-control border border-petcenter-border bg-white p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-control bg-petcenter-info-bg font-semibold text-petcenter-info-text">
                    {room.room}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-petcenter-text">
                      {room.pet}
                    </p>
                    <p className="body-sm mt-1 truncate text-petcenter-text-secondary">
                      {room.care}
                    </p>
                  </div>
                </div>
                <StatusBadge tone={room.statusTone as Tone}>
                  {room.status}
                </StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-card border border-petcenter-border bg-white py-5 shadow-card">
          <CardHeader className="px-5">
            <div>
              <CardTitle className="heading-sm text-petcenter-text">
                Hoạt động gần đây
              </CardTitle>
              <p className="body-sm mt-1 text-petcenter-text-secondary">
                Nhật ký thao tác vận hành trong ca làm việc.
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-5">
            <div className="relative space-y-5 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-petcenter-border">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                const tone = activity.tone as Tone;

                return (
                  <div key={activity.title} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[23px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white",
                        toneClasses[tone].dot
                      )}
                    />
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-control",
                          toneClasses[tone].icon
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-petcenter-text">
                          {activity.title}
                        </p>
                        <p className="body-sm mt-1 text-petcenter-text-secondary">
                          {activity.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-card border border-petcenter-border bg-[#D8F3EE] py-5 shadow-card lg:col-span-2">
          <CardHeader className="px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-control bg-white text-petcenter-primary">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="heading-sm text-[#003D36]">
                  Điều phối khám bệnh
                </CardTitle>
                <p className="body-sm mt-1 text-petcenter-text-secondary">
                  Chuyển lịch đã tiếp nhận cho bác sĩ phụ trách, không chỉnh sửa
                  chẩn đoán hoặc đơn thuốc.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-5 sm:flex-row">
            <Button
              asChild
              className="h-11 rounded-control bg-petcenter-primary px-4 text-white hover:bg-petcenter-primary-hover"
            >
              <Link href="/staff/appointments">Điều phối lịch khám</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-control border-petcenter-primary bg-white px-4 text-petcenter-primary hover:bg-petcenter-filter hover:text-petcenter-primary"
            >
              <Link href="/staff/pets">Mở hồ sơ thú cưng</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-card border border-petcenter-border bg-white py-5 shadow-card">
          <CardHeader className="px-5">
            <CardTitle className="heading-sm text-petcenter-text">
              SLA hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-petcenter-text">
                  Xác nhận lịch
                </span>
                <span className="text-petcenter-text-secondary">82%</span>
              </div>
              <div className="h-2 rounded-pill bg-petcenter-sidebar">
                <div className="h-2 w-[82%] rounded-pill bg-petcenter-primary" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-petcenter-text">
                  Check-in đúng giờ
                </span>
                <span className="text-petcenter-text-secondary">74%</span>
              </div>
              <div className="h-2 rounded-pill bg-petcenter-sidebar">
                <div className="h-2 w-[74%] rounded-pill bg-petcenter-info-text" />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-control bg-petcenter-warning-bg p-3 text-sm text-petcenter-warning-text">
              <Clock3 className="h-4 w-4" />
              2 lịch hẹn quá 15 phút chưa cập nhật trạng thái.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
