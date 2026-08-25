"use client";

import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
}

const variants: Variants = {
  hidden: (y: number) => ({
    opacity: 0,
    y,
  }),
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  y = 24,
  once = true,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      custom={y}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={variants}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
