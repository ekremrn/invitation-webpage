import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UPLOAD_SIGN_URL_TTL_SECONDS } from "@/config/upload";
import type { EventKey } from "@/types/event";

type ObjectStorageEnvironment = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

type PresignedPutUrlInput = {
  objectKey: string;
  fileType: string;
};

type JsonObjectInput = {
  key: string;
  body: unknown;
};

const REQUIRED_OBJECT_STORAGE_ENV_KEYS = [
  "OBJECT_STORAGE_ENDPOINT",
  "OBJECT_STORAGE_REGION",
  "OBJECT_STORAGE_BUCKET",
  "OBJECT_STORAGE_ACCESS_KEY_ID",
  "OBJECT_STORAGE_SECRET_ACCESS_KEY",
] as const;

export class ObjectStorageConfigurationError extends Error {
  constructor(message = "Object Storage environment is not configured.") {
    super(message);
    this.name = "ObjectStorageConfigurationError";
  }
}

export function getObjectStorageEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): ObjectStorageEnvironment {
  const missingKey = REQUIRED_OBJECT_STORAGE_ENV_KEYS.find((key) => !env[key]);

  if (missingKey) {
    throw new ObjectStorageConfigurationError(
      `Missing required environment variable: ${missingKey}`,
    );
  }

  return {
    endpoint: env.OBJECT_STORAGE_ENDPOINT as string,
    region: env.OBJECT_STORAGE_REGION as string,
    bucketName: env.OBJECT_STORAGE_BUCKET as string,
    accessKeyId: env.OBJECT_STORAGE_ACCESS_KEY_ID as string,
    secretAccessKey: env.OBJECT_STORAGE_SECRET_ACCESS_KEY as string,
  };
}

export function createObjectStorageClient(
  environment = getObjectStorageEnvironment(),
): S3Client {
  return new S3Client({
    region: environment.region,
    endpoint: environment.endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId: environment.accessKeyId,
      secretAccessKey: environment.secretAccessKey,
    },
  });
}

export async function createPresignedPutUrl({
  objectKey,
  fileType,
}: PresignedPutUrlInput): Promise<string> {
  const environment = getObjectStorageEnvironment();
  const command = new PutObjectCommand({
    Bucket: environment.bucketName,
    Key: objectKey,
    ContentType: fileType,
  });

  return getSignedUrl(createObjectStorageClient(environment), command, {
    expiresIn: UPLOAD_SIGN_URL_TTL_SECONDS,
  });
}

export async function writeJsonObject({ key, body }: JsonObjectInput): Promise<void> {
  const environment = getObjectStorageEnvironment();
  const command = new PutObjectCommand({
    Bucket: environment.bucketName,
    Key: key,
    Body: JSON.stringify(body, null, 2),
    ContentType: "application/json",
  });

  await createObjectStorageClient(environment).send(command);
}

export function createObjectKey({
  event,
  sessionId,
  uploadId,
  fileName,
  issuedAt = new Date(),
}: {
  event: EventKey;
  sessionId: string;
  uploadId: string;
  fileName: string;
  issuedAt?: Date;
}): string {
  return `uploads/${event}/${sessionId}/files/${createSafeTimestamp(issuedAt)}_${uploadId}.${getSafeExtension(fileName)}`;
}

export function createMetadataKey({
  event,
  sessionId,
  uploadId,
  issuedAt = new Date(),
}: {
  event: EventKey;
  sessionId: string;
  uploadId: string;
  issuedAt?: Date;
}): string {
  return `uploads/${event}/${sessionId}/metadata/${createSafeTimestamp(issuedAt)}_${uploadId}.json`;
}

function createSafeTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z").replaceAll(":", "-");
}

function getSafeExtension(fileName: string): string {
  const rawExtension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const safeExtension = rawExtension.replace(/[^a-z0-9]/g, "");

  return safeExtension || "bin";
}
