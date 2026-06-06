"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { LineIcon } from "@/components/layout/LineIcon";
import { siteCopy } from "@/content/copy";
import { useStableReducedMotion } from "@/lib/use-reduced-motion";

type MusicState = "idle" | "playing" | "muted" | "unavailable";

const audioSource = "/audio/background.mp3";

function getMusicLabel(state: MusicState): string {
  if (state === "playing") {
    return siteCopy.music.muteLabel;
  }

  if (state === "muted") {
    return siteCopy.music.unmuteLabel;
  }

  if (state === "unavailable") {
    return siteCopy.music.unavailableLabel;
  }

  return siteCopy.music.playLabel;
}

export function MusicButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldReduceMotion = useStableReducedMotion();
  const [state, setState] = useState<MusicState>("idle");

  async function attemptPlay() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted = false;

    try {
      await audio.play();
      setState("playing");
    } catch {
      setState(audio.error ? "unavailable" : "idle");
    }
  }

  async function handleButtonClick() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (state === "playing") {
      audio.muted = true;
      setState("muted");
      return;
    }

    if (state === "muted") {
      audio.muted = false;

      if (audio.paused) {
        await attemptPlay();
      } else {
        setState("playing");
      }

      return;
    }

    await attemptPlay();
  }

  const label = getMusicLabel(state);

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSource}
        loop
        preload="none"
        onError={() => setState("unavailable")}
      />
      <motion.button
        type="button"
        aria-label={label}
        aria-pressed={state === "playing"}
        title={label}
        onClick={handleButtonClick}
        animate={
          shouldReduceMotion
            ? undefined
            : state === "playing"
              ? { scale: [1, 1.05, 1] }
              : { scale: 1 }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : state === "playing"
              ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.18 }
        }
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        className="invitation-action fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-pearl/50 bg-charcoal/92 text-pearl shadow-[0_10px_26px_rgb(47_42_38_/_0.18)] ring-2 ring-pearl/64 hover:bg-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span className="sr-only">{label}</span>
        <LineIcon
          name={state === "muted" || state === "unavailable" ? "music-off" : "music"}
          className="h-5 w-5"
        />
      </motion.button>
    </>
  );
}
