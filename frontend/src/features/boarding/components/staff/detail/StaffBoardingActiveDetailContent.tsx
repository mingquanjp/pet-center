import Image from "next/image";
import { useState, useEffect, type ReactNode } from "react";
import {
  ArrowLeft,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Heart,
  ListFilter,
  NotebookPen,
  PawPrint,
  Play,
  Receipt,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StaffBoardingDetail, StaffBoardingTimelineItem } from "../../../types/boarding.types";
import { StaffBoardingStatusBadge } from "../StaffBoardingStatusBadge";
import {
  formatBoardingDate,
  formatBoardingDateTime,
  formatBoardingMoney,
  getBoardingPaymentMethodLabel,
  getBoardingPaymentStatusLabel,
  getBoardingRoomTypeLabel,
} from "../../../utils/boarding-format";

interface Props {
  detail: StaffBoardingDetail;
  onBack: () => void;
  onCareUpdate?: () => void;
  onCheckOut?: () => void;
}

const alertLabel = {
  normal: "Bình thường",
  attention: "Cần chú ý",
  urgent: "Khẩn cấp",
} as const;

const alertClass = {
  normal: "bg-petcenter-success-bg text-petcenter-success-text",
  attention: "bg-petcenter-warning-bg text-petcenter-warning-text",
  urgent: "bg-petcenter-danger-bg text-petcenter-danger-text",
} as const;

function getRoomLabel(detail: StaffBoardingDetail) {
  return detail.room?.name || detail.room?.code || "Chưa gán";
}

function getActualDayLabel(detail: StaffBoardingDetail) {
  if (!detail.actualCheckInAt || detail.status !== "STAYING") return detail.status === "CHECKED_OUT" ? "Đã hoàn tất" : "Chưa bắt đầu";

  const start = new Date(detail.actualCheckInAt);
  const now = new Date("2023-11-23T10:00:00.000Z");
  const diff = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1);

  return `Ngày thứ ${diff}`;
}

