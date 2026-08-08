import { DecorativeDivider } from "@/components/layout/DecorativeDivider";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/config/site";
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
      <div className="mt-12 flex items-center justify-between border-t border-champagne/35 pt-3 text-[0.6rem] uppercase tracking-[0.18em] text-muted/75">
        <span>{siteCopy.final.hostedAt}</span>
        <a
          href={siteConfig.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={siteCopy.final.repositoryLabel}
          className="rounded-full p-1.5 transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-current"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.73.084-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.21 0 1.595-.015 2.88-.015 3.27 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span className="sr-only">{siteCopy.final.repositoryLabel}</span>
        </a>
      </div>
    </section>
  );
}
