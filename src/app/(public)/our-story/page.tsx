"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "motion/react";
import { getMediaByRoute } from "@/data/media-manifest";
import type { MediaSlot } from "@/data/media-manifest";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { Marquee } from "@/components/editorial/marquee";
import { Container } from "@/components/ui/container";
import { useRotatingImagePair } from "@/components/editorial/rotating-image-pair";
import { AnimatedBrandMark } from "@/components/editorial/animated-brand-mark";

/* ═══════════════════════════════════════════════════
   OUR STORY — Editorial Redesign (Complete)
   
   1.  Editorial Hero
   2.  Brand Statement
   3.  Point of View (sticky desktop / stacked mobile)
   4.  Marquee — "MADE WITH INTENTION"
   5.  African Fashion (full-bleed)
   6.  Craft (asymmetric editorial + parallax)
   7.  Sourcing (text/image overlap)
   8.  Sustainability (typography-led)
   9.  Marquee — "SL BY HAMMAH"
   10. Closing Campaign (full-bleed + CTA)
   ═══════════════════════════════════════════════════ */

export default function OurStoryPage() {
  const media = getMediaByRoute("/our-story");

  const hero = media.find((m) => m.section === "hero");
  const pov = media.find((m) => m.section === "pov");
  const african = media.find((m) => m.section === "african-fashion");
  const sourcing = media.find((m) => m.section === "sourcing");
  const closing = media.find((m) => m.section === "closing");

  return (
    <>
      {/* ═══════════════════════════════════════
          1. EDITORIAL HERO
          ═══════════════════════════════════════ */}
      <section
        className="relative h-[100svh] min-h-[560px] overflow-hidden bg-[#111110]"
        aria-labelledby="story-hero-heading"
      >
        {hero && (
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full w-full"
            >
              <img
                src={hero.currentSrc}
                alt={hero.intent}
                className="absolute inset-0 h-full w-full object-cover object-top md:hidden"
                loading="eager"
              />
              <img
                src={hero.currentSrc}
                alt={hero.intent}
                className="absolute inset-0 hidden h-full w-full object-cover object-top md:block"
                loading="eager"
              />
            </motion.div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(17,17,16,0.75) 0%, rgba(17,17,16,0.40) 40%, rgba(17,17,16,0.08) 70%, transparent 100%)",
              }}
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#111116]/70 via-transparent to-transparent md:from-[#111116]/30" />
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col justify-end pb-16 md:items-end md:justify-center md:pb-0">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="type-eyebrow mb-4"
                style={{ color: "rgba(247,245,241,0.65)" }}
              >
                Why Hammah exists.
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.33, 1, 0.68, 1] }}
                id="story-hero-heading"
                className="type-oversized mb-5"
                style={{ color: "#F7F5F1" }}
              >
                Our Story
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="type-body max-w-lg"
                style={{ color: "rgba(247,245,241,0.80)" }}
              >
                SL by Hammah begins with a simple position: clothing should feel
                considered before it feels loud.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. BRAND STATEMENT
          ═══════════════════════════════════════ */}
      <section
        className="py-20 md:py-32 lg:py-40"
        aria-labelledby="story-statement-heading"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Stagger staggerDelay={0.12}>
              <motion.p
                variants={staggerItemVariants}
                className="type-headline text-foreground mb-6"
              >
                SL by Hammah begins with a simple position.
              </motion.p>
              <motion.p
                variants={staggerItemVariants}
                className="type-statement text-muted-foreground"
              >
                Clothing should feel considered before it feels loud.
              </motion.p>
            </Stagger>
            <Reveal delay={0.3} y={16}>
              <p className="type-body text-muted-foreground mx-auto mt-10 max-w-xl">
                The brand is made for adults who prefer fewer, better pieces
                and value quality over visible logos. Every garment is designed
                to carry presence without demanding attention.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          3. POINT OF VIEW
          ═══════════════════════════════════════ */}
      <PointOfViewSection povSlot={pov} />

      {/* ═══════════════════════════════════════
          4. MARQUEE — "MADE WITH INTENTION"
          ═══════════════════════════════════════ */}
      <Marquee speed={45} className="bg-surface border-y border-border/40">
        <span className="type-headline text-foreground/80 select-none">
          MADE WITH INTENTION
        </span>
      </Marquee>

      {/* ═══════════════════════════════════════
          5. AFRICAN FASHION
          ═══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="story-african-heading"
      >
        {african && (
          <div className="relative h-[70svh] min-h-[480px] md:h-[85svh]">
            <MediaReveal className="h-full w-full" scale={1.04}>
              <img
                src={african.currentSrc}
                alt={african.intent}
                className="h-full w-full object-cover object-top"
                loading="lazy"
              />
            </MediaReveal>
            <div className="absolute inset-0 bg-gradient-to-t from-[#111116]/80 via-[#111116]/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 pb-16 md:pb-0">
                <div className="max-w-3xl">
                  <TextReveal
                    as="h2"
                    id="story-african-heading"
                    className="type-headline text-[#F7F5F1] mb-4"
                  >
                    Rooted here. Designed to move.
                  </TextReveal>
                  <Reveal delay={0.2} y={16}>
                    <p className="type-body max-w-lg" style={{ color: "rgba(247,245,241,0.80)" }}>
                      African print is part of Hammah&apos;s opening visual
                      language, while the wider brand will extend into
                      kaftans, footwear and future categories.
                    </p>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          6. CRAFT — ASYMMETRIC EDITORIAL
          ═══════════════════════════════════════ */}
      <CraftSection />

      {/* ═══════════════════════════════════════
          6b. EDITORIAL STATEMENT
          ═══════════════════════════════════════ */}
      <section className="py-16 md:py-20 lg:py-24" aria-hidden="true">
        <Container>
          <Reveal y={20}>
            <p className="type-headline text-center text-foreground/70 max-w-4xl mx-auto">
              Detail is where the character lives.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          7. SOURCING — TEXT/IMAGE OVERLAP
          ═══════════════════════════════════════ */}
      <SourcingSection sourcingSlot={sourcing} />

      {/* ═══════════════════════════════════════
          8. SUSTAINABILITY — TYPOGRAPHY-LED
          ═══════════════════════════════════════ */}
      <SustainabilitySection />

      {/* ═══════════════════════════════════════
          9. MARQUEE — "SL BY HAMMAH"
          ═══════════════════════════════════════ */}
      <Marquee speed={35} direction="right" className="bg-[#111110] border-y border-border/20">
        <span className="type-oversized text-[#F7F5F1]/70 select-none">
          SL BY HAMMAH
        </span>
      </Marquee>

      {/* ═══════════════════════════════════════
          10. CLOSING CAMPAIGN
          ═══════════════════════════════════════ */}
      <ClosingSection closingSlot={closing} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   POINT OF VIEW — STICKY DESKTOP / STACKED MOBILE
   ═══════════════════════════════════════════════════ */

