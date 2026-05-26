import { apiRequest } from "@/lib/api";
import type { UploadedImage } from "../types/upload.types";

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
};
