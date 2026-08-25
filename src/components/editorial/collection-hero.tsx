"use client";

import { motion, useReducedMotion } from "motion/react";
import type { MediaSlot } from "@/data/media-manifest";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";

interface CollectionHeroProps {
  heading: string;
  subheading?: string;
  body?: string;
  cta?: { label: string; href: string };
  media?: MediaSlot;
  /** Responsive: desktop image shown from md breakpoint up */
  desktopMedia?: MediaSlot;
  /** Responsive: mobile image shown below md breakpoint */
  mobileMedia?: MediaSlot;
  className?: string;
  /** Additional classes for the content wrapper (e.g. mobile positioning) */
  contentClassName?: string;
  /** Directional overlay gradient for readability over media */
  overlay?: string;
  /** Override heading text colour (e.g. for media surfaces) */
  headingColor?: string;
  /** Override body text colour */
  bodyColor?: string;
}

function HeroImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className || "h-full w-full object-cover object-top"}
    />
  );
}

export function CollectionHero({
  heading,
  subheading,
  body,
  cta,
  media,
  desktopMedia,
  mobileMedia,
  className = "",
  contentClassName = "",
  overlay,
  headingColor,
  bodyColor,
}: CollectionHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasBackground = !!(media || desktopMedia || mobileMedia);

  return (
    <section
      className={`relative flex h-[70svh] min-h-[480px] items-end overflow-hidden pb-16 md:items-center md:pb-0 ${className}`}
      aria-labelledby="collection-hero-heading"
    >
      {/* Background */}
      {hasBackground && (
        <div className="absolute inset-0">
          <motion.div
            initial={{ scale: shouldReduceMotion ? 1 : 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full w-full"
          >
            {/* Responsive: mobile image below md, desktop from md up */}
            {mobileMedia && (
              <HeroImage
                src={mobileMedia.currentSrc}
                alt={mobileMedia.intent}
                className="absolute inset-0 h-full w-full object-cover object-top md:hidden"
              />
            )}
            {desktopMedia ? (
              <HeroImage
                src={desktopMedia.currentSrc}
                alt={desktopMedia.intent}
                className={
                  mobileMedia
                    ? "hidden h-full w-full object-cover object-top md:block"
                    : "h-full w-full object-cover object-top"
                }
              />
            ) : media ? (
              <HeroImage
                src={media.currentSrc}
                alt={media.intent}
                className="h-full w-full object-cover object-top"
              />
            ) : null}
          </motion.div>
          {overlay ? (
            <div
              className="absolute inset-0"
              style={{ background: overlay }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent md:bg-gradient-to-r md:from-background/60 md:via-background/20 md:to-transparent" />
          )}
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${contentClassName}`}>
        <div className="max-w-2xl">
          {subheading && (
            <Reveal delay={0.1} y={12}>
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
                style={{
                  color: headingColor
                    ? "rgba(247,245,241,0.7)"
                    : undefined,
                }}
              >
                {subheading}
              </p>
            </Reveal>
          )}

          <TextReveal
            as="h1"
            id="collection-hero-heading"
            className="type-hero"
            style={{ color: headingColor || undefined }}
          >
            {heading}
          </TextReveal>

          {body && (
            <Reveal delay={0.3} y={12}>
              <p
                className="mt-6 max-w-lg type-body"
                style={{ color: bodyColor || undefined }}
              >
                {body}
              </p>
            </Reveal>
          )}

          {cta && (
            <Reveal delay={0.45} y={12}>
              <div className="mt-8">
                <a
                  href={cta.href}
                  className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  {cta.label}
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
