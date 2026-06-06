import type { EventKey } from "./event";

export type UploadQueueItemStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error"
  | "rejected";

export type UploadValidationError = "fileTooLarge" | "unsupportedFile";

export type UploadQueueItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: UploadQueueItemStatus;
  progress: number;
  error?: UploadValidationError;
  errorMessage?: string;
  uploadId?: string;
  objectKey?: string;
};

export type UploadSignClientMetadata = {
  timezone?: string;
  language?: string;
  viewport?: string;
};

export type UploadSignRequest = {
  event: EventKey;
  fileName: string;
  fileType: string;
  fileSize: number;
  sessionId?: string;
  client?: UploadSignClientMetadata;
};

export type UploadSignSuccessResponse = {
  uploadId: string;
  sessionId: string;
  objectKey: string;
  metadataKey: string;
  uploadUrl: string;
  expiresAt: string;
};

export type UploadSignErrorCode =
  | "INVALID_JSON"
  | "INVALID_EVENT"
  | "INVALID_FILE_NAME"
  | "INVALID_FILE_TYPE"
  | "INVALID_FILE_SIZE"
  | "FILE_TOO_LARGE"
  | "UPLOAD_CONFIGURATION_ERROR"
  | "STORAGE_CONFIGURATION_ERROR"
  | "METADATA_WRITE_FAILED"
  | "SIGNING_FAILED";

export type UploadSignErrorResponse = {
  error: {
    code: UploadSignErrorCode;
    message: string;
  };
};

export type UploadSignResponse = UploadSignSuccessResponse | UploadSignErrorResponse;

export type UploadMetadataRecord = {
  event: EventKey;
  sessionId: string;
  uploadId: string;
  status: "signed";
  signIssuedAt: string;
  targetObjectKey: string;
  metadataKey: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  ipHash?: string;
  userAgent?: string;
  language?: string;
  timezone?: string;
  viewport?: string;
};
