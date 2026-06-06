import type { EventConfig, EventKey } from "@/types/event";

export const eventKeys: EventKey[] = ["henna", "ceremony"];

export const events: Record<EventKey, EventConfig> = {
  henna: {
    key: "henna",
    title: "Kına Gecesi",
    subtitle: "Bu özel kına gecesi yalnızca kadın misafirlerimize özeldir.",
    countdownTitle: "Kına gecesine kalan süre",
    startDateTime: "2026-08-20T20:00:00+03:00",
    endDateTime: "2026-08-21T00:00:00+03:00",
    displayDate: "20 Ağustos 2026",
    displayTimeRange: "20:00 – 00:00",
    venueName: "Garden MARPESİA",
    address:
      "Paşakent, Safran Mevkii, Yeşiltepe 3. Sokak, J759+W4 No:6, 77000 Yalova Merkez/Yalova",
    googleMapsUrl: "https://maps.app.goo.gl/ZGfsCrNAwZKQ1VZV6",
    appleMapsUrl: "https://maps.apple.com/?q=Garden%20MARPES%C4%B0A%20Yalova",
    uploadPath: "/upload/henna",
    qrPath: "/qr/henna",
    accent: "henna",
    liveText: "Kına gecemiz devam ediyor.",
    completedText: "Kına gecemiz gerçekleşti.",
  },
  ceremony: {
    key: "ceremony",
    title: "Nikah",
    countdownTitle: "Nikaha kalan süre",
    startDateTime: "2026-08-22T13:30:00+03:00",
    endDateTime: "2026-08-22T16:00:00+03:00",
    displayDate: "22 Ağustos 2026",
    displayTimeRange: "13:30 – 16:00",
    venueName: "Altan Kültür Merkezi",
    address: "Gazi Osman Paşa, Kış Sk. No:66/5, 77100 Yalova Merkez/Yalova",
    googleMapsUrl: "https://maps.app.goo.gl/EzJuxLZZeNg11Wjc6",
    appleMapsUrl:
      "https://maps.apple.com/?q=Altan%20K%C3%BClt%C3%BCr%20Merkezi%20Yalova",
    uploadPath: "/upload/ceremony",
    qrPath: "/qr/ceremony",
    accent: "ceremony",
    liveText: "Nikahımız devam ediyor.",
    completedText: "Nikahımız gerçekleşti.",
  },
};

export function getEventConfig(eventKey: EventKey): EventConfig {
  return events[eventKey];
}

export function isEventKey(value: string): value is EventKey {
  return eventKeys.includes(value as EventKey);
}
