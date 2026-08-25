"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { getMediaById } from "@/data/media-manifest";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { BrandLogo } from "@/components/brand/brand-logo";

export function HomeHero() {
  const shouldReduceMotion = useReducedMotion();
  const media = getMediaById("home-hero");

  return (
    <section className="relative flex h-[100svh] min-h-[600px] items-end overflow-hidden pb-16 md:items-center md:pb-0">
      {/* Background media */}
      {media && (
        <div className="absolute inset-0 bg-[#111110]">
          {media.type === "video" ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
            >
              <source src="/mobvideo.mp4" media="(max-width: 767px)" type="video/mp4" />
              <source src={media.currentSrc} type="video/mp4" />
            </video>
          ) : (
            <motion.div
              initial={{ scale: shouldReduceMotion ? 1 : 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full w-full"
            >
              <img
                src={media.currentSrc}
                alt="SL by Hammah — premium African fashion"
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}

          {/* Directional overlay — left-heavy for text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, rgba(17,17,16,0.72) 0%, rgba(17,17,16,0.42) 35%, rgba(17,17,16,0.10) 65%, transparent 100%)`,
            }}
          />
          {/* Bottom fade for mobile readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111116]/80 via-transparent to-transparent md:from-[#111116]/50" />
        </div>
      )}

      {/* Hero top-left secondary logo — replaces old text marker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
        className="absolute top-24 left-5 z-10 sm:left-6 lg:left-8"
      >
        <BrandLogo variant="secondary" forceTheme="dark" className="h-[52px] sm:h-[65px] md:h-[75px] lg:h-[90px] w-auto" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">

          {/* Headline — large editorial, warm white for readability */}
          <TextReveal
            as="h1"
            className="type-hero"
            style={{ color: "#F7F5F1" }}
          >
            Considered essentials,
            <br />
            cut for people who don&apos;t
            <br />
            dress for anyone else.
          </TextReveal>

          {/* Supporting copy — hero-specific Title Style, subordinate to main headline */}
          <Reveal delay={0.5} y={16}>
            <p className="type-hero-statement mt-6 max-w-xl" style={{ color: "rgba(247,245,241,0.85)" }}>
              Premium African fashion designed around strong pieces, considered
              detail, and a quieter kind of confidence.
            </p>
          </Reveal>

          {/* CTAs — engraved SVG treatment */}
          <Reveal delay={0.65} y={16}>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {/* Primary CTA — engraved brown */}
              <Link
                href="/collections/collection-001"
                className="btn-engraved-primary type-cta inline-flex h-14 items-center rounded-md px-8"
              >
                <span className="relative z-10">Explore Collection 001</span>
              </Link>

              {/* Secondary CTA — frosted glass */}
              <Link
                href="/legacy"
                className="btn-engraved-secondary type-cta inline-flex h-14 items-center rounded-md px-8"
              >
                <span className="relative z-10">Join the Legacy</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Scroll cue — refined, hidden on short viewports */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex md:bottom-10"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2.5"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(247,245,241,0.5)" }}>
            Scroll
          </span>
          <div className="h-10 w-px" style={{ background: "linear-gradient(to bottom, rgba(247,245,241,0.4), transparent)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
