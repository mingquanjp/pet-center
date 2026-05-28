import { apiRequest } from "@/lib/api";

export interface CloudinaryUploadResponse {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  originalFilename: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export async function uploadBoardingUpdateAttachmentToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await apiRequest<Omit<CloudinaryUploadResponse, "originalFilename">>("/uploads/file", {
    method: "POST",
    body: formData,
  });

  return {
    ...response.data,
    originalFilename: file.name,
  };
}
