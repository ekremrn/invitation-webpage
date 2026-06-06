"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LineIcon } from "@/components/layout/LineIcon";
import { ACCEPTED_UPLOAD_MIME_TYPES, MAX_PARALLEL_UPLOADS } from "@/config/upload";
import { siteCopy } from "@/content/copy";
import { formatFileSize, getUploadValidationError } from "@/lib/file-validation";
import { getOrCreateUploadSessionId, saveUploadSessionId } from "@/lib/session";
import {
  getCurrentClientMetadata,
  uploadFileToObjectStorage,
} from "@/lib/upload-client";
import type { EventConfig } from "@/types/event";
import type { UploadQueueItem, UploadValidationError } from "@/types/upload";

type UploadDropzoneProps = {
  event: EventConfig;
};

const uploadErrorCopy = {
  fileTooLarge: siteCopy.upload.fileTooLarge,
  unsupportedFile: siteCopy.upload.unsupportedFile,
} satisfies Record<UploadValidationError, string>;

function createQueueId(index: number): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `upload_${Date.now()}_${index}_${Math.random().toString(36).slice(2)}`;
}

function createQueueItem(file: File, index: number): UploadQueueItem {
  const validationError = getUploadValidationError(file);

  return {
    id: createQueueId(index),
    file,
    name: file.name || "Dosya",
    size: file.size,
    type: file.type,
    status: validationError ? "rejected" : "queued",
    progress: 0,
    error: validationError ?? undefined,
  };
}