function PointOfViewSection({ povSlot }: { povSlot?: MediaSlot }) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [40, -40],
  );

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 lg:py-32"
      aria-labelledby="story-pov-heading"
    >
      <Container>
        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-12 lg:gap-16 md:items-start">
          <div className="md:col-span-5 lg:col-span-5 md:sticky md:top-28">
            {povSlot && (
              <MediaReveal className="aspect-[3/4]">
                <motion.img
                  src={povSlot.currentSrc}
                  alt={povSlot.intent}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  style={{ y: imageY }}
                />
              </MediaReveal>
            )}
          </div>
          <div className="md:col-span-6 lg:col-span-6 md:col-start-7 flex flex-col gap-16 lg:gap-20 py-8">
            <Reveal y={20}>
              <p className="type-eyebrow text-muted-foreground mb-4">Point of View</p>
              <h2 className="type-headline text-foreground mb-6">For the person wearing it.</h2>
              <p className="type-body text-muted-foreground max-w-lg">
                The brand is made for adults who prefer fewer, better pieces
                and value quality over visible logos.
              </p>
            </Reveal>
            <Reveal y={20}>
              <p className="type-statement text-foreground max-w-lg">Not designed to trend. Designed to stay.</p>
              <p className="type-body text-muted-foreground mt-4 max-w-lg">
                Every piece in Collection 001 is built to be reached for
                again — clothing that earns its place in a considered
                wardrobe through construction, not publicity.
              </p>
            </Reveal>
            <Reveal y={20}>
              <p className="type-body text-muted-foreground max-w-lg">
                SL by Hammah does not follow seasonal cycles. It releases
                when a piece is ready — when the fabric, the cut, and the
                intent align. Nothing ships before its time.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          {povSlot && (
            <MediaReveal className="aspect-[3/4] mb-8">
              <img src={povSlot.currentSrc} alt={povSlot.intent} className="h-full w-full object-cover" loading="lazy" />
            </MediaReveal>
          )}
          <Reveal y={16}>
            <p className="type-eyebrow text-muted-foreground mb-3">Point of View</p>
            <h2 className="type-headline text-foreground mb-5">For the person wearing it.</h2>
            <p className="type-body text-muted-foreground mb-8">
              The brand is made for adults who prefer fewer, better pieces
              and value quality over visible logos.
            </p>
          </Reveal>
          <Reveal y={16} delay={0.1}>
            <p className="type-statement text-foreground mb-4">Not designed to trend. Designed to stay.</p>
            <p className="type-body text-muted-foreground mb-8">
              Every piece in Collection 001 is built to be reached for
              again — clothing that earns its place in a considered
              wardrobe through construction, not publicity.
            </p>
          </Reveal>
          <Reveal y={16} delay={0.15}>
            <p className="type-body text-muted-foreground">
              SL by Hammah does not follow seasonal cycles. It releases
              when a piece is ready — when the fabric, the cut, and the
              intent align. Nothing ships before its time.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CRAFT — ASYMMETRIC EDITORIAL + PARALLAX

   Desktop: dominant image (left, tall) + offset
   smaller image (right, shifted down) with subtle
   scroll-linked parallax. Typography below.

   Mobile: dominant → offset secondary → statement → copy.

   Images rotate from Collection 001 pool using
   the shared useRotatingImagePair hook.
   ═══════════════════════════════════════════════════ */

