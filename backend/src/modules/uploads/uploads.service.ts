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
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime", // .mov files
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
      "Định dạng tệp không hợp lệ. Vui lòng chọn ảnh (JPG, PNG, WEBP) hoặc video (MP4, WEBM, OGG, MOV).",
      "INVALID_FILE_TYPE",
      httpStatus.BAD_REQUEST
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AppError("Tệp tin tải lên không được vượt quá 100MB", "FILE_TOO_LARGE", httpStatus.BAD_REQUEST);
  }

  const result = await uploadBuffer(file.buffer, {
    folder: env.CLOUDINARY_UPLOAD_FOLDER,
    resource_type: "auto",
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
