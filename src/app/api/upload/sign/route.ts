import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { MAX_FILE_SIZE_BYTES, UPLOAD_SIGN_URL_TTL_SECONDS } from "@/config/upload";
import { isEventKey } from "@/config/events";
import { isSupportedUploadMimeType } from "@/lib/file-validation";
import {
  createMetadataKey,
  createObjectKey,
  createPresignedPutUrl,
  ObjectStorageConfigurationError,
  writeJsonObject,
} from "@/lib/object-storage";
import {
  createIpHash,
  getRequestIp,
  UploadSecurityConfigurationError,
} from "@/lib/security";
import type {
  UploadMetadataRecord,
  UploadSignErrorCode,
  UploadSignErrorResponse,
  UploadSignRequest,
  UploadSignSuccessResponse,
} from "@/types/upload";

export const runtime = "nodejs";

const SESSION_ID_PATTERN = /^session_[A-Za-z0-9_-]{8,64}$/;

export async function POST(request: Request) {
  const body = await parseJson(request);

  if (!body) {
    return createErrorResponse("INVALID_JSON", "Request body must be valid JSON.");
  }

  const validation = validateUploadSignRequest(body);

  if (!validation.ok) {
    return createErrorResponse(validation.code, validation.message);
  }

  const { event, fileName, fileType, fileSize, client } = validation.value;
  const issuedAt = new Date();
  const signIssuedAt = issuedAt.toISOString();
  const uploadId = createUploadId();
  const sessionId = getValidSessionId(validation.value.sessionId);
  const objectKey = createObjectKey({
    event,
    sessionId,
    uploadId,
    fileName,
    issuedAt,
  });
  const metadataKey = createMetadataKey({
    event,
    sessionId,
    uploadId,
    issuedAt,
  });
  const expiresAt = new Date(
    issuedAt.getTime() + UPLOAD_SIGN_URL_TTL_SECONDS * 1000,
  ).toISOString();

  let uploadUrl: string;

  try {
    uploadUrl = await createPresignedPutUrl({
      objectKey,
      fileType,
    });
  } catch (error) {
    if (error instanceof ObjectStorageConfigurationError) {
      return createErrorResponse(
        "STORAGE_CONFIGURATION_ERROR",
        "Upload storage is not configured.",
        500,
      );
    }

    return createErrorResponse("SIGNING_FAILED", "Upload URL could not be created.", 500);
  }

  try {
    const metadata: UploadMetadataRecord = {
      event,
      sessionId,
      uploadId,
      status: "signed",
      signIssuedAt,
      targetObjectKey: objectKey,
      metadataKey,
      originalFileName: fileName,
      fileType,
      fileSize,
      ipHash: createIpHash(getRequestIp(request.headers)),
      userAgent: request.headers.get("user-agent") ?? undefined,
      language: client?.language ?? request.headers.get("accept-language") ?? undefined,
      timezone: client?.timezone,
      viewport: client?.viewport,
    };

    await writeJsonObject({
      key: metadataKey,
      body: metadata,
    });
  } catch (error) {
    if (error instanceof ObjectStorageConfigurationError) {
      return createErrorResponse(
        "STORAGE_CONFIGURATION_ERROR",
        "Upload storage is not configured.",
        500,
      );
    }

    if (error instanceof UploadSecurityConfigurationError) {
      return createErrorResponse(
        "UPLOAD_CONFIGURATION_ERROR",
        "Upload security is not configured.",
        500,
      );
    }

    return createErrorResponse(
      "METADATA_WRITE_FAILED",
      "Upload metadata could not be created.",
      500,
    );
  }

  const response: UploadSignSuccessResponse = {
    uploadId,
    sessionId,
    objectKey,
    metadataKey,
    uploadUrl,
    expiresAt,
  };

  return NextResponse.json(response);
}

async function parseJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

type UploadValidationResult =
  | {
      ok: true;
      value: UploadSignRequest;
    }
  | {
      ok: false;
      code: UploadSignErrorCode;
      message: string;
    };

function validateUploadSignRequest(body: unknown): UploadValidationResult {
  if (!isRecord(body)) {
    return {
      ok: false,
      code: "INVALID_JSON",
      message: "Request body must be a JSON object.",
    };
  }

  if (typeof body.event !== "string" || !isEventKey(body.event)) {
    return {
      ok: false,
      code: "INVALID_EVENT",
      message: "Event must be henna or ceremony.",
    };
  }

  if (typeof body.fileName !== "string" || body.fileName.trim().length === 0) {
    return {
      ok: false,
      code: "INVALID_FILE_NAME",
      message: "File name is required.",
    };
  }

  if (typeof body.fileType !== "string" || !isSupportedUploadMimeType(body.fileType)) {
    return {
      ok: false,
      code: "INVALID_FILE_TYPE",
      message: "File type must be image/* or video/*.",
    };
  }

  if (
    typeof body.fileSize !== "number" ||
    !Number.isFinite(body.fileSize) ||
    body.fileSize <= 0
  ) {
    return {
      ok: false,
      code: "INVALID_FILE_SIZE",
      message: "File size must be a positive number.",
    };
  }

  if (body.fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: "File exceeds the 300 MB limit.",
    };
  }

  return {
    ok: true,
    value: {
      event: body.event,
      fileName: body.fileName.trim(),
      fileType: body.fileType,
      fileSize: body.fileSize,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      client: isRecord(body.client) ? parseClientMetadata(body.client) : undefined,
    },
  };
}

function parseClientMetadata(
  client: Record<string, unknown>,
): UploadSignRequest["client"] {
  return {
    timezone: typeof client.timezone === "string" ? client.timezone : undefined,
    language: typeof client.language === "string" ? client.language : undefined,
    viewport: typeof client.viewport === "string" ? client.viewport : undefined,
  };
}

function getValidSessionId(sessionId: string | undefined): string {
  if (sessionId && SESSION_ID_PATTERN.test(sessionId)) {
    return sessionId;
  }

  return `session_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function createUploadId(): string {
  return `upload_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function createErrorResponse(
  code: UploadSignErrorCode,
  message: string,
  status = 400,
) {
  const response: UploadSignErrorResponse = {
    error: {
      code,
      message,
    },
  };

  return NextResponse.json(response, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
