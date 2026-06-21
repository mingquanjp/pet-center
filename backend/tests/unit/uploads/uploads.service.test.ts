import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadImage, uploadFile, createFileViewUrl } from "../../../src/modules/uploads/uploads.service.js";
import { env } from "../../../src/config/env.js";
import { cloudinary } from "../../../src/config/cloudinary.js";
import { AppError } from "../../../src/shared/errors/app-error.js";

// Mock env
vi.mock("../../../src/config/env.js", () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: "test_cloud",
    CLOUDINARY_API_KEY: "test_key",
    CLOUDINARY_API_SECRET: "test_secret",
    CLOUDINARY_UPLOAD_FOLDER: "test_folder"
  }
}));

// Mock cloudinary config & functions
vi.mock("../../../src/config/cloudinary.js", () => ({
  cloudinary: {
    uploader: {
      upload_stream: vi.fn()
    },
    utils: {
      private_download_url: vi.fn()
    }
  }
}));

const mockUploadStream = vi.mocked(cloudinary.uploader.upload_stream);
const mockPrivateDownloadUrl = vi.mocked(cloudinary.utils.private_download_url);

describe("uploads.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.CLOUDINARY_CLOUD_NAME = "test_cloud";
    env.CLOUDINARY_API_KEY = "test_key";
    env.CLOUDINARY_API_SECRET = "test_secret";
  });

  const createMockFile = (size: number, mimetype: string, originalname = "test.jpg"): Express.Multer.File => ({
    fieldname: "file",
    originalname,
    encoding: "7bit",
    mimetype,
    size,
    buffer: Buffer.from("test content"),
    destination: "",
    filename: "",
    path: "",
    stream: null as any
  });

  describe("uploadImage", () => {
    it("UTX-UPLOADS-473 - uploadImage uploads image successfully to Cloudinary and returns metadata", async () => {
      const mockResult = {
        public_id: "public_123",
        url: "http://image.url",
        secure_url: "https://image.url",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 50000
      };

      // Mock upload_stream to invoke callback with result
      mockUploadStream.mockImplementationOnce((options: any, callback: any) => {
        return {
          end: vi.fn(() => callback(null, mockResult))
        } as any;
      });

      const file = createMockFile(1024, "image/jpeg");
      const result = await uploadImage(file);

      expect(mockUploadStream).toHaveBeenCalled();
      expect(result).toEqual({
        publicId: "public_123",
        url: "http://image.url",
        secureUrl: "https://image.url",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 50000
      });
    });

    it("UTX-UPLOADS-474 - uploadImage throws AppError for invalid mimetype, oversized files, or missing config", async () => {
      // 1. Config missing
      env.CLOUDINARY_CLOUD_NAME = "";
      const file = createMockFile(1024, "image/jpeg");
      await expect(uploadImage(file)).rejects.toThrow(
        new AppError("Cloudinary chưa được cấu hình", "CLOUDINARY_NOT_CONFIGURED", 503)
      );
      env.CLOUDINARY_CLOUD_NAME = "test_cloud";

      // 2. Invalid mimetype
      const invalidFile = createMockFile(1024, "text/plain");
      await expect(uploadImage(invalidFile)).rejects.toThrow(
        new AppError("Vui lòng chọn ảnh định dạng JPG, PNG hoặc WEBP", "INVALID_IMAGE_TYPE", 400)
      );

      // 3. Oversized file
      const hugeFile = createMockFile(6 * 1024 * 1024, "image/png"); // 6MB > 5MB
      await expect(uploadImage(hugeFile)).rejects.toThrow(
        new AppError("Ảnh không được vượt quá 5MB", "IMAGE_TOO_LARGE", 400)
      );
    });
  });

  describe("uploadFile", () => {
    it("UTX-UPLOADS-475 - uploadFile uploads generic document or video file successfully", async () => {
      const mockResult = {
        public_id: "file_123.pdf",
        url: "http://file.url",
        secure_url: "https://file.url",
        resource_type: "raw",
        format: "pdf",
        bytes: 150000
      };

      mockUploadStream.mockImplementationOnce((options: any, callback: any) => {
        return {
          end: vi.fn(() => callback(null, mockResult))
        } as any;
      });

      const file = createMockFile(150000, "application/pdf", "document.pdf");
      const result = await uploadFile(file);

      expect(mockUploadStream).toHaveBeenCalled();
      expect(result.publicId).toBe("file_123.pdf");
      expect(result.resourceType).toBe("raw");
    });

    it("UTX-UPLOADS-476 - uploadFile rejects invalid types or oversized documents", async () => {
      const invalidFile = createMockFile(1024, "application/zip");
      await expect(uploadFile(invalidFile)).rejects.toThrow(
        new AppError("Định dạng tệp không hợp lệ. Vui lòng chọn PDF, Word, Excel, PowerPoint, ảnh hoặc video.", "INVALID_FILE_TYPE", 400)
      );

      const hugeFile = createMockFile(101 * 1024 * 1024, "video/mp4"); // 101MB > 100MB
      await expect(uploadFile(hugeFile)).rejects.toThrow(
        new AppError("Tệp tin tải lên không được vượt quá 100MB", "FILE_TOO_LARGE", 400)
      );
    });
  });

  describe("createFileViewUrl", () => {
    it("UTX-UPLOADS-477 - createFileViewUrl returns original URL for non-raw resources or signed URL for raw resources", () => {
      // 1. Non-raw resource (e.g. image) returns original URL
      const imageUrl = "https://res.cloudinary.com/test_cloud/image/upload/v12345/mock_image.jpg";
      const resultImage = createFileViewUrl(imageUrl);
      expect(resultImage).toBe(imageUrl);

      // 2. Raw resource returns signed URL via private_download_url
      const rawUrl = "https://res.cloudinary.com/test_cloud/raw/upload/v12345/folder/mock_doc.pdf";
      mockPrivateDownloadUrl.mockReturnValueOnce("https://private-download.com/signed-url");

      const resultRaw = createFileViewUrl(rawUrl);
      expect(mockPrivateDownloadUrl).toHaveBeenCalledWith("folder/mock_doc.pdf", "", expect.any(Object));
      expect(resultRaw).toBe("https://private-download.com/signed-url");
    });

    it("UTX-UPLOADS-478 - createFileViewUrl throws AppError for malformed or external URL patterns", () => {
      // Invalid URL format
      expect(() => createFileViewUrl("not-a-url")).toThrow(
        new AppError("URL tệp không hợp lệ", "INVALID_FILE_URL", 400)
      );

      // External domain
      expect(() => createFileViewUrl("https://google.com/doc.pdf")).toThrow(
        new AppError("URL tệp không thuộc kho lưu trữ của hệ thống", "INVALID_FILE_URL", 400)
      );

      // Mismatched cloud name
      expect(() => createFileViewUrl("https://res.cloudinary.com/other_cloud/raw/upload/v123/doc.pdf")).toThrow(
        new AppError("URL tệp không thuộc kho lưu trữ của hệ thống", "INVALID_FILE_URL", 400)
      );
    });
  });
});
