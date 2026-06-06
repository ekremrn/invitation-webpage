import { createHmac } from "node:crypto";

const IP_HEADER_CANDIDATES = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"];

export class UploadSecurityConfigurationError extends Error {
  constructor(message = "Upload security environment is not configured.") {
    super(message);
    this.name = "UploadSecurityConfigurationError";
  }
}

export function getRequestIp(headers: Headers): string | undefined {
  for (const headerName of IP_HEADER_CANDIDATES) {
    const headerValue = headers.get(headerName);

    if (!headerValue) {
      continue;
    }

    const firstValue = headerValue.split(",")[0]?.trim();

    if (firstValue) {
      return firstValue;
    }
  }

  return undefined;
}

export function createIpHash(ipAddress: string | undefined): string | undefined {
  if (!ipAddress) {
    return undefined;
  }

  const secret = process.env.UPLOAD_IP_HASH_SECRET;

  if (!secret) {
    throw new UploadSecurityConfigurationError(
      "Missing required environment variable: UPLOAD_IP_HASH_SECRET",
    );
  }

  return `sha256:${createHmac("sha256", secret).update(ipAddress).digest("hex")}`;
}
