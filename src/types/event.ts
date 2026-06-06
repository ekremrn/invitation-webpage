export type EventKey = "henna" | "ceremony";

export type EventAccent = "henna" | "ceremony";

export type EventConfig = {
  key: EventKey;
  title: string;
  subtitle?: string;
  countdownTitle: string;
  startDateTime: string;
  endDateTime: string;
  displayDate: string;
  displayTimeRange: string;
  venueName: string;
  address: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  uploadPath: string;
  qrPath: string;
  accent: EventAccent;
  liveText: string;
  completedText: string;
};
