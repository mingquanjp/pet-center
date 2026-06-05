import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Clock, Eye, EyeOff, AlertCircle, ExternalLink, ImageIcon, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCloudinaryUpload } from "../../../hooks/useCloudinaryUpload";
import {
  staffBoardingUpdateVisibilityOptions,
} from "../../../constants/boarding.constants";
import type {
  StaffBoardingDetail,
  StaffBoardingDraftUpdate,
  StaffBoardingListItem,
  StaffBoardingUpdateAlertLevel,
  StaffBoardingUpdateVisibilityStatus,
} from "../../../types/boarding.types";
import { StaffBoardingUpdateAlertSelector } from "./StaffBoardingUpdateAlertSelector";
import { StaffBoardingUpdatePetSummary } from "./StaffBoardingUpdatePetSummary";
import { StaffBoardingUpdateUploadBox } from "./StaffBoardingUpdateUploadBox";

interface StaffBoardingUpdateFormProps {
  record: StaffBoardingListItem | StaffBoardingDetail;
  onSubmit: (payload: {
    boardingId: string;
    description: string;
    alertLevel: StaffBoardingUpdateAlertLevel;
    visibilityStatus: StaffBoardingUpdateVisibilityStatus;
    attachmentUrl?: string | null;
    attachmentUrls?: string[];
  }) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  draftUpdate?: StaffBoardingDraftUpdate | null;
  isDraftLoading?: boolean;
}

const maxDescriptionLength = 1000;
const maxAttachmentCount = 10;

function getFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function getSavedAttachmentName(url: string, index: number) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop();
    return filename ? decodeURIComponent(filename) : `Tệp đã lưu ${index + 1}`;
  } catch {
    return `Tệp đã lưu ${index + 1}`;
  }
}

function isImageUrl(url: string) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || /\/image\/upload\//i.test(url);
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url);
}

function SavedAttachmentPreview({
  url,
  index,
  disabled,
  onRemove,
}: {
  url: string;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const name = getSavedAttachmentName(url, index);
  const isImage = isImageUrl(url);
  const isVideo = isVideoUrl(url);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="h-full w-full object-cover" />
        ) : isVideo ? (
          <Video className="h-6 w-6 text-[#0D9488]" />
        ) : (
          <ImageIcon className="h-6 w-6 text-[#0D9488]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#0F172A]">{name}</p>
        <p className="text-[13px] font-medium text-[#64748B]">Tệp đã lưu trong bản nháp</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        asChild
        className="h-8 w-8 rounded-full text-[#64748B] hover:bg-[#F0FDFA] hover:text-[#0D9488]"
      >
        <a href={url} target="_blank" rel="noreferrer">
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">Mở tệp</span>
        </a>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onRemove}
        className="h-8 w-8 rounded-full text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Xóa tệp</span>
      </Button>
    </div>
  );
}

function formatCurrentDateTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", " •");
}

