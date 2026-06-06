import Link from "next/link";
import Image from "next/image";
import { LineIcon } from "@/components/layout/LineIcon";
import { Reveal } from "@/components/motion/Reveal";
import { assetSlots } from "@/config/design";
import { eventKeys, events } from "@/config/events";
import { siteCopy } from "@/content/copy";

const uploadCardStyles = {
  henna: {
    item: "border-burgundy/20",
  },
  ceremony: {
    item: "border-olive/20",
  },
} as const;

export function UploadCallToAction() {
  return (
    <section className="invitation-section veil-panel border-y border-champagne/30">
      <div className="relative mb-8 flex items-center gap-4">
        <Image
          src={assetSlots.memoryEnvelope}
          alt=""
          width={84}
          height={66}
          className="h-16 w-20 shrink-0 opacity-85"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="invitation-kicker text-taupe">{siteCopy.upload.memoryKicker}</p>
          <div className="mt-3 h-px w-28 bg-gradient-to-r from-gold/60 to-transparent" />
        </div>
      </div>
      <div className="grid gap-7">
        {eventKeys.map((eventKey) => {
          const event = events[eventKey];
          const uploadCopy = siteCopy.eventUpload[eventKey];
          const styles = uploadCardStyles[event.accent];

          return (
            <Reveal
              key={eventKey}
              className={`border-l-2 pl-5 ${styles.item}`}
              delay={eventKey === "ceremony" ? 0.08 : 0}
            >
              <h2 className="font-display text-4xl font-[300] italic leading-10 text-charcoal">
                {uploadCopy.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{uploadCopy.description}</p>
              <Link
                href={event.uploadPath}
                className="invitation-action mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-invitation-pill border border-charcoal/10 bg-charcoal/92 px-5 py-3 text-center text-sm font-[300] uppercase tracking-[0.1em] text-pearl shadow-[0_8px_22px_rgb(47_42_38_/_0.12)] hover:bg-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <LineIcon name="upload" className="h-4 w-4 shrink-0" />
                {uploadCopy.button}
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
