"use client";

import { motion, useReducedMotion } from "motion/react";
import { BrandLogo } from "@/components/brand/brand-logo";

/* ─────────────────────────────────────────────
   ANIMATED BRAND MARK

   Topographic contour lines with centred
   secondary HAMMAH logo. Extracted from the
   Hamatee Legacy hero for reuse across
   editorial sections.

   Handles:
   — SVG contour path draw-in animation
   — Subtle continuous dash drift
   — Logo fade/scale in + gentle float
   — prefers-reduced-motion fallback
   — Light/Dark/System theme via BrandLogo
   ───────────────────────────────────────────── */

const CONTOUR_PATHS = [
  "M 10 80 Q 50 20, 100 60 T 190 50",
  "M 5 100 Q 60 40, 120 80 T 200 70",
  "M 15 60 Q 55 10, 95 50 T 185 40",
  "M 8 120 Q 65 55, 115 95 T 195 85",
  "M 20 45 Q 48 5, 88 35 T 175 25",
  "M 12 110 Q 58 48, 108 88 T 192 78",
  "M 3 90 Q 42 25, 92 65 T 180 55",
  "M 18 70 Q 52 15, 98 55 T 188 45",
];

interface AnimatedBrandMarkProps {
  /** Override logo sizing. Default: responsive from h-[72px] to h-[160px]. */
  logoClassName?: string;
  /** Override SVG max-width. Default: max-w-[280px] → xl:max-w-[360px]. */
  svgClassName?: string;
  /** Container className for positioning/layout. */
  className?: string;
}

export function AnimatedBrandMark({
  logoClassName = "h-[72px] sm:h-[84px] w-auto md:h-[110px] lg:h-[140px] xl:h-[160px]",
  svgClassName = "h-auto w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px]",
  className = "",
}: AnimatedBrandMarkProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 140"
        fill="none"
        className={svgClassName}
        aria-hidden="true"
      >
        {CONTOUR_PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="currentColor"
            strokeWidth={0.6}
            className="text-foreground/[0.08]"
            strokeLinecap="round"
            initial={
              shouldReduceMotion
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            animate={
              shouldReduceMotion
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 1, opacity: 1 }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : {
                    pathLength: {
                      duration: 1.8,
                      delay: i * 0.08,
                      ease: "easeOut",
                    },
                    opacity: {
                      duration: 0.4,
                      delay: i * 0.08,
                    },
                  }
            }
          />
        ))}
        {/* Continuous subtle drift on each line after initial draw */}
        {!shouldReduceMotion &&
          CONTOUR_PATHS.map((d, i) => (
            <motion.path
              key={`drift-${i}`}
              d={d}
              stroke="currentColor"
              strokeWidth={0.6}
              className="text-foreground/[0.08]"
              strokeLinecap="round"
              initial={{ pathLength: 1, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: [0, 0.08, 0],
              }}
              transition={{
                duration: 10 + i * 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: 1.8 + i * 0.08,
              }}
            />
          ))}
      </svg>

      {/* Logo centred in the contour field */}
      <motion.div
        initial={
          shouldReduceMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.96, y: 10 }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute"
      >
        <motion.div
          animate={
            shouldReduceMotion ? undefined : { y: [0, -6, 0] }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <BrandLogo variant="secondary" className={logoClassName} />
        </motion.div>
      </motion.div>
    </div>
  );
}
