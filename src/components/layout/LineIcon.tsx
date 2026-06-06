import type { SVGProps } from "react";

export type LineIconName =
  | "arrow-right"
  | "check"
  | "copy"
  | "image-up"
  | "map-pin"
  | "music"
  | "music-off"
  | "upload";

type LineIconProps = SVGProps<SVGSVGElement> & {
  name: LineIconName;
};

export function LineIcon({ name, className = "h-4 w-4", ...props }: LineIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      {...props}
    >
      {renderIcon(name)}
    </svg>
  );
}

function renderIcon(name: LineIconName) {
  switch (name) {
    case "arrow-right":
      return (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      );
    case "check":
      return <path d="m5 12 4 4L19 6" />;
    case "copy":
      return (
        <>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </>
      );
    case "image-up":
      return (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="m8 14 2.5-2.5L14 15l1.5-1.5L19 17" />
          <path d="M12 11V3" />
          <path d="m9 6 3-3 3 3" />
          <circle cx="8.5" cy="9.5" r="1.25" />
        </>
      );
    case "map-pin":
      return (
        <>
          <path d="M20 10c0 5.25-8 11-8 11S4 15.25 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      );
    case "music":
      return (
        <>
          <path d="M9 18V7l10-2v11" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="16" r="2" />
        </>
      );
    case "music-off":
      return (
        <>
          <path d="m3 3 18 18" />
          <path d="M9 18V9.5" />
          <path d="M12 6.4 19 5v11" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="16" r="2" />
        </>
      );
    case "upload":
      return (
        <>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </>
      );
    default:
      return null;
  }
}
