import Image from "next/image";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { Reveal } from "@/components/motion/Reveal";
import { assetSlots } from "@/config/design";
import { siteCopy } from "@/content/copy";
import type { EventConfig, EventKey } from "@/types/event";
import { DecorativeDivider } from "../layout/DecorativeDivider";
import { InvitationShell } from "../layout/InvitationShell";
import { Monogram } from "../invitation/Monogram";

type UploadPageProps = {
  event: EventConfig;
};

const uploadPageTitles = {
  henna: siteCopy.upload.pages.hennaTitle,
  ceremony: siteCopy.upload.pages.ceremonyTitle,
} satisfies Record<EventKey, string>;

const uploadPageStyles = {
  henna: {
    eyebrow: "text-burgundy",
    surface: "upload-surface-henna",
  },
  ceremony: {
    eyebrow: "text-olive",
    surface: "upload-surface-ceremony",
  },
} as const;

export function UploadPage({ event }: UploadPageProps) {
  const uploadCopy = siteCopy.eventUpload[event.key];
  const styles = uploadPageStyles[event.accent];

  return (
    <InvitationShell>
      <section
        className={`relative flex min-h-svh flex-col overflow-hidden px-5 py-8 sm:min-h-[calc(100svh-4rem)] sm:px-8 sm:py-12 ${styles.surface}`}
      >
        <Image
          src={assetSlots.heroBotanical}
          alt=""
          fill
          sizes="(max-width: 680px) 100vw, 680px"
          className="pointer-events-none object-cover opacity-[0.2] mix-blend-multiply"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(255_253_248_/_0.76),rgb(255_253_248_/_0.56)_38%,transparent)]"
          aria-hidden="true"
        />
        <Reveal className="relative z-10" y={12}>
          <Monogram size="sm" className="mb-5" />
          <p
            className={`invitation-kicker ${styles.eyebrow}`}
          >
            {event.title}
          </p>
          <h1 className="mt-3 max-w-lg font-display text-[2.85rem] font-[300] leading-[1.02] text-charcoal sm:text-6xl">
            {uploadPageTitles[event.key]}
          </h1>
          <Reveal className="my-5" delay={0.08} variant="wipe">
            <DecorativeDivider align="start" />
          </Reveal>
          <p className="text-sm leading-7 text-muted sm:text-base">{uploadCopy.description}</p>
        </Reveal>

        <Reveal className="relative z-10 mt-6" delay={0.06}>
          <UploadDropzone event={event} />
        </Reveal>

        <Reveal className="relative z-10" delay={0.1}>
          <p className="mt-6 border-t border-champagne/30 pt-5 text-sm leading-6 text-muted">
            {siteCopy.upload.privacy}
          </p>
        </Reveal>
      </section>
    </InvitationShell>
  );
}
