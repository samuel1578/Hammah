"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
}

export function Marquee({
  children,
  className = "",
  speed = 40,
  direction = "left",
}: MarqueeProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className={`overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div className="flex items-center whitespace-nowrap py-6">
          <span className="px-8">{children}</span>
        </div>
      </div>
    );
  }

  const duration = speed;

  return (
    <div
      className={`overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="flex items-center whitespace-nowrap py-6"
        style={{
          width: "max-content",
          animation: `marquee-scroll-${direction} ${duration}s linear infinite`,
        }}
      >
        <span className="px-8">{children}</span>
        <span className="px-8" aria-hidden="true">{children}</span>
      </div>

      <style>{`
        @keyframes marquee-scroll-left {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}
