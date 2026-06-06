import { MAX_FILE_SIZE_BYTES } from "@/config/upload";
import type { UploadValidationError } from "@/types/upload";

export function isSupportedUploadMimeType(fileType: string): boolean {
  return fileType.startsWith("image/") || fileType.startsWith("video/");
}

export function getUploadValidationError(
  file: Pick<File, "size" | "type">,
): UploadValidationError | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "fileTooLarge";
  }

  if (!isSupportedUploadMimeType(file.type)) {
    return "unsupportedFile";
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