function CraftSection() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    slotAUrl,
    slotBUrl,
    shouldReduceMotion: _rotationReduced,
    sectionRef: rotationRef,
  } = useRotatingImagePair();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const parallaxMain = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [30, -30],
  );

  const parallaxSecondary = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [50, -20],
  );

  /* Merge the two section refs */
  const setRefs = (el: HTMLDivElement | null) => {
    (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (rotationRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  return (
    <section
      ref={setRefs}
      className="py-16 md:py-24 lg:py-32"
      aria-labelledby="story-craft-heading"
    >
      <Container>
        {/* Desktop: asymmetric layout */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-start">
          {/* Dominant image — tall, left */}
          <div className="md:col-span-7 lg:col-span-7">
            <div className="aspect-[3/4] relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slotAUrl}
                  src={slotAUrl}
                  alt="SL by Hammah — craft detail"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.05 : 0.6,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  loading="lazy"
                  style={{ y: parallaxMain }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Right column: offset smaller image + text */}
          <div className="md:col-span-5 lg:col-span-5 md:col-start-8 flex flex-col">
            {/* Smaller image — offset downward */}
            <div className="md:mt-24 lg:mt-32">
              <div className="aspect-[4/5] max-w-sm relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={slotBUrl}
                    src={slotBUrl}
                    alt="SL by Hammah — construction detail"
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.015 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0.05 : 0.6,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    loading="lazy"
                    style={{ y: parallaxSecondary }}
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Typography below the offset image */}
            <div className="mt-12 lg:mt-16">
              <TextReveal
                as="h2"
                id="story-craft-heading"
                className="type-headline text-foreground mb-6"
              >
                The making matters.
              </TextReveal>
              <Reveal delay={0.15} y={16}>
                <p className="type-body text-muted-foreground max-w-md">
                  Every Hammah piece begins with attention to proportion,
                  balance and finish.
                </p>
                <p className="type-body text-muted-foreground max-w-md mt-4">
                  The aim is simple: clothing that feels considered before
                  it ever feels complicated. From the shape of a trouser
                  to the way a print sits across the silhouette, each
                  decision is made to support the final presence of the piece.
                </p>
                <p className="type-body text-muted-foreground max-w-md mt-4">
                  We believe the difference is often found in the details
                  people notice only after they have worn something for a while.
                </p>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Mobile: stacked intentionally */}
        <div className="md:hidden">
          {/* Dominant image */}
          <div className="aspect-[4/5] mb-4 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={`mobile-${slotAUrl}`}
                src={slotAUrl}
                alt="SL by Hammah — craft detail"
                className="absolute inset-0 h-full w-full object-cover"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.05 : 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                loading="lazy"
              />
            </AnimatePresence>
          </div>

          {/* Offset secondary — shifted right, narrower */}
          <div className="ml-auto w-[75%]">
            <div className="aspect-[3/4] relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`mobile-${slotBUrl}`}
                  src={slotBUrl}
                  alt="SL by Hammah — construction detail"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.05 : 0.6,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Statement + body */}
          <div className="mt-10">
            <TextReveal as="h2" id="story-craft-heading-mobile" className="type-headline text-foreground mb-5">
              The making matters.
            </TextReveal>
            <Reveal delay={0.1} y={16}>
              <p className="type-body text-muted-foreground max-w-md">
                Every Hammah piece begins with attention to proportion,
                balance and finish.
              </p>
              <p className="type-body text-muted-foreground max-w-md mt-4">
                The aim is simple: clothing that feels considered before
                it ever feels complicated. From the shape of a trouser
                to the way a print sits across the silhouette, each
                decision is made to support the final presence of the piece.
              </p>
              <p className="type-body text-muted-foreground max-w-md mt-4">
                We believe the difference is often found in the details
                people notice only after they have worn something for a while.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SOURCING — TEXT/IMAGE COMPOSITION

   Desktop: image left (~55%), text right (~45%).
   Text stays entirely on one background — no
   overlap across image/page boundary.

   Mobile: image → text. No overlap.
   ═══════════════════════════════════════════════════ */

function SourcingSection({ sourcingSlot }: { sourcingSlot?: MediaSlot }) {
  return (
    <section
      className="py-16 md:py-24 lg:py-32 bg-surface"
      aria-labelledby="story-sourcing-heading"
    >
      <Container>
        {/* Desktop: clean side-by-side */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-10 lg:gap-16 md:items-center">
          {/* Image — left, ~55% */}
          <div className="md:col-span-6 lg:col-span-6">
            {sourcingSlot && (
              <MediaReveal className="aspect-[4/5]" scale={1.03}>
                <img
                  src={sourcingSlot.currentSrc}
                  alt={sourcingSlot.intent}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </MediaReveal>
            )}
          </div>

          {/* Text — right, ~45%, entirely on surface background */}
          <div className="md:col-span-5 lg:col-span-5 md:col-start-8">
            <TextReveal
              as="h2"
              id="story-sourcing-heading"
              className="type-oversized text-foreground"
            >
              What a piece begins with.
            </TextReveal>
            <Reveal delay={0.2} y={16}>
              <p className="type-body text-muted-foreground mt-6 max-w-lg">
                Before a piece becomes part of the Hammah wardrobe, it
                begins with the materials, colour and visual character
                that give it direction.
              </p>
              <p className="type-body text-muted-foreground mt-4 max-w-lg">
                We are interested in textiles that can carry both expression
                and restraint — pieces that feel distinctive without losing
                their ability to be worn, styled and lived in.
              </p>
              <p className="type-body text-muted-foreground mt-4 max-w-lg">
                As the brand develops, this section will continue to
                document more of the material choices behind each collection.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Mobile: stacked, no overlap */}
        <div className="md:hidden">
          {sourcingSlot && (
            <MediaReveal className="aspect-[4/5] mb-8" scale={1.03}>
              <img
                src={sourcingSlot.currentSrc}
                alt={sourcingSlot.intent}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </MediaReveal>
          )}

          <TextReveal
            as="h2"
            id="story-sourcing-heading-mobile"
            className="type-headline text-foreground"
          >
            What a piece begins with.
          </TextReveal>
          <Reveal delay={0.1} y={12}>
            <p className="type-body text-muted-foreground mt-4 max-w-md">
              Before a piece becomes part of the Hammah wardrobe, it
              begins with the materials, colour and visual character
              that give it direction.
            </p>
            <p className="type-body text-muted-foreground mt-4 max-w-md">
              We are interested in textiles that can carry both expression
              and restraint — pieces that feel distinctive without losing
              their ability to be worn, styled and lived in.
            </p>
            <p className="type-body text-muted-foreground mt-4 max-w-md">
              As the brand develops, this section will continue to
              document more of the material choices behind each collection.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SUSTAINABILITY — TYPOGRAPHY-LED + BRAND MARK

   Predominantly typographic. Animated contour/logo
   brand mark below the copy replaces the former
   static photograph.
   ═══════════════════════════════════════════════════ */

function SustainabilitySection() {
  return (
    <section
      className="py-20 md:py-32 lg:py-40"
      aria-labelledby="story-sustainability-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={16}>
            <p className="type-eyebrow text-muted-foreground mb-6">
              Sustainability
            </p>
          </Reveal>

          <TextReveal
            as="h2"
            id="story-sustainability-heading"
            className="type-oversized text-foreground mb-8"
          >
            Responsibility needs specifics.
          </TextReveal>

          <Reveal delay={0.2} y={16}>
            <p className="type-body text-muted-foreground mx-auto max-w-lg">
              We do not want to use broad sustainability language simply
              because it sounds good.
            </p>
            <p className="type-body text-muted-foreground mx-auto max-w-lg mt-4">
              For Hammah, responsibility means being more deliberate about
              what we make, how much we make, and how long a piece is
              intended to remain relevant in someone&apos;s wardrobe.
            </p>
            <p className="type-body text-muted-foreground mx-auto max-w-lg mt-4">
              As our production systems develop, we will publish clearer
              information about materials, sourcing, production and the
              decisions we are able to verify.
            </p>
            <p className="type-body text-muted-foreground mx-auto max-w-lg mt-4">
              Until then, we would rather be specific about what we know
              than make claims we cannot support.
            </p>
          </Reveal>
        </div>

        {/* Animated brand mark — contour lines + secondary logo */}
        <Reveal delay={0.3} y={20}>
          <div className="mt-12 md:mt-16 mx-auto max-w-2xl h-[220px] sm:h-[260px] md:h-[300px] lg:h-[360px] xl:h-[420px]">
            <AnimatedBrandMark />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CLOSING — FULL-BLEED CAMPAIGN
   
   Full-bleed image with reduced overlay, oversized
   final statement, Collection 001 CTA.
   ═══════════════════════════════════════════════════ */

function ClosingSection({ closingSlot }: { closingSlot?: MediaSlot }) {
  return (
    <section
      className="relative h-[85svh] min-h-[560px] overflow-hidden"
      aria-labelledby="story-closing-heading"
    >
      {closingSlot && (
        <div className="absolute inset-0">
          <MediaReveal className="h-full w-full" scale={1.03}>
            <img
              src={closingSlot.currentSrc}
              alt=""
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          </MediaReveal>
          {/* Lighter overlay — image should dominate */}
          <div className="absolute inset-0 bg-[#111116]/40 pointer-events-none" />
          {/* Bottom gradient for CTA legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111116]/70 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-5">
        <div className="max-w-3xl">
          <TextReveal
            as="p"
            id="story-closing-heading"
            className="type-oversized text-[#F7F5F1] mb-4"
          >
            This is only the beginning.
          </TextReveal>
          <Reveal delay={0.15} y={16}>
            <p className="type-statement max-w-xl mx-auto" style={{ color: "rgba(247,245,241,0.80)" }}>
              Hammah is still defining its language — through trousers,
              through print, through proportion, and through the people
              who choose to wear it.
            </p>
          </Reveal>
          <Reveal delay={0.25} y={16}>
            <p className="type-body max-w-md mx-auto mt-4" style={{ color: "rgba(247,245,241,0.65)" }}>
              Collection 001 opens the story. It does not finish it.
            </p>
          </Reveal>
          <Reveal delay={0.3} y={16}>
            <div className="mt-10">
              <Link
                href="/collections/collection-001"
                className="type-cta inline-flex h-13 items-center rounded-md btn-engraved-primary px-8"
              >
                <span className="relative z-10">Explore Collection 001</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
