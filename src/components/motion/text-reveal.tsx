"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ElementType, ReactNode } from "react";

import type { CSSProperties } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: ElementType;
  id?: string;
  style?: CSSProperties;
}

export function TextReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.7,
  as: Tag = "div",
  id,
  style,
}: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <Tag id={id} className={className} style={style}>
        {children}
      </Tag>
    );
  }

  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "110%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration, delay, ease: [0.33, 1, 0.68, 1] }}
      >
        <Tag id={id} className={className} style={style}>
          {children}
        </Tag>
      </motion.div>
    </div>
  );
}
