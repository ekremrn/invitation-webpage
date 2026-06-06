import type { EventConfig } from "@/types/event";

export type CountdownStatus = "upcoming" | "live" | "completed";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type CountdownState =
  | {
      status: "upcoming";
      parts: CountdownParts;
    }
  | {
      status: "live" | "completed";
      message: string;
    };

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function getCountdownState(
  event: EventConfig,
  nowMs = Date.now(),
): CountdownState {
  const startMs = Date.parse(event.startDateTime);
  const endMs = Date.parse(event.endDateTime);

  if (nowMs >= endMs) {
    return {
      status: "completed",
      message: event.completedText,
    };
  }

  if (nowMs >= startMs) {
    return {
      status: "live",
      message: event.liveText,
    };
  }

  const remainingMs = Math.max(startMs - nowMs, 0);
  const days = Math.floor(remainingMs / DAY_MS);
  const hours = Math.floor((remainingMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((remainingMs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((remainingMs % MINUTE_MS) / SECOND_MS);

  return {
    status: "upcoming",
    parts: {
      days,
      hours,
      minutes,
      seconds,
    },
  };
}