export function StaffBoardingUpdateForm({
  record,
  onSubmit,
  onCancel,
  onDirtyChange,
  isSubmitting,
  errorMessage,
  draftUpdate,
  isDraftLoading,
}: StaffBoardingUpdateFormProps) {
  const [createdAt] = useState(() => new Date());
  const [description, setDescription] = useState("");
  const [alertLevel, setAlertLevel] = useState<StaffBoardingUpdateAlertLevel>("NORMAL");
  const [visibilityStatus, setVisibilityStatus] =
    useState<StaffBoardingUpdateVisibilityStatus>("PUBLISHED");
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachmentUrls, setExistingAttachmentUrls] = useState<string[]>([]);
  const [uploadStatusByFileKey, setUploadStatusByFileKey] = useState<Record<string, "uploading" | "failed">>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);
  const [isSubmitLocked, setIsSubmitLocked] = useState(false);
  const submitLockRef = useRef(false);
  const removedFileKeysRef = useRef(new Set<string>());

  const uploadMutation = useCloudinaryUpload();
  const isUploadingAttachments = Object.values(uploadStatusByFileKey).some((status) => status === "uploading");
  const isBusy = Boolean(isSubmitting || isSubmitLocked);
  const isDirty = Boolean(
    description.trim() ||
      alertLevel !== "NORMAL" ||
      visibilityStatus !== "PUBLISHED" ||
      files.length > 0 ||
      existingAttachmentUrls.length > 0
  );

  const createdAtLabel = useMemo(() => formatCurrentDateTime(createdAt), [createdAt]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (hasInitializedForm || isDraftLoading) return;

    if (draftUpdate) {
      // Prefill only once when a drawer opens or when the record remounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDescription(draftUpdate.description);
      setAlertLevel(draftUpdate.alertLevel);
      setVisibilityStatus("DRAFT");
      setExistingAttachmentUrls(draftUpdate.attachmentUrls || []);
    } else {
      setDescription("");
      setAlertLevel("NORMAL");
      setVisibilityStatus("PUBLISHED");
      setExistingAttachmentUrls([]);
    }

    setFiles([]);
    setUploadStatusByFileKey({});
    removedFileKeysRef.current.clear();
    setHasInitializedForm(true);
  }, [draftUpdate, hasInitializedForm, isDraftLoading]);

  async function uploadSelectedFile(file: File) {
    const fileKey = getFileKey(file);

    setUploadStatusByFileKey((previous) => ({
      ...previous,
      [fileKey]: "uploading",
    }));

    try {
      const result = await uploadMutation.mutateAsync(file);
      const uploadedUrl = result.secureUrl || result.url;

      if (!removedFileKeysRef.current.has(fileKey)) {
        setExistingAttachmentUrls((previous) => (
          previous.includes(uploadedUrl) ? previous : [...previous, uploadedUrl]
        ));
      }

      setFiles((previous) => previous.filter((item) => getFileKey(item) !== fileKey));
      setUploadStatusByFileKey((previous) => {
        const next = { ...previous };
        delete next[fileKey];
        return next;
      });
      removedFileKeysRef.current.delete(fileKey);
    } catch (error) {
      if (!removedFileKeysRef.current.has(fileKey)) {
        setUploadStatusByFileKey((previous) => ({
          ...previous,
          [fileKey]: "failed",
        }));
        setUploadError(error instanceof Error ? error.message : "Tải tệp lên thất bại. Vui lòng thử lại.");
      }
    }
  }

  function handleFilesChange(nextFiles: File[]) {
    const previousKeys = new Set(files.map(getFileKey));
    const nextKeys = new Set(nextFiles.map(getFileKey));

    for (const file of files) {
      const fileKey = getFileKey(file);
      if (!nextKeys.has(fileKey)) {
        removedFileKeysRef.current.add(fileKey);
        setUploadStatusByFileKey((previous) => {
          const next = { ...previous };
          delete next[fileKey];
          return next;
        });
      }
    }

    setFiles(nextFiles);
    setUploadError(null);

    for (const file of nextFiles) {
      const fileKey = getFileKey(file);
      if (!previousKeys.has(fileKey)) {
        removedFileKeysRef.current.delete(fileKey);
        void uploadSelectedFile(file);
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setIsSubmitLocked(true);

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 3) {
      submitLockRef.current = false;
      setIsSubmitLocked(false);
      setValidationError("Vui lòng nhập ghi chú chăm sóc tối thiểu 3 ký tự.");
      return;
    }

    if (trimmedDescription.length > maxDescriptionLength) {
      submitLockRef.current = false;
      setIsSubmitLocked(false);
      setValidationError("Ghi chú chăm sóc không được vượt quá 1000 ký tự.");
      return;
    }

    setValidationError(null);
    setUploadError(null);

    try {
      if (isUploadingAttachments) {
        setUploadError("Vui lòng đợi ảnh/video tải lên xong rồi lưu.");
        return;
      }

      if (Object.values(uploadStatusByFileKey).includes("failed")) {
        setUploadError("Có tệp tải lên thất bại. Vui lòng xóa tệp lỗi rồi chọn lại.");
        return;
      }

      const attachmentUrls = existingAttachmentUrls;
      await onSubmit({
        boardingId: record.id,
        description: trimmedDescription,
        alertLevel,
        visibilityStatus,
        attachmentUrl: attachmentUrls[0] || null,
        attachmentUrls,
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Tải tệp lên thất bại. Vui lòng thử lại.");
    } finally {
      submitLockRef.current = false;
      setIsSubmitLocked(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <StaffBoardingUpdatePetSummary record={record} />

        {draftUpdate ? (
          <div className="rounded-xl border border-petcenter-warning-text/20 bg-petcenter-warning-bg px-4 py-3 text-sm font-medium text-petcenter-warning-text">
            Đang chỉnh sửa bản nháp đã lưu lúc {draftUpdate.updatedAt ? new Date(draftUpdate.updatedAt).toLocaleString("vi-VN") : "vừa xong"}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-[15px] font-semibold text-[#0F172A]">Thời gian cập nhật</label>
          <div className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[15px] font-medium text-[#475569] shadow-sm">
            <Clock className="h-4 w-4 text-[#0D9488]" />
            <span>{createdAtLabel}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-semibold text-[#0F172A]">Trạng thái tổng quát</label>
          <StaffBoardingUpdateAlertSelector
            value={alertLevel}
            onChange={setAlertLevel}
            disabled={isBusy}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-[15px] font-semibold text-[#0F172A]">
              Ghi chú chăm sóc <span className="text-[#EF4444]">*</span>
            </label>
            <span className="text-sm font-medium text-[#94A3B8]">
              {description.length}/{maxDescriptionLength}
            </span>
          </div>
          <Textarea
            value={description}
            disabled={isBusy}
            maxLength={maxDescriptionLength}
            onChange={(event) => {
              setDescription(event.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Ví dụ: Bé ăn uống bình thường, đi vệ sinh tốt, tinh thần ổn định..."
            className="min-h-35 resize-none rounded-xl border-[#E2E8F0] bg-white px-4 py-3 text-[15px] text-[#0F172A] placeholder:text-[#94A3B8] shadow-sm focus-visible:border-[#0D9488] focus-visible:ring-4 focus-visible:ring-[#0D9488]/10 transition-all"
          />
          {validationError ? (
            <p className="text-sm font-medium text-[#EF4444] mt-1.5">{validationError}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-semibold text-[#0F172A]">Ảnh / Video cập nhật</label>
          <StaffBoardingUpdateUploadBox
            files={files}
            onFilesChange={handleFilesChange}
            disabled={isBusy}
            error={uploadError}
            getFileStatus={(file) => uploadStatusByFileKey[getFileKey(file)] ?? "idle"}
            maxFiles={Math.max(maxAttachmentCount - existingAttachmentUrls.length, 0)}
          />
          {existingAttachmentUrls.length > 0 ? (
            <div className="space-y-2">
              {existingAttachmentUrls.map((url, index) => (
                <SavedAttachmentPreview
                  key={url}
                  url={url}
                  index={index}
                  disabled={isBusy}
                  onRemove={() => setExistingAttachmentUrls(existingAttachmentUrls.filter((_, urlIndex) => urlIndex !== index))}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-[15px] font-semibold text-[#0F172A]">Hiển thị nhật ký</label>
          <div className="grid grid-cols-2 gap-3">
            {staffBoardingUpdateVisibilityOptions.map((option) => {
              const Icon = option.value === "PUBLISHED" ? Eye : EyeOff;
              const isActive = visibilityStatus === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setVisibilityStatus(option.value)}
                  className={cn(
                    "flex flex-col rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60",
                    isActive
                      ? "border-[#0D9488] bg-[#0D9488]/5 shadow-sm ring-1 ring-[#0D9488]"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  )}
                >
                  <span className={cn(
                    "flex items-center gap-2 text-[15px] font-bold",
                    isActive ? "text-[#0D9488]" : "text-[#475569]"
                  )}>
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </span>
                  <span className={cn(
                    "mt-1 block text-[13px] leading-relaxed",
                    isActive ? "text-[#0F766E]/80" : "text-[#64748B]"
                  )}>
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-[15px] font-medium text-[#B91C1C] flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-row justify-end gap-3 border-t border-[#E2E8F0] bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={onCancel}
          className="h-11 rounded-xl px-6 font-medium border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isBusy || isUploadingAttachments}
          className="h-11 rounded-xl bg-[#0D9488] px-8 font-medium text-white shadow-sm hover:bg-[#0F766E] transition-colors"
        >
          {isUploadingAttachments ? "Đang tải file..." : isBusy ? "Đang xử lý..." : visibilityStatus === "DRAFT" ? "Lưu nháp" : "Lưu cập nhật"}
        </Button>
      </div>
    </form>
  );
}
