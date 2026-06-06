"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { siteCopy } from "@/content/copy";
import { getCountdownState, type CountdownState } from "@/lib/countdown";
import { useStableReducedMotion } from "@/lib/use-reduced-motion";
import type { EventConfig } from "@/types/event";

type CountdownProps = {
  event: EventConfig;
};

type CountdownUnit = keyof typeof siteCopy.countdown.units;
type CountdownItem = readonly [CountdownUnit, number | string];

const placeholderCompactParts: readonly CountdownItem[] = [
  ["hours", "--"],
  ["minutes", "--"],
] as const;

const labelByPart = {
  days: siteCopy.countdown.units.days,
  hours: siteCopy.countdown.units.hours,
  minutes: siteCopy.countdown.units.minutes,
  seconds: siteCopy.countdown.units.seconds,
} as const;

export function Countdown({ event }: CountdownProps) {
  const [state, setState] = useState<CountdownState | null>(null);
  const shouldReduceMotion = useStableReducedMotion();
  const dayValue = state?.status === "upcoming" ? state.parts.days : "--";
  const compactCountdownItems: readonly CountdownItem[] =
    state?.status === "upcoming"
      ? [
          ["hours", state.parts.hours],
          ["minutes", state.parts.minutes],
        ]
      : placeholderCompactParts;

  useEffect(() => {
    function updateCountdown() {
      setState(getCountdownState(event));
    }

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [event]);

  return (
    <section
      aria-labelledby={`${event.key}-countdown-title`}
      className="relative my-7 overflow-hidden py-6 text-center"
    >
      <div
        className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-champagne/48 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-champagne/34 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-8 h-20 w-20 -translate-x-1/2 rounded-full border border-champagne/14"
        aria-hidden="true"
      />
      <h3
        id={`${event.key}-countdown-title`}
        className="invitation-kicker relative text-olive"
      >
        {event.countdownTitle}
      </h3>
      <div
        className="relative mt-5"
        aria-live={state?.status === "live" || state?.status === "completed" ? "polite" : "off"}
      >
        {state?.status === "live" || state?.status === "completed" ? (
          <p className="mx-auto max-w-sm font-display text-2xl font-[300] italic leading-8 text-olive">
            {state.message}
          </p>
        ) : (
          <>
            <p className="flex items-baseline justify-center gap-2.5">
              <AnimatedCountdownValue
                value={dayValue}
                shouldReduceMotion={shouldReduceMotion}
                className="inline-block font-display text-[4.2rem] font-[300] leading-none tabular-nums text-charcoal sm:text-[5.1rem]"
              />
              {" "}
              <span className="max-w-[5.25rem] text-left text-xs font-[300] uppercase leading-5 tracking-[0.18em] text-taupe">
                {siteCopy.countdown.daySuffix}
              </span>
            </p>
            <dl className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-taupe">
              {compactCountdownItems.map(([unit, value], index) => (
                <div key={unit} className="inline-flex items-baseline gap-1.5">
                  {index > 0 ? (
                    <>
                      {" "}
                      <span className="mx-1 text-gold/70" aria-hidden="true">
                        ·
                      </span>
                      {" "}
                    </>
                  ) : null}
                  <dd className="font-display text-xl font-[300] leading-none tabular-nums text-charcoal">
                    <AnimatedCountdownValue
                      value={value}
                      shouldReduceMotion={shouldReduceMotion}
                      className="inline-block min-w-[1.35ch]"
                    />
                  </dd>
                  {" "}
                  <dt className="text-xs font-[400] uppercase leading-none tracking-[0.16em]">
                    {labelByPart[unit]}
                  </dt>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </section>
  );
}

function AnimatedCountdownValue({
  className,
  shouldReduceMotion,
  value,
}: {
  className?: string;
  shouldReduceMotion: boolean;
  value: number | string;
}) {
  if (shouldReduceMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <motion.span
      key={String(value)}
      className={className}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {value}
    </motion.span>
  );
}
