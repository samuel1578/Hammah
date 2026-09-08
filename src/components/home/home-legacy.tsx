"use client";

import Link from "next/link";
import { getMediaById } from "@/data/media-manifest";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";

const benefits = [
  "Order history",
  "Saved pieces",
  "Member privileges",
  "Early-access opportunities",
];

export function HomeLegacy() {
  const media = getMediaById("home-legacy");

  return (
    <section className="py-16 md:py-36 bg-surface" aria-labelledby="legacy-heading">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16 md:items-center">
          {/* Copy */}
          <div className="order-2 md:order-1">
            <TextReveal
              as="h2"
              id="legacy-heading"
              className="type-headline text-foreground"
            >
              The Hammah Legacy
            </TextReveal>

            <Reveal delay={0.15} y={12}>
              <p className="type-editorial-statement mt-6 max-w-md text-foreground">
                The relationship continues after the first piece. Become a
                Hamatee to keep your orders, saved pieces and member privileges
                together.
              </p>
            </Reveal>

            <Stagger className="mt-6 md:mt-8 space-y-3" staggerDelay={0.06}>
              {benefits.map((b) => (
                <motion.div
                  key={b}
                  variants={staggerItemVariants}
                  className="flex items-center gap-3 text-sm text-foreground"
                >
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                  {b}
                </motion.div>
              ))}
            </Stagger>

            <Reveal delay={0.4} y={12}>
              <div className="mt-6 md:mt-8">
                <Link
                  href="/legacy"
                  className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-primary px-7"
                >
                  Join the Legacy
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2">
            <MediaReveal className="aspect-[16/10]">
              {media && (
                <img
                  src={media.currentSrc}
                  alt="The Hammah Legacy — membership and privileges"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </MediaReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
