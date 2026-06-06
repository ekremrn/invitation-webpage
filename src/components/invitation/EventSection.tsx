import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { assetSlots } from "@/config/design";
import { siteCopy } from "@/content/copy";
import type { EventConfig } from "@/types/event";
import { Countdown } from "./Countdown";
import { LocationActions } from "./LocationActions";

type EventSectionProps = {
  event: EventConfig;
};

const accentStyles = {
  henna: {
    section:
      "border-champagne/30 bg-[linear-gradient(180deg,rgb(255_253_248_/_0.92),rgb(250_248_245_/_0.82),rgb(122_37_53_/_0.045))]",
    eyebrow: "text-burgundy",
    rule: "from-transparent via-burgundy/24 to-transparent",
    ornament: assetSlots.hennaOrnament,
    ornamentClass: "opacity-[0.09]",
    detailValue: "text-burgundy",
  },
  ceremony: {
    section:
      "border-champagne/30 bg-[linear-gradient(180deg,rgb(250_248_245_/_0.9),rgb(255_253_248_/_0.88),rgb(135_144_112_/_0.055))]",
    eyebrow: "text-olive",
    rule: "from-transparent via-olive/22 to-transparent",
    ornament: assetSlots.ceremonyOrnament,
    ornamentClass: "opacity-[0.12]",
    detailValue: "text-olive",
  },
} as const;

export function EventSection({ event }: EventSectionProps) {
  const styles = accentStyles[event.accent];

  const detailItems = [
    { key: "time", label: siteCopy.eventDetails.time, value: event.displayTimeRange },
    { key: "venue", label: siteCopy.eventDetails.venue, value: event.venueName },
  ] as const;

  return (
    <section
      className={`invitation-section border-b ${styles.section}`}
      aria-labelledby={`${event.key}-title`}
    >
      <div className="relative">
        <Image
          src={styles.ornament}
          alt=""
          width={184}
          height={184}
          className={`pointer-events-none absolute -right-12 -top-10 h-44 w-44 ${styles.ornamentClass} sm:-right-7 sm:-top-12 sm:h-52 sm:w-52`}
          aria-hidden="true"
        />
        <div>
          <p className={`invitation-kicker mb-3 ${styles.eyebrow}`}>
            {event.displayDate}
          </p>
          <h2
            id={`${event.key}-title`}
            className="font-display text-5xl font-[300] italic leading-none text-charcoal sm:text-6xl"
          >
            {event.title}
          </h2>
        </div>
        {event.subtitle ? (
          <p className="relative mt-4 text-sm leading-7 text-muted">
            {event.subtitle}
          </p>
        ) : null}
        <Countdown event={event} />
        <div className={`mb-2 h-px w-full bg-gradient-to-r ${styles.rule}`} aria-hidden="true" />
        <dl className="grid text-left">
          {detailItems.map(({ key, label, value }, index) => (
            <Reveal key={key} delay={0.08 * index}>
              <div className="grid gap-2 border-b border-champagne/24 py-5 sm:grid-cols-[7.25rem_1fr] sm:items-baseline">
                <dt className="invitation-kicker text-taupe">{label}</dt>
                <dd className={`font-display text-2xl font-[300] leading-8 ${styles.detailValue}`}>
                  {value}
                </dd>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.16}>
            <div className="grid gap-2 border-b border-champagne/24 py-5 sm:grid-cols-[7.25rem_1fr]">
              <dt className="invitation-kicker text-taupe">{siteCopy.eventDetails.address}</dt>
              <dd>
                <p className="text-sm leading-7 text-muted">{event.address}</p>
                <LocationActions event={event} />
              </dd>
            </div>
          </Reveal>
        </dl>
      </div>
    </section>
  );
}