function BoardingSummaryHero({ detail }: { detail: StaffBoardingDetail }) {
  const payment = detail.payment;
  const isPaid = payment.paymentStatus === "PAID";

  return (
    <section className="relative overflow-hidden rounded-card border border-petcenter-border bg-petcenter-card p-6 shadow-card">
      <div className="absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-petcenter-primary/5 to-transparent" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card border-2 border-petcenter-border bg-petcenter-background shadow-card">
            {detail.pet.imageUrl ? (
              <Image src={detail.pet.imageUrl} alt={detail.pet.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-petcenter-text-muted">No image</div>
            )}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="heading-sm text-petcenter-text">{detail.pet.name}</h2>
              <StaffBoardingStatusBadge status={detail.status} />
            </div>
            <div className="body-md flex flex-wrap items-center gap-2 text-petcenter-text-secondary">
              <span className="font-medium text-petcenter-text">{detail.boardingCode}</span>
              <span className="h-1 w-1 rounded-full bg-petcenter-border-strong" />
              <span>
                {detail.pet.species === "Dog" ? "Chó" : detail.pet.species === "Cat" ? "Mèo" : "Khác"} •{" "}
                {detail.pet.breed || "Không rõ"}
                {detail.pet.ageText ? ` • ${detail.pet.ageText}` : ""}
              </span>
            </div>
            <div className="label-md mt-3 flex flex-wrap items-center gap-2 text-petcenter-text-secondary">
              <User className="h-4 w-4" />
              <span>Chủ nuôi:</span>
              <span className="font-semibold text-petcenter-text">
                {detail.owner.fullName}
                {detail.owner.phoneNumber ? ` ${detail.owner.phoneNumber}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="body-md flex flex-wrap items-center gap-2 text-petcenter-text-secondary">
            <span>Thanh toán:</span>
            <Banknote className="h-4 w-4 text-petcenter-text" />
            <span className="font-semibold text-petcenter-text">{getBoardingPaymentMethodLabel(payment.paymentMethod)}</span>
            <span className="h-1 w-1 rounded-full bg-petcenter-border-strong" />
            <span
              className={`label-md rounded-md px-2 py-0.5 font-semibold ${
                isPaid ? "bg-petcenter-success-bg text-petcenter-success-text" : "bg-petcenter-warning-bg text-petcenter-warning-text"
              }`}
            >
              {getBoardingPaymentStatusLabel(payment.paymentStatus)}
            </span>
          </div>
          <div className="body-md flex items-center gap-2 text-petcenter-text-secondary">
            <span>{detail.status === "CHECKED_OUT" ? "Chi phí cuối cùng:" : "Chi phí dự kiến:"}</span>
            <span className="title-md text-petcenter-primary">
              {formatBoardingMoney(detail.finalAmount || detail.estimatedAmount)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value, accent = false }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-petcenter-border/60 pb-3 last:border-b-0 last:pb-0">
      <span className="body-md text-petcenter-text-secondary">{label}</span>
      <span className={`body-md text-right font-semibold ${accent ? "text-petcenter-primary" : "text-petcenter-text"}`}>{value}</span>
    </div>
  );
}

function StayInfoCard({ detail }: { detail: StaffBoardingDetail }) {
  return (
    <section className="rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-petcenter-primary" />
        <h3 className="title-md text-petcenter-text">Thông tin lưu trú</h3>
      </div>
      <div className="space-y-3">
        <InfoRow label="Mã lưu trú" value={detail.boardingCode} />
        <InfoRow label="Phòng" value={<span className="rounded-md bg-petcenter-background px-2 py-1">{getRoomLabel(detail)}</span>} />
        <InfoRow label="Check-in" value={detail.actualCheckInAt ? formatBoardingDate(detail.actualCheckInAt) : formatBoardingDate(detail.checkInDate)} />
        <InfoRow
          label={detail.status === "CHECKED_OUT" ? "Check-out thực tế" : "Dự kiến check-out"}
          value={detail.actualCheckOutAt ? formatBoardingDate(detail.actualCheckOutAt) : formatBoardingDate(detail.checkOutDate)}
        />
        <InfoRow label="Thời gian thực tế" value={getActualDayLabel(detail)} accent />
        <InfoRow label={detail.status === "CHECKED_OUT" ? "Chi phí cuối cùng" : "Chi phí tạm tính"} value={formatBoardingMoney(detail.finalAmount || detail.estimatedAmount)} />
      </div>
    </section>
  );
}

function SpecialRequestsCard({ detail }: { detail: StaffBoardingDetail }) {
  return (
    <section className="rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-petcenter-cta" />
        <h3 className="title-md text-petcenter-text">Yêu cầu đặc biệt</h3>
      </div>
      {detail.specialRequests.length > 0 ? (
        <div className="space-y-3">
          {detail.specialRequests.map((request) => (
            <p key={request} className="body-md text-petcenter-text">
              {request}
            </p>
          ))}
        </div>
      ) : (
        <p className="body-md text-petcenter-text-secondary">Không có yêu cầu đặc biệt.</p>
      )}
    </section>
  );
}

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.toLowerCase().includes("/video/upload/");
};


function CareTimelineItem({
  item,
  onMediaClick,
}: {
  item: StaffBoardingTimelineItem;
  onMediaClick: (urls: string[], index: number) => void;
}) {
  const alert = (item.alertLevel?.toLowerCase() || "normal") as keyof typeof alertLabel;

  return (
    <div className="relative space-y-2">
      <div className="absolute -left-8.25 top-1 h-4 w-4 rounded-full bg-petcenter-primary shadow-[0_0_0_4px_white]" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <h4 className="body-lg font-semibold text-petcenter-text">{item.title}</h4>
        {item.alertLevel ? (
          <span className={`label-md w-fit rounded-full px-2 py-0.5 font-semibold ${alertClass[alert]}`}>{alertLabel[alert]}</span>
        ) : null}
        <span className="label-md ml-auto text-petcenter-text-secondary">{formatBoardingDateTime(item.createdAt)}</span>
      </div>
      <div className="rounded-control border border-petcenter-border/60 bg-petcenter-background/70 p-4">
        {item.description ? <p className="body-md text-petcenter-text">{item.description}</p> : null}
        {item.attachmentUrls && item.attachmentUrls.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {item.attachmentUrls.map((url, index) => {
              const isVideo = isVideoUrl(url);

              if (isVideo) {
                return (
                  <div
                    key={url}
                    onClick={() => onMediaClick(item.attachmentUrls || [], index)}
                    className="group relative h-16 w-24 overflow-hidden rounded-control bg-black cursor-pointer border border-petcenter-border/40 hover:border-petcenter-primary/60 transition-all shadow-sm"
                  >
                    <video
                      src={url}
                      muted
                      preload="metadata"
                      playsInline
                      className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/25 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#0D9488] shadow-md transition-transform duration-200 group-hover:scale-110">
                        <Play className="h-4 w-4 fill-current ml-0.5 text-[#0D9488]" />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={url}
                  onClick={() => onMediaClick(item.attachmentUrls || [], index)}
                  className="group relative h-16 w-24 overflow-hidden rounded-control bg-petcenter-background cursor-pointer border border-petcenter-border/40 hover:border-petcenter-primary/60 transition-all shadow-sm"
                >
                  <Image
                    src={url}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              );
            })}
          </div>
        ) : null}
        {item.actorName ? (
          <div className="label-md mt-3 border-t border-petcenter-border/60 pt-3 text-petcenter-text-secondary">
            <span className="font-semibold">Phụ trách: </span>
            <span className="font-medium text-petcenter-text">{item.actorName}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CareTimelineCard({
  detail,
  onMediaClick,
}: {
  detail: StaffBoardingDetail;
  onMediaClick: (urls: string[], index: number) => void;
}) {
  const timeline = [...detail.timeline].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <section className="min-h-150 rounded-card border border-petcenter-border bg-petcenter-card p-6 pb-10 shadow-card">
      <div className="mb-6 flex items-center justify-between border-b border-petcenter-border pb-4">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-petcenter-primary" />
          <h3 className="title-md text-petcenter-text">Nhật ký chăm sóc</h3>
        </div>
        <button className="label-md flex items-center gap-1 font-semibold text-petcenter-primary">
          <ListFilter className="h-4 w-4" />
          Lọc nhật ký
        </button>
      </div>
      <div className="ml-3 border-l-2 border-petcenter-border pl-7">
        <div className="space-y-8">
          {timeline.map((item) => (
            <CareTimelineItem key={item.id} item={item} onMediaClick={onMediaClick} />
          ))}
        </div>
      </div>
      <p className="label-md pt-8 text-center text-petcenter-text-secondary">Không còn nhật ký nào cũ hơn cho lần lưu trú này.</p>
    </section>
  );
}

export function StaffBoardingActiveDetailContent({ detail, onBack, onCareUpdate, onCheckOut }: Props) {
  const canOperate = detail.status === "STAYING";

  const [activeMediaUrls, setActiveMediaUrls] = useState<string[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const handleMediaClick = (urls: string[], index: number) => {
    setActiveMediaUrls(urls);
    setActiveMediaIndex(index);
  };

  useEffect(() => {
    if (activeMediaIndex === null || activeMediaUrls.length <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setActiveMediaIndex((prev) =>
          prev !== null ? (prev - 1 + activeMediaUrls.length) % activeMediaUrls.length : null
        );
      } else if (event.key === "ArrowRight") {
        setActiveMediaIndex((prev) =>
          prev !== null ? (prev + 1) % activeMediaUrls.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMediaIndex, activeMediaUrls]);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="label-md mb-3 flex items-center gap-2 text-petcenter-text-secondary">
            <span>Lưu trú</span>
            <span>/</span>
            <span>{detail.boardingCode}</span>
            <span>/</span>
            <span className="text-petcenter-text">Chi tiết</span>
          </div>
          <h1 className="heading-md text-petcenter-text">Chi tiết lưu trú</h1>
          <p className="body-md mt-1 text-petcenter-text-secondary">
            {detail.boardingCode} • {detail.pet.name} • {detail.status === "STAYING" ? "Đang lưu trú" : "Đã trả thú cưng"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canOperate ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-control border-petcenter-primary px-5 text-petcenter-primary hover:bg-petcenter-primary hover:text-white"
                onClick={onCareUpdate}
              >
                <NotebookPen className="mr-2 h-4 w-4" />
                Cập nhật chăm sóc
              </Button>
              <Button type="button" className="h-10 rounded-control bg-petcenter-cta px-5 text-white hover:bg-petcenter-cta-hover" onClick={onCheckOut}>
                <PawPrint className="mr-2 h-4 w-4" />
                Check-out
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-control border-petcenter-primary px-4 text-petcenter-primary hover:bg-petcenter-primary hover:text-white"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>

      <BoardingSummaryHero detail={detail} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(520px,1.35fr)]">
        <div className="space-y-6">
          <StayInfoCard detail={detail} />
          <SpecialRequestsCard detail={detail} />
          <section className="rounded-card border border-petcenter-border bg-petcenter-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-petcenter-primary" />
              <h3 className="title-md text-petcenter-text">Thanh toán</h3>
            </div>
            <div className="space-y-3">
              <InfoRow label="Phương thức" value={getBoardingPaymentMethodLabel(detail.payment.paymentMethod)} />
              <InfoRow
                label="Trạng thái"
                value={
                  <span
                    className={`rounded-full px-2 py-1 label-md font-semibold ${
                      detail.payment.paymentStatus === "PAID"
                        ? "bg-petcenter-success-bg text-petcenter-success-text"
                        : "bg-petcenter-warning-bg text-petcenter-warning-text"
                    }`}
                  >
                    {getBoardingPaymentStatusLabel(detail.payment.paymentStatus)}
                  </span>
                }
              />
              <InfoRow label="Số tiền" value={formatBoardingMoney(detail.payment.amount)} accent />
            </div>
          </section>
        </div>
        <CareTimelineCard detail={detail} onMediaClick={handleMediaClick} />
      </div>

      {activeMediaIndex !== null && activeMediaUrls.length > 0 && (
        <Dialog
          open={activeMediaIndex !== null}
          onOpenChange={(open) => {
            if (!open) {
              setActiveMediaIndex(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl border-none bg-black/95 p-0 text-white shadow-2xl backdrop-blur-md sm:max-w-4xl outline-none overflow-hidden rounded-2xl">
            <div className="relative flex flex-col items-center justify-center p-6 h-[80vh] sm:h-[85vh]">
              {/* Close Button */}
              <button
                onClick={() => setActiveMediaIndex(null)}
                className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Media Container */}
              <div className="relative flex h-full w-full items-center justify-center">
                {isVideoUrl(activeMediaUrls[activeMediaIndex]) ? (
                  <video
                    src={activeMediaUrls[activeMediaIndex]}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeMediaUrls[activeMediaIndex]}
                    alt="Media Log"
                    className="max-h-full max-w-full rounded-lg object-contain shadow-lg animate-in fade-in zoom-in-95 duration-200"
                  />
                )}
              </div>

              {/* Carousel Controls */}
              {activeMediaUrls.length > 1 && (
                <>
                  {/* Left Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaIndex((prev) =>
                        prev !== null ? (prev - 1 + activeMediaUrls.length) % activeMediaUrls.length : null
                      );
                    }}
                    className="absolute left-4 top-1/2 z-50 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  {/* Right Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaIndex((prev) =>
                        prev !== null ? (prev + 1) % activeMediaUrls.length : null
                      );
                    }}
                    className="absolute right-4 top-1/2 z-50 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Indicator */}
                  <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-xs select-none shadow-sm">
                    {activeMediaIndex + 1} / {activeMediaUrls.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
