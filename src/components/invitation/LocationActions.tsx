"use client";

import { useEffect, useRef, useState } from "react";
import { LineIcon } from "@/components/layout/LineIcon";
import { siteCopy } from "@/content/copy";
import type { EventConfig } from "@/types/event";

type LocationActionsProps = {
  event: EventConfig;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export function LocationActions({ event }: LocationActionsProps) {
  const [copied, setCopied] = useState(false);
  const feedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  async function handleCopyAddress() {
    const didCopy = await copyTextToClipboard(event.address);

    if (!didCopy) {
      return;
    }

    setCopied(true);

    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 2400);
  }

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      <a
        href={event.googleMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="invitation-action inline-flex min-h-11 items-center justify-center gap-2 rounded-invitation-pill border border-olive/25 bg-olive/92 px-4 py-3 text-center text-sm font-[400] text-pearl shadow-[0_8px_20px_rgb(63_74_54_/_0.12)] hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <LineIcon name="map-pin" className="h-4 w-4 shrink-0" />
        {siteCopy.location.googleMaps}
      </a>
      <a
        href={event.appleMapsUrl}
        target="_blank"
        rel="noreferrer"
        className="invitation-action inline-flex min-h-11 items-center justify-center gap-2 rounded-invitation-pill border border-gold/35 bg-pearl/54 px-4 py-3 text-center text-sm font-[400] text-charcoal hover:border-olive/35 hover:bg-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <LineIcon name="map-pin" className="h-4 w-4 shrink-0" />
        {siteCopy.location.appleMaps}
      </a>
      <button
        type="button"
        onClick={handleCopyAddress}
        className="invitation-action inline-flex min-h-11 items-center justify-center gap-2 rounded-invitation-pill border border-gold/30 bg-transparent px-4 py-3 text-center text-sm font-[400] text-charcoal hover:bg-cream/34 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:col-span-2"
      >
        <LineIcon name={copied ? "check" : "copy"} className="h-4 w-4 shrink-0" />
        {siteCopy.location.copyAddress}
      </button>
      <p className="min-h-5 text-center text-sm leading-5 text-olive sm:col-span-2" aria-live="polite">
        {copied ? siteCopy.location.addressCopied : ""}
      </p>
    </div>
  );
}
