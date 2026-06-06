import { DecorativeDivider } from "@/components/layout/DecorativeDivider";
import { Reveal } from "@/components/motion/Reveal";
import { siteCopy } from "@/content/copy";
import { Monogram } from "./Monogram";

export function FinalSection() {
  return (
    <section className="invitation-section paper-panel text-center">
      <Reveal variant="scale">
        <Monogram size="sm" className="mb-7" />
      </Reveal>
      <Reveal className="mb-7" delay={0.06} variant="wipe">
        <DecorativeDivider className="opacity-75" />
      </Reveal>
      <Reveal delay={0.12}>
        <p className="mx-auto max-w-sm text-sm leading-7 text-muted">{siteCopy.final.body}</p>
        <p className="mt-8 font-display text-5xl font-[300] italic leading-none text-charcoal">
          {siteCopy.final.signature}
        </p>
      </Reveal>
    </section>
  );
}
