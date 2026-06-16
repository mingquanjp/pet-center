import { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Trash2, UploadCloud, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StaffBoardingUpdateUploadBoxProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  error?: string | null;
  maxFiles?: number;
  getFileStatus?: (file: File) => "idle" | "uploading" | "failed";
}

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
const maxFileSize = 100 * 1024 * 1024;

function validateFile(file: File) {
  if (!acceptedTypes.includes(file.type)) {
    return "Tệp không đúng định dạng. Vui lòng chọn JPG, PNG, WEBP hoặc MP4.";
  }

  if (file.size > maxFileSize) {
    return "Tệp vượt quá 100MB. Vui lòng chọn tệp nhỏ hơn.";
  }

  return null;
}

function FilePreview({
  file,
  onRemove,
  disabled,
  status = "idle",
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
  status?: "idle" | "uploading" | "failed";
}) {
  const previewUrl = useMemo(() => (
    file.type.startsWith("image/") ? URL.createObjectURL(file) : null
  ), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : file.type.startsWith("video/") ? (
          <Video className="h-6 w-6 text-[#0D9488]" />
        ) : (
          <ImageIcon className="h-6 w-6 text-[#0D9488]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#0F172A]">{file.name}</p>
        <p className={cn(
          "text-[13px] font-medium",
          status === "failed" ? "text-[#EF4444]" : status === "uploading" ? "text-[#0D9488]" : "text-[#64748B]"
        )}>
          {status === "uploading"
            ? "Đang tải lên..."
            : status === "failed"
              ? "Tải lên thất bại"
              : `${(file.size / 1024 / 1024).toFixed(1)}MB`}
        </p>
      </div>
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

export function StaffBoardingUpdateUploadBox({
  files,
  onFilesChange,
  disabled,
  error,
  maxFiles = 10,
  getFileStatus,
}: StaffBoardingUpdateUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(nextFiles: FileList | File[] | null | undefined) {
    if (!nextFiles) return;

    const fileList = Array.from(nextFiles);
    if (files.length + fileList.length > maxFiles) {
      setLocalError(`Tối đa ${maxFiles} file cho mỗi cập nhật.`);
      return;
    }

    const firstError = fileList.map(validateFile).find(Boolean);
    if (firstError) {
      setLocalError(firstError);
      return;
    }

    setLocalError(null);
    onFilesChange([...files, ...fileList]);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
          "disabled:cursor-not-allowed disabled:opacity-60",
          isDragging
            ? "border-[#0D9488] bg-[#0D9488]/5"
            : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#0D9488]/50 hover:bg-[#F1F5F9]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          multiple
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <div className="mb-3 rounded-full border border-[#E2E8F0] bg-white p-3 shadow-sm">
          <UploadCloud className="h-6 w-6 text-[#0D9488]" />
        </div>
        <span className="text-[15px] font-semibold text-[#0F172A]">
          Kéo thả ảnh/video hoặc click để tải lên
        </span>
        <span className="mt-1 text-[13px] font-medium text-[#64748B]">
          Hỗ trợ JPG, PNG, MP4. Tối đa {maxFiles} file, mỗi file tối đa 100MB.
        </span>
      </button>

      {localError || error ? (
        <p className="text-sm font-medium text-[#EF4444]">{localError || error}</p>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${file.size}-${index}`}
              file={file}
              status={getFileStatus?.(file) ?? "idle"}
              disabled={disabled}
              onRemove={() => {
                setLocalError(null);
                onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
