import { apiRequest } from "@/lib/api";
import type { UploadedFile, UploadedImage } from "../types/upload.types";

export const uploadsApi = {
  async uploadImage(file: File): Promise<UploadedImage> {
    const formData = new FormData();
    formData.set("file", file);

    const response = await apiRequest<UploadedImage>("/uploads/image", {
      method: "POST",
      body: formData,
    });

    return response.data;
  },
  async uploadFile(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.set("file", file);

    const response = await apiRequest<UploadedFile>("/uploads/file", {
      method: "POST",
      body: formData,
    });

    return response.data;
  },
  async getFileViewUrl(url: string): Promise<string> {
    const response = await apiRequest<{ url: string }>("/uploads/file/view-url", {
      method: "POST",
      body: JSON.stringify({ url }),
    });

    return response.data.url;
  },
};
