import type { ReactNode } from "react";
import Image from "next/image";
import { assetSlots } from "@/config/design";

type InvitationShellProps = {
  children: ReactNode;
};

export function InvitationShell({ children }: InvitationShellProps) {
  return (
    <main className="invitation-page">
      <div className="invitation-shell">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          <Image
            src={assetSlots.paperTexture}
            alt=""
            fill
            sizes="(max-width: 680px) 100vw, 680px"
            className="object-cover opacity-[0.12] mix-blend-multiply"
            priority
          />
          <Image
            src={assetSlots.floralTopLeft}
            alt=""
            width={684}
            height={574}
            className="absolute -left-48 -top-24 h-auto w-[29rem] max-w-none opacity-[0.16] mix-blend-multiply sm:-left-32 sm:-top-20 sm:w-[32rem]"
            priority={false}
          />
          <Image
            src={assetSlots.floralBottomRight}
            alt=""
            width={701}
            height={561}
            className="absolute -bottom-20 -right-52 h-auto w-[31rem] max-w-none opacity-[0.14] mix-blend-multiply sm:-bottom-28 sm:-right-36 sm:w-[35rem]"
            priority={false}
          />
          <div className="absolute inset-x-5 top-5 bottom-5 border border-champagne/16 sm:inset-x-7 sm:top-7 sm:bottom-7" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_253_248_/_0.58),rgb(255_253_248_/_0.18)_34%,rgb(247_239_226_/_0.34))]" />
        </div>
        <div className="relative z-10 flex flex-col">{children}</div>
      </div>
    </main>
  );
}
