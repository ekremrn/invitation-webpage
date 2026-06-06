import Link from "next/link";
import Image from "next/image";
import { LineIcon } from "@/components/layout/LineIcon";
import { Reveal } from "@/components/motion/Reveal";
import { assetSlots } from "@/config/design";
import { siteCopy } from "@/content/copy";
import type { EventConfig } from "@/types/event";
import { DecorativeDivider } from "../layout/DecorativeDivider";
import { InvitationShell } from "../layout/InvitationShell";
import { Monogram } from "./Monogram";

type QrLandingPageProps = {
  event: EventConfig;
};

const qrPageStyles = {
  henna: {
    eyebrow: "text-burgundy",
    button: "border-burgundy/25 bg-burgundy hover:bg-wine",
  },
  ceremony: {
    eyebrow: "text-olive",
    button: "border-olive/25 bg-olive hover:bg-charcoal",
  },
} as const;

export function QrLandingPage({ event }: QrLandingPageProps) {
  const qrCopy = siteCopy.qr[event.key];
  const styles = qrPageStyles[event.accent];

  return (
    <InvitationShell>
      <section className="paper-panel relative flex min-h-svh flex-col justify-center overflow-hidden px-6 py-12 text-center sm:min-h-[calc(100svh-4rem)] sm:px-8">
        <Image
          src={assetSlots.heroBotanical}
          alt=""
          fill
          sizes="(max-width: 680px) 100vw, 680px"
          className="pointer-events-none object-cover opacity-[0.28] mix-blend-multiply"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgb(255_253_248_/_0.92),rgb(255_253_248_/_0.74)_42%,transparent_76%)]"
          aria-hidden="true"
        />
        <Reveal className="relative z-10 mx-auto max-w-md">
          <Monogram size="sm" className="mb-6" />
          <p className={`invitation-kicker mb-4 ${styles.eyebrow}`}>
            {event.title}
          </p>
          <h1 className="font-display text-[3.4rem] font-[300] leading-none text-charcoal sm:text-6xl">
            {qrCopy.title}
          </h1>
          <Reveal className="my-6" delay={0.08} variant="wipe">
            <DecorativeDivider />
          </Reveal>
          <p className="mx-auto max-w-sm text-base leading-8 text-muted">
            {qrCopy.description}
          </p>
          <Link
            href={event.uploadPath}
            className={`invitation-action mx-auto mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-invitation-pill border px-7 py-3 text-center text-sm font-[400] text-pearl shadow-[0_10px_26px_rgb(63_74_54_/_0.13)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${styles.button}`}
          >
            {siteCopy.qr.button}
            <LineIcon name="arrow-right" className="h-4 w-4 shrink-0" />
          </Link>
        </Reveal>
      </section>
    </InvitationShell>
  );
}
