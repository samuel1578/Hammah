"use client";

import { motion } from "motion/react";
import { useState, type CSSProperties } from "react";

type GlitchTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface GlitchTextProps {
  children: string;
  as?: GlitchTag;
  id?: string;
  className?: string;
  style?: CSSProperties;
  variant?: "aggressive" | "mild";
  active?: boolean;
}

export function GlitchText({
  children,
  as: Tag = "span",
  id,
  className = "",
  style,
  variant = "aggressive",
  active = false,
}: GlitchTextProps) {
  const [bursting, setBursting] = useState(false);

  const burst = () => setBursting(true);
  const rest = () => setBursting(false);

  const isActive = bursting || active;

  return (
    <Tag id={id} className={className} style={style}>
      <motion.span
        className={`glitch${variant === "mild" ? " glitch--mild" : ""}${isActive ? " glitch--active" : ""}`}
        data-text={children}
        onViewportEnter={burst}
        onViewportLeave={rest}
        onMouseEnter={burst}
        onMouseLeave={rest}
        onAnimationEnd={rest}
      >
        {children}
      </motion.span>
    </Tag>
  );
}
