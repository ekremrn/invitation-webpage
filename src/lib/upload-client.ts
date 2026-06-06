import { MOCK_UPLOAD_PROGRESS_INTERVAL_MS } from "@/config/upload";
import type { EventKey } from "@/types/event";
import type {
  UploadSignClientMetadata,
  UploadSignErrorResponse,
  UploadSignRequest,
  UploadSignResponse,
  UploadSignSuccessResponse,
} from "@/types/upload";

type UploadFileInput = {
  eventKey: EventKey;
  file: File;
  sessionId: string;
  client: UploadSignClientMetadata;
  onProgress: (progress: number) => void;
};

const LOCAL_UPLOAD_FALLBACK_ENABLED = process.env.NODE_ENV === "development";

export class UploadClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "UploadClientError";
  }
}

export async function uploadFileToObjectStorage({
  eventKey,
  file,
  sessionId,
  client,
  onProgress,
}: UploadFileInput): Promise<UploadSignSuccessResponse> {
  const signResponse = await requestUploadSignature({
    event: eventKey,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    sessionId,
    client,
  });

  if (isUploadSignErrorResponse(signResponse)) {
    if (
      signResponse.error.code === "STORAGE_CONFIGURATION_ERROR" &&
      LOCAL_UPLOAD_FALLBACK_ENABLED
    ) {
      return simulateLocalUpload({
        eventKey,
        file,
        sessionId,
        onProgress,
      });
    }

    throw new UploadClientError(signResponse.error.code, signResponse.error.message);
  }

  await putFileWithProgress({
    uploadUrl: signResponse.uploadUrl,
    file,
    onProgress,
  });

  return signResponse;
}

function createClientMetadata(): UploadSignClientMetadata {
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
}

export function getCurrentClientMetadata(): UploadSignClientMetadata {
  return createClientMetadata();
}

async function requestUploadSignature(
  payload: UploadSignRequest,
): Promise<UploadSignResponse> {
  const response = await fetch("/api/upload/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = (await response.json()) as UploadSignResponse;

  if (!response.ok && !isUploadSignErrorResponse(responseBody)) {
    throw new UploadClientError("SIGNING_FAILED", "Upload URL could not be created.");
  }

  return responseBody;
}

function putFileWithProgress({
  uploadUrl,
  file,
  onProgress,
}: {
  uploadUrl: string;
  file: File;
  onProgress: (progress: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(new UploadClientError("UPLOAD_FAILED", "File upload failed."));
    };

    xhr.onerror = () => {
      reject(new UploadClientError("UPLOAD_FAILED", "File upload failed."));
    };

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

function simulateLocalUpload({
  eventKey,
  file,
  sessionId,
  onProgress,
}: {
  eventKey: EventKey;
  file: File;
  sessionId: string;
  onProgress: (progress: number) => void;
}): Promise<UploadSignSuccessResponse> {
  const uploadId = createLocalUploadId();
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 30 * 60 * 1000).toISOString();

  return new Promise((resolve) => {
    let progress = 0;
    const timerId = window.setInterval(() => {
      progress = Math.min(100, progress + 16);
      onProgress(progress);

      if (progress < 100) {
        return;
      }

      window.clearInterval(timerId);
      resolve({
        uploadId,
        sessionId,
        objectKey: `uploads/${eventKey}/${sessionId}/files/local_${uploadId}_${file.name}`,
        metadataKey: `uploads/${eventKey}/${sessionId}/metadata/local_${uploadId}.json`,
        uploadUrl: "local-development-upload",
        expiresAt,
      });
    }, MOCK_UPLOAD_PROGRESS_INTERVAL_MS);
  });
}

function createLocalUploadId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `upload_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
  }

  return `upload_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function isUploadSignErrorResponse(
  response: UploadSignResponse,
): response is UploadSignErrorResponse {
  return "error" in response;
}
