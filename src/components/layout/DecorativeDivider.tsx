import Image from "next/image";
import { assetSlots } from "@/config/design";

type DecorativeDividerProps = {
  className?: string;
  align?: "center" | "start";
};

const alignClass = {
  center: "justify-center",
  start: "justify-start",
} as const;

export function DecorativeDivider({
  className = "",
  align = "center",
}: DecorativeDividerProps) {
  return (
    <div className={`flex ${alignClass[align]} ${className}`} aria-hidden="true">
      <Image
        src={assetSlots.goldDivider}
        alt=""
        width={152}
        height={22}
        className="h-auto w-36 opacity-85"
        priority={false}
      />
    </div>
  );
}
