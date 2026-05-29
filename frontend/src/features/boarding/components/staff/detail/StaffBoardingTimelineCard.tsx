import { History, Clock, AlertCircle, Check, Camera, LogIn, FileText, CheckCircle2, XCircle, Ban, Play } from "lucide-react";
import { StaffBoardingTimelineItem, StaffBoardingTimelineLabelTone, StaffBoardingTimelineType } from "../../../types/boarding.types";
import { formatBoardingDateTime } from "../../../utils/boarding-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import Image from "next/image";

export interface StaffBoardingTimelineCardProps {
  timeline: StaffBoardingTimelineItem[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

const timelineLabelToneClassName: Record<StaffBoardingTimelineLabelTone, string> = {
  neutral: "bg-[#F1EFE2] text-[#52615D]",
  warning: "bg-[#FDECA6] text-[#A67C00]",
  success: "bg-[#E6F3E6] text-[#2E7D32]",
  info: "bg-[#E0F2F1] text-[#008577]",
  danger: "bg-[#FEE2E2] text-[#DC2626]",
};

const typeIconMap: Record<StaffBoardingTimelineType, React.ElementType> = {
  CREATED: FileText,
  CONFIRMED: CheckCircle2,
  CHECKED_IN: LogIn,
  CARE_UPDATE: Camera,
  CHECKED_OUT: Check,
  REJECTED: XCircle,
  CANCELLED: Ban,
};

const getCircleClass = (type: StaffBoardingTimelineType) => {
  switch (type) {
    case "CARE_UPDATE": return "bg-[#008577] text-white";
    case "CHECKED_OUT": return "bg-[#E6F3E6] text-[#2E7D32]";
    case "CHECKED_IN": return "bg-[#F1EFE2] text-[#52615D]";
    case "CONFIRMED": return "bg-[#E6F3E6] text-[#2E7D32]";
    case "CREATED": return "bg-[#F1EFE2] text-[#52615D]";
    case "REJECTED":
    case "CANCELLED": return "bg-[#FEE2E2] text-[#DC2626]";
    default: return "bg-[#F1EFE2] text-[#52615D]";
  }
};

const renderAttachments = (urls: string[], onPreview: (url: string, isVideo: boolean) => void) => {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {urls.map((url, i) => {
        const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.toLowerCase().includes("/video/upload/");
        if (isVideo) {
          return (
            <div 
              key={i} 
              className="relative w-30 h-20 rounded-xl overflow-hidden bg-black shadow-sm cursor-pointer hover:opacity-90 transition-all hover:scale-[1.02]"
              onClick={() => onPreview(url, true)}
            >
              <video src={url} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <Play className="w-4 h-4 text-[#008577] ml-0.5" />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div 
            key={i} 
            className="relative w-30 h-20 rounded-xl overflow-hidden shadow-sm border border-petcenter-border/40 cursor-pointer hover:opacity-90 transition-all hover:scale-[1.02]"
            onClick={() => onPreview(url, false)}
          >
            <Image src={url} alt={`Đính kèm ${i+1}`} fill sizes="120px" className="object-cover" />
          </div>
        );
      })}
    </div>
  );
};

export function StaffBoardingTimelineCard({
  timeline,
  title = "Nhật ký lưu trú",
  emptyMessage = "Chưa có nhật ký lưu trú.",
  className
}: StaffBoardingTimelineCardProps) {
  const items = timeline ?? [];
  const [previewMedia, setPreviewMedia] = useState<{url: string, isVideo: boolean} | null>(null);

  return (
    <Card className={`rounded-2xl border-none ring-0 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md flex flex-col p-0 gap-0 ${className || "h-fit"}`}>
      <CardHeader className="pt-5 px-6 pb-4 border-b border-petcenter-border/40 bg-petcenter-background/30 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-info-bg flex items-center justify-center shadow-sm">
            <History className="w-5 h-5 text-petcenter-info-text" />
          </div>
          <CardTitle className="text-xl font-semibold text-petcenter-text tracking-tight">{title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-6 flex-1">
        {items.length > 0 ? (
          <div className="relative">
            {items.map((item, index) => {
              const toneClass = timelineLabelToneClassName[item.labelTone ?? "neutral"];
              const circleClass = item.type ? getCircleClass(item.type) : getCircleClass("CREATED");
              const Icon = (item.type ? typeIconMap[item.type] : FileText) as React.ComponentType<{ className?: string }>;
              
              const isLast = index === items.length - 1;
              const urlsToRender = item.attachmentUrls?.length ? item.attachmentUrls : item.attachmentUrl ? [item.attachmentUrl] : [];
              
              return (
                <div key={item.id} className="relative pl-14 pb-8 last:pb-0">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div className="absolute left-4.75 top-10 bottom-0 w-0.5 bg-[#E5E7EB]" />
                  )}
                  
                  {/* Circle Icon */}
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${circleClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-[15px] font-semibold text-petcenter-text">{item.title}</h4>
                      <div className="flex items-center gap-1.5 text-[13px] text-petcenter-text-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        {formatBoardingDateTime(item.createdAt)}
                      </div>
                    </div>
                    
                    <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-md ${toneClass} whitespace-nowrap`}>
                      {item.label ?? item.status}
                    </span>
                  </div>
                  
                  {/* Description Box */}
                  {item.description && (
                    <div className="mt-3 text-[14.5px] text-[#374151] leading-relaxed bg-[#F9F8F3] p-4 rounded-2xl border border-[#F1EFE2]/50">
                      <p>{item.description}</p>
                      
                      {renderAttachments(urlsToRender, (url, isVideo) => setPreviewMedia({ url, isVideo }))}

                      {item.createdBy && (
                        <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-[13px] text-petcenter-text-secondary">
                          <span className="font-semibold">Phụ trách: </span>
                          <span className="text-petcenter-text font-medium">{item.createdBy.fullName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center min-h-37.5 text-center">
            <AlertCircle className="w-8 h-8 text-petcenter-text-muted mb-2 opacity-50" />
            <p className="text-[14px] font-medium text-petcenter-text-secondary italic">
              {emptyMessage}
            </p>
            <p className="text-[12px] text-petcenter-text-muted mt-1">Các mốc xử lý và cập nhật chăm sóc sẽ hiển thị tại đây.</p>
          </div>
        )}
      </CardContent>

      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent showCloseButton={false} className="w-fit h-fit max-w-[95vw] sm:max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none ring-0 shadow-none flex items-center justify-center">
          <DialogTitle className="sr-only">Xem chi tiết phương tiện đính kèm</DialogTitle>
          {previewMedia && (
            previewMedia.isVideo ? (
              <video 
                src={previewMedia.url} 
                className="max-w-full max-h-[95vh] object-contain rounded-md"
                controls 
                autoPlay
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={previewMedia.url} 
                alt="Phóng to đính kèm" 
                className="max-w-full max-h-[95vh] object-contain rounded-md"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
