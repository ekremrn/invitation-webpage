"use client";

import { useSyncExternalStore } from "react";

const mediaQuery = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const motionPreference = window.matchMedia(mediaQuery);
  motionPreference.addEventListener("change", callback);

  return () => {
    motionPreference.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  return window.matchMedia(mediaQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function useStableReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
