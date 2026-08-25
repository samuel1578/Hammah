"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface MediaRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  scale?: number;
}

export function MediaReveal({
  children,
  className = "",
  delay = 0,
  scale = 1.08,
}: MediaRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ scale, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
