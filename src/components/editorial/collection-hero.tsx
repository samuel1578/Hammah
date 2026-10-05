"use client";

import { motion, useReducedMotion } from "motion/react";
import type { MediaSlot } from "@/data/media-manifest";
import { Reveal } from "@/components/motion/reveal";
import { GlitchText } from "@/components/editorial/glitch-text";
import { BrandLogo } from "@/components/brand/brand-logo";

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
  /** Show theme-aware brand logo top-left: secondary mark on desktop, primary lockup on mobile */
  showLogo?: boolean;
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
  showLogo = false,
}: CollectionHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasBackground = !!(media || desktopMedia || mobileMedia);

  return (
    <section
      className={`relative flex h-[50svh] min-h-[400px] items-end overflow-hidden pb-16 md:h-[70svh] md:min-h-[480px] md:items-center md:pb-0 ${className}`}
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

      {/* Brand logo — desktop secondary mark, mobile primary lockup */}
      {showLogo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="absolute top-24 left-5 z-10 sm:left-6 md:left-auto md:right-5 lg:right-8"
        >
          <BrandLogo
            variant="secondary"
            className="hidden md:block md:h-[300px] lg:h-[360px] w-auto"
          />
          <BrandLogo
            variant="primary"
            className="md:hidden h-8 sm:h-9 w-auto"
          />
        </motion.div>
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

          <GlitchText
            as="h1"
            id="collection-hero-heading"
            className="type-hero"
            style={{ color: headingColor || undefined }}
          >
            {heading}
          </GlitchText>

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
