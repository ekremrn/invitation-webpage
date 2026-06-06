import Image from "next/image";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { Reveal } from "@/components/motion/Reveal";
import { assetSlots } from "@/config/design";
import { siteCopy } from "@/content/copy";
import { DecorativeDivider } from "../layout/DecorativeDivider";
import { Monogram } from "./Monogram";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="invitation-section relative flex min-h-[86svh] flex-col items-center justify-center overflow-hidden text-center"
    >
      <Image
        src={assetSlots.heroBotanical}
        alt=""
        fill
        sizes="(max-width: 680px) 100vw, 680px"
        className="pointer-events-none absolute inset-0 object-cover opacity-[0.3] mix-blend-multiply"
        priority
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgb(255_253_248_/_0.94),rgb(255_253_248_/_0.78)_38%,rgb(255_253_248_/_0.22)_70%,transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src={assetSlots.mediterraneanBotanicalLeft}
          alt=""
          width={1000}
          height={1000}
          className="mediterranean-breeze mediterranean-breeze-left absolute -left-40 -top-12 h-auto w-[25rem] opacity-[0.26] mix-blend-multiply sm:-left-36 sm:-top-14 sm:w-[31rem] sm:opacity-[0.3]"
          priority
        />
        <Image
          src={assetSlots.mediterraneanBotanicalRight}
          alt=""
          width={1100}
          height={880}
          className="mediterranean-breeze mediterranean-breeze-right absolute -right-64 -bottom-8 h-auto w-[29rem] opacity-[0.18] mix-blend-multiply sm:-right-80 sm:-bottom-10 sm:w-[38rem] sm:opacity-[0.22]"
          priority
        />
        <Image
          src={assetSlots.mediterraneanBotanicalAccent}
          alt=""
          width={900}
          height={720}
          className="mediterranean-breeze mediterranean-breeze-accent absolute -left-36 bottom-0 h-auto w-[17rem] opacity-[0.14] mix-blend-multiply sm:-left-44 sm:bottom-0 sm:w-[24rem] sm:opacity-[0.16]"
          priority={false}
        />
      </div>
      <ParallaxLayer
        className="absolute inset-x-8 top-9 h-px bg-gradient-to-r from-transparent via-gold/32 to-transparent"
        distance={10}
      />
      <ParallaxLayer
        className="absolute inset-x-10 bottom-9 h-px bg-gradient-to-r from-transparent via-champagne/34 to-transparent"
        distance={-8}
      />

      <div
        className="absolute inset-x-8 top-16 h-32 border-x border-champagne/20 sm:inset-x-14"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-8 bottom-16 h-32 border-x border-champagne/18 sm:inset-x-14"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-[28rem] flex-col items-center">
        <Reveal delay={0} variant="scale">
          <Monogram size="sm" className="mb-7" />
        </Reveal>

        <Reveal delay={0}>
          <p className="invitation-kicker mb-6 text-taupe">
            {siteCopy.hero.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.15} y={20}>
          <h1
            id="hero-title"
            className="font-display font-[300] italic leading-[0.88] text-charcoal"
          >
            <span className="block text-[5.1rem] sm:text-[6.9rem]">
              {siteCopy.hero.names.bride}
            </span>
            <span className="mx-auto my-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold/35 bg-pearl/52 text-3xl not-italic leading-none text-gold shadow-[inset_0_1px_0_rgb(255_255_255_/_0.68)]">
              {siteCopy.hero.names.joiner}
            </span>
            <span className="block text-[5.1rem] sm:text-[6.9rem]">
              {siteCopy.hero.names.groom}
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.28}>
          <p className="invitation-kicker mt-8 text-olive">
            {siteCopy.hero.dateLine}
          </p>
        </Reveal>

        <Reveal delay={0.38} variant="wipe" className="my-7 w-full">
          <DecorativeDivider />
        </Reveal>

        <Reveal delay={0.5}>
          <p className="max-w-xs text-base leading-8 text-muted">{siteCopy.hero.subtitle}</p>
        </Reveal>
      </div>
    </section>
  );
}
