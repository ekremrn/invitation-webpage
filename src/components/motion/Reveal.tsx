"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useStableReducedMotion } from "@/lib/use-reduced-motion";

type RevealVariant = "up" | "scale" | "wipe";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  variant?: RevealVariant;
};

const revealTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1],
} as const;

function getVariantProps(variant: RevealVariant, y: number) {
  switch (variant) {
    case "scale":
      return {
        initial: { opacity: 0, scale: 0.97 },
        visible: { opacity: 1, scale: 1 },
      };
    case "wipe":
      return {
        initial: { opacity: 0, scaleX: 0 },
        visible: { opacity: 1, scaleX: 1 },
      };
    case "up":
    default:
      return {
        initial: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      };
  }
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 18,
  variant = "up",
}: RevealProps) {
  const shouldReduceMotion = useStableReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variantProps = getVariantProps(variant, y);

  return (
    <motion.div
      className={className}
      initial={variantProps.initial}
      whileInView={variantProps.visible}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ ...revealTransition, delay }}
      style={variant === "wipe" ? { transformOrigin: "center" } : undefined}
    >
      {children}
    </motion.div>
  );
}
