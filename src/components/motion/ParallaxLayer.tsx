"use client";

import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useStableReducedMotion } from "@/lib/use-reduced-motion";

type ParallaxLayerProps = {
  children?: ReactNode;
  className?: string;
  distance?: number;
};

export function ParallaxLayer({
  children,
  className = "",
  distance = 14,
}: ParallaxLayerProps) {
  const shouldReduceMotion = useStableReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : distance]);

  return (
    <motion.div className={className} style={{ y }} aria-hidden="true">
      {children}
    </motion.div>
  );
}
