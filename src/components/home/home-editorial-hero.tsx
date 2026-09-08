"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────
   IMAGE CONFIGURATION
   
   Reorder, add, or remove to change the rotation.
   Desktop and mobile use the same images; CSS
   handles crop via object-position if needed.
   ───────────────────────────────────────────── */

const IMAGES = [
  {
    src: "https://images.pixieset.com/638827911/7452b956a03655074e712733eec40d35-large.jpg",
    alt: "SL by Hammah — premium African tailoring",
    position: "object-position: center 20%",
  },
  {
    src: "https://images.pixieset.com/638827911/e29bfc2bcd95d9f7650669d872e85183-large.jpg",
    alt: "SL by Hammah — considered essentials",
    position: "object-position: center 30%",
  },
  {
    src: "https://images.pixieset.com/638827911/7cd151fbfeba12be6a034f451f240ee4-large.jpg",
    alt: "SL by Hammah — elevated trousers",
    position: "object-position: center 25%",
  },
  {
    src: "https://images.pixieset.com/638827911/fcb1e839155451a4465ebf70522deb14-large.jpg",
    alt: "SL by Hammah — contemporary fashion",
    position: "object-position: center 20%",
  },
] as const;

const CYCLE_INTERVAL = 1500;

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

export function HomeEditorialHero() {
  const [current, setCurrent] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const advance = useCallback(() => {
    setCurrent((i) => (i + 1) % IMAGES.length);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(advance, CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [advance, shouldReduceMotion]);

  const image = IMAGES[current];

  return (
    <section
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#111110]"
      aria-label="SL by Hammah — premium African fashion"
    >
      {/* ── Image layer ── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.6, ease: [0.25, 0.1, 0.25, 1] },
              scale: { duration: 8, ease: "linear" },
            }}
            className="absolute inset-0"
          >
            {/* Desktop image */}
            <img
              src={image.src}
              alt={image.alt}
              className="hidden md:block h-full w-full object-cover"
              style={{ ...parseStyle(image.position) }}
              loading={current === 0 ? "eager" : "lazy"}
            />
            {/* Mobile image — same src, tighter crop via CSS */}
            <img
              src={image.src}
              alt={image.alt}
              className="md:hidden h-full w-full object-cover object-top"
              loading={current === 0 ? "eager" : "lazy"}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Gradient overlays for text legibility ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(17,17,16,0.72) 0%, rgba(17,17,16,0.38) 40%, rgba(17,17,16,0.08) 70%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#111116]/70 via-transparent to-transparent md:from-[#111116]/40" />

      {/* ── Content ── */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-20 md:justify-center md:pb-0">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Brand name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="type-hero mb-3"
              style={{ color: "#F7F5F1" }}
            >
              SL BY HAMMAH
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="type-headline mb-5"
              style={{ color: "#F7F5F1" }}
            >
              Cut for presence.
            </motion.p>

            {/* Supporting copy */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="type-body max-w-lg mb-8"
              style={{ color: "rgba(247,245,241,0.8)" }}
            >
              Contemporary trousers and elevated essentials designed with intention.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/shop"
                className="btn-engraved-primary type-cta inline-flex h-13 items-center rounded-md px-8"
              >
                <span className="relative z-10">Shop</span>
              </Link>
              <Link
                href="/our-story"
                className="btn-engraved-secondary type-cta inline-flex h-13 items-center rounded-md px-8"
              >
                <span className="relative z-10">Our Story</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Subtle image position indicators ── */}
      {!shouldReduceMotion && IMAGES.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-2.5">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Show image ${i + 1}`}
              className="group relative h-2 w-2 rounded-full transition-all duration-300"
            >
              <span
                className="absolute inset-0 rounded-full transition-all duration-300"
                style={{
                  background:
                    i === current
                      ? "rgba(247,245,241,0.9)"
                      : "rgba(247,245,241,0.3)",
                  transform: i === current ? "scale(1.4)" : "scale(1)",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */

function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parseStyle(raw: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const [k, v] = part.split(":").map((s) => s.trim());
    if (k && v) out[kebabToCamel(k)] = v;
  }
  return out as React.CSSProperties;
}
