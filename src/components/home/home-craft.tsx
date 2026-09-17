"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRotatingImagePair } from "@/components/editorial/rotating-image-pair";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand/brand-logo";

/* ─────────────────────────────────────────────
   HOME — IN THE DETAILS / CRAFT

   Uses the shared useRotatingImagePair hook for
   Collection 001 random image rotation. Layout
   and MediaSlot sub-component retained as-is
   to preserve existing appearance.
   ───────────────────────────────────────────── */

export function HomeDetailCraft() {
  const { slotAUrl, slotBUrl, shouldReduceMotion, sectionRef } =
    useRotatingImagePair();

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-36"
      aria-labelledby="detail-craft-heading"
    >
      <Container>
        {/* Eyebrow */}
        <Reveal delay={0} y={8}>
          <p className="type-eyebrow mb-5 text-muted-foreground">In the Details</p>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-20 md:items-center">
          {/* Image zone — asymmetric editorial composition on desktop */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-5 gap-4">
              {/* Large primary detail image */}
              <MediaSlot
                src={slotAUrl}
                alt="SL by Hammah — detail photography"
                colSpan="col-span-3"
                shouldReduceMotion={shouldReduceMotion}
              />

              {/* Secondary detail — offset right on desktop */}
              <MediaSlot
                src={slotBUrl}
                alt="SL by Hammah — construction detail"
                colSpan="col-span-2"
                offset
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>
          </div>

          {/* Copy zone — larger, more editorial */}
          <div className="flex flex-col justify-center md:col-span-5">
            <TextReveal
              as="h2"
              id="detail-craft-heading"
              className="type-headline text-foreground"
            >
              Look closer.
            </TextReveal>

            {/* Secondary logo — editorial brand signature above statement */}
            <Reveal delay={0.15} y={12}>
              <div className="mt-6">
                <BrandLogo
                  variant="secondary"
                  className="h-[42px] sm:h-[50px] md:h-[58px] lg:h-[68px] w-auto"
                />
              </div>
            </Reveal>

            <Reveal delay={0.2} y={16}>
              <p className="type-editorial-statement mt-4 max-w-md text-foreground">
                Print, proportion, construction and finish become clearer at
                close range.
              </p>
            </Reveal>

            <Reveal delay={0.3} y={16}>
              <p className="type-body mt-4 max-w-md text-muted-foreground/70">
                The details are part of the piece. Nothing needs to shout.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MEDIA SLOT — animated image with crossfade
   ───────────────────────────────────────────── */

function MediaSlot({
  src,
  alt,
  colSpan,
  offset,
  shouldReduceMotion,
}: {
  src: string;
  alt: string;
  colSpan: string;
  offset?: boolean;
  shouldReduceMotion: boolean;
}) {
  return (
    <div
      className={`${colSpan} relative ${offset ? "mt-6 md:mt-12" : ""} overflow-hidden`}
    >
      <div className="aspect-[3/4] relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={src}
            src={src}
            alt={alt}
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
  );
}
