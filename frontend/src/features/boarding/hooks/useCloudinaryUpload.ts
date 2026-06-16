import { useState } from "react";
import { uploadBoardingUpdateAttachmentToCloudinary, type CloudinaryUploadResponse } from "../api/cloudinary.api";

export function useCloudinaryUpload() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (file: File): Promise<CloudinaryUploadResponse> => {
    try {
      setIsPending(true);
      return await uploadBoardingUpdateAttachmentToCloudinary(file);
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}
