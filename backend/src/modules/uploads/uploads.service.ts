import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../config/cloudinary.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import type { UploadedImageDto, UploadedFileDto } from "./uploads.types.js";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB limit for mixed media (videos/images)
const allowedFileMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov files
]);
const rawFileMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export async function uploadImage(file: Express.Multer.File): Promise<UploadedImageDto> {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError("Cloudinary chưa được cấu hình", "CLOUDINARY_NOT_CONFIGURED", httpStatus.SERVICE_UNAVAILABLE);
  }

  if (!allowedImageMimeTypes.has(file.mimetype)) {
    throw new AppError("Vui lòng chọn ảnh định dạng JPG, PNG hoặc WEBP", "INVALID_IMAGE_TYPE", httpStatus.BAD_REQUEST);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError("Ảnh không được vượt quá 5MB", "IMAGE_TOO_LARGE", httpStatus.BAD_REQUEST);
  }

  const result = await uploadBuffer(file.buffer, {
    folder: env.CLOUDINARY_UPLOAD_FOLDER,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  });

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes
  };
}

export async function uploadFile(file: Express.Multer.File): Promise<UploadedFileDto & { secure_url: string; public_id: string }> {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError("Cloudinary chưa được cấu hình", "CLOUDINARY_NOT_CONFIGURED", httpStatus.SERVICE_UNAVAILABLE);
  }

  if (!allowedFileMimeTypes.has(file.mimetype)) {
    throw new AppError(
      "Định dạng tệp không hợp lệ. Vui lòng chọn PDF, Word, Excel, PowerPoint, ảnh hoặc video.",
      "INVALID_FILE_TYPE",
      httpStatus.BAD_REQUEST
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AppError("Tệp tin tải lên không được vượt quá 100MB", "FILE_TOO_LARGE", httpStatus.BAD_REQUEST);
  }

  const isRawFile = rawFileMimeTypes.has(file.mimetype);
  const result = await uploadBuffer(file.buffer, {
    folder: env.CLOUDINARY_UPLOAD_FOLDER,
    resource_type: isRawFile ? "raw" : "auto",
    ...(isRawFile ? { public_id: `${randomUUID()}${extname(file.originalname).toLowerCase()}` } : {}),
  });

  return {
    publicId: result.public_id,
    public_id: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    secure_url: result.secure_url,
    resourceType: result.resource_type as "image" | "video" | "raw" | "auto",
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height
  };
}

export function createFileViewUrl(fileUrl: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(fileUrl);
  } catch {
    throw new AppError("URL tệp không hợp lệ", "INVALID_FILE_URL", httpStatus.BAD_REQUEST);
  }

  const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
  const [cloudName, resourceType, deliveryType, version, ...publicIdParts] = pathParts;
  const isCloudinaryFile =
    parsedUrl.protocol === "https:" &&
    parsedUrl.hostname === "res.cloudinary.com" &&
    cloudName === env.CLOUDINARY_CLOUD_NAME &&
    deliveryType === "upload" &&
    /^v\d+$/.test(version ?? "") &&
    publicIdParts.length > 0;

  if (!isCloudinaryFile) {
    throw new AppError("URL tệp không thuộc kho lưu trữ của hệ thống", "INVALID_FILE_URL", httpStatus.BAD_REQUEST);
  }

  if (resourceType !== "raw") {
    return fileUrl;
  }

  return cloudinary.utils.private_download_url(decodeURIComponent(publicIdParts.join("/")), "", {
    resource_type: "raw",
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
    attachment: false,
  });
}

function uploadBuffer(
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(new AppError("Không thể upload tệp lên Cloudinary", "CLOUDINARY_UPLOAD_FAILED", httpStatus.SERVICE_UNAVAILABLE, error.message));
        return;
      }

      if (!result) {
        reject(new AppError("Cloudinary không trả về kết quả upload", "CLOUDINARY_UPLOAD_EMPTY", httpStatus.SERVICE_UNAVAILABLE));
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}
