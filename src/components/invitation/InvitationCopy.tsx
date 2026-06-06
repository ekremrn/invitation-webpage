import { DecorativeDivider } from "@/components/layout/DecorativeDivider";
import { Reveal } from "@/components/motion/Reveal";
import { siteCopy } from "@/content/copy";

export function InvitationCopy() {
  return (
    <section className="invitation-section veil-panel border-y border-champagne/25 text-center">
      <div className="relative z-10">
        <Reveal variant="wipe">
          <DecorativeDivider className="mb-7 opacity-70" />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto max-w-md font-display text-[2rem] font-[300] italic leading-[1.32] text-charcoal sm:text-4xl">
            {siteCopy.invitation.body}
          </p>
        </Reveal>
        <Reveal delay={0.14} variant="wipe">
          <div className="mx-auto mt-7 h-px w-24 bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
        </Reveal>
      </div>
    </section>
  );
}
