export type UploadedImageDto = {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export type UploadedFileDto = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: "image" | "video" | "raw" | "auto";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
};