export function UploadDropzone({ event }: UploadDropzoneProps) {
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [queueStarted, setQueueStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<UploadQueueItem[]>([]);
  const activeUploadsRef = useRef<Set<string>>(new Set());
  const queueStartedRef = useRef(false);
  const processQueueRef = useRef<() => void>(() => {});

  const queuedCount = useMemo(
    () => items.filter((item) => item.status === "queued").length,
    [items],
  );
  const hasSuccessfulUpload = useMemo(
    () => items.some((item) => item.status === "success"),
    [items],
  );

  const setQueueItems = useCallback((nextItems: UploadQueueItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const updateQueueItems = useCallback(
    (updater: (currentItems: UploadQueueItem[]) => UploadQueueItem[]) => {
      setQueueItems(updater(itemsRef.current));
    },
    [setQueueItems],
  );

  const processQueue = useCallback(() => {
    if (!queueStartedRef.current) {
      return;
    }

    const availableSlots = MAX_PARALLEL_UPLOADS - activeUploadsRef.current.size;

    if (availableSlots <= 0) {
      return;
    }

    const queuedItems = itemsRef.current
      .filter((item) => item.status === "queued")
      .slice(0, availableSlots);

    queuedItems.forEach((item) => {
      activeUploadsRef.current.add(item.id);
      updateQueueItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                status: "uploading",
                progress: Math.max(1, currentItem.progress),
                errorMessage: undefined,
              }
            : currentItem,
        ),
      );

      void uploadQueueItem({
        item,
        event,
        updateQueueItems,
        onSettled: () => {
          activeUploadsRef.current.delete(item.id);
          window.setTimeout(() => processQueueRef.current(), 0);
        },
      });
    });
  }, [event, updateQueueItems]);
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);

      if (files.length === 0) {
        return;
      }

      const nextItems = [
        ...itemsRef.current,
        ...files.map((file, index) => createQueueItem(file, index)),
      ];
      setQueueItems(nextItems);

      if (queueStartedRef.current) {
        window.setTimeout(processQueue, 0);
      }
    },
    [processQueue, setQueueItems],
  );

  const handleStartUpload = () => {
    queueStartedRef.current = true;
    setQueueStarted(true);
    processQueue();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="grid gap-5" data-event-key={event.key}>
      <div
        className={[
          "upload-dropzone rounded-invitation-card border border-dashed px-4 py-7 text-center shadow-[inset_0_1px_0_rgb(255_255_255_/_0.68)] sm:px-5 sm:py-8",
          isDragging ? "border-olive bg-cream/62" : "border-champagne/52 bg-pearl/58",
        ].join(" ")}
        data-dragging={isDragging}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_UPLOAD_MIME_TYPES}
          className="sr-only"
          onChange={handleInputChange}
        />
        <div className="upload-dropzone-icon mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/28 bg-pearl/64 text-olive">
          <LineIcon name="image-up" className="h-5 w-5" />
        </div>
        <p className="font-display text-[1.75rem] font-[300] leading-8 text-charcoal sm:text-3xl">
          {siteCopy.upload.chooseOrDrop}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">{siteCopy.upload.sizeLimit}</p>
        <button
          type="button"
          className="invitation-action mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-invitation-pill border border-olive/25 bg-olive/92 px-5 py-3 text-sm font-[400] text-pearl shadow-[0_8px_22px_rgb(63_74_54_/_0.12)] hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          onClick={() => inputRef.current?.click()}
        >
          <LineIcon name="image-up" className="h-4 w-4 shrink-0" />
          {siteCopy.upload.selectFiles}
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3" aria-live="polite">
          {items.map((item) => (
            <UploadQueueRow key={item.id} item={item} />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="invitation-action inline-flex min-h-11 items-center justify-center gap-2 rounded-invitation-pill border border-charcoal/15 bg-charcoal/92 px-5 py-3 text-sm font-[400] text-pearl shadow-[0_8px_22px_rgb(47_42_38_/_0.12)] hover:bg-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:border-muted/20 disabled:bg-muted/30 disabled:text-pearl/80 disabled:shadow-none"
        disabled={queueStarted || queuedCount === 0}
        onClick={handleStartUpload}
      >
        <LineIcon name="upload" className="h-4 w-4 shrink-0" />
        {siteCopy.upload.startUpload}
      </button>

      {hasSuccessfulUpload ? (
        <p className="border-l-2 border-sage/45 bg-sage/10 px-4 py-3 text-sm leading-6 text-olive">
          {siteCopy.upload.success}
        </p>
      ) : null}
    </div>
  );
}

async function uploadQueueItem({
  item,
  event,
  updateQueueItems,
  onSettled,
}: {
  item: UploadQueueItem;
  event: EventConfig;
  updateQueueItems: (
    updater: (currentItems: UploadQueueItem[]) => UploadQueueItem[],
  ) => void;
  onSettled: () => void;
}) {
  try {
    const response = await uploadFileToObjectStorage({
      eventKey: event.key,
      file: item.file,
      sessionId: getOrCreateUploadSessionId(),
      client: getCurrentClientMetadata(),
      onProgress: (progress) => {
        updateQueueItems((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  progress,
                }
              : currentItem,
          ),
        );
      },
    });

    saveUploadSessionId(response.sessionId);
    updateQueueItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              status: "success",
              progress: 100,
              uploadId: response.uploadId,
              objectKey: response.objectKey,
            }
          : currentItem,
      ),
    );
  } catch {
    updateQueueItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              status: "error",
              errorMessage: siteCopy.upload.error,
            }
          : currentItem,
      ),
    );
  } finally {
    onSettled();
  }
}

function UploadQueueRow({ item }: { item: UploadQueueItem }) {
  const statusLabel =
    item.status === "queued"
      ? siteCopy.upload.ready
      : item.status === "uploading"
        ? siteCopy.upload.progress
        : item.status === "success"
          ? siteCopy.upload.complete
          : item.status === "error"
            ? siteCopy.upload.error
            : siteCopy.upload.rejected;

  const statusText =
    item.status === "rejected" && item.error
      ? uploadErrorCopy[item.error]
      : item.errorMessage || statusLabel;

  return (
    <div className="rounded-invitation-card border border-gold/18 bg-pearl/68 px-4 py-4 shadow-[0_8px_20px_rgb(47_42_38_/_0.045)]">
      <div className="grid gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-charcoal">{item.name}</p>
          <p className="mt-1 text-xs text-muted">{formatFileSize(item.size)}</p>
        </div>
        <p className="text-xs font-semibold leading-5 text-muted">{statusText}</p>
      </div>
      {item.status === "uploading" || item.status === "success" ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-olive transition-[width]"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
