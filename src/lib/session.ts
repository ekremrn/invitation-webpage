const UPLOAD_SESSION_STORAGE_KEY = "irem-ekrem-upload-session-id";

export function getOrCreateUploadSessionId(): string {
  const existingSessionId = sessionStorage.getItem(UPLOAD_SESSION_STORAGE_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = createUploadSessionId();
  sessionStorage.setItem(UPLOAD_SESSION_STORAGE_KEY, sessionId);

  return sessionId;
}

export function saveUploadSessionId(sessionId: string): void {
  sessionStorage.setItem(UPLOAD_SESSION_STORAGE_KEY, sessionId);
}

function createUploadSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `session_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
  }

  return `session_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
