"use client";

import Link from "next/link";
import { getMediaById } from "@/data/media-manifest";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";

const relationshipPoints = [
  "Your saved pieces, always waiting",
  "Your order history, in one place",
  "A profile that remembers you",
  "A birthday worth celebrating",
];

export function HomeLegacy() {
  const media = getMediaById("home-legacy");

  return (
    <section className="py-16 md:py-36 bg-surface" aria-labelledby="legacy-heading">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16 md:items-center">
          {/* Copy */}
          <div className="order-2 md:order-1">
            <Reveal delay={0} y={12}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Hamatee
              </p>
            </Reveal>

            <TextReveal
              as="h2"
              id="legacy-heading"
              className="type-headline mt-3 text-foreground"
            >
              Stay a little closer to HAMMAH.
            </TextReveal>

            <Reveal delay={0.15} y={12}>
              <p className="type-editorial-statement mt-6 max-w-md text-foreground">
                A Hamatee is more than someone who has placed an order. It is how
                HAMMAH remembers the people who continue the story with us — the
                pieces you save, the orders you have made, and the details that
                help us make the relationship more personal.
              </p>
            </Reveal>

            <Reveal delay={0.25} y={12}>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                And yes, tell us your birthday. HAMMAH plans to make sure
                Hamatees feel remembered when their day comes around.
              </p>
            </Reveal>

            <Stagger className="mt-6 md:mt-8 space-y-3" staggerDelay={0.06}>
              {relationshipPoints.map((b) => (
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
              <div className="mt-6 md:mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-primary px-7"
                >
                  Become a Hamatee
                </Link>
                <Link
                  href="/legacy"
                  className="type-cta inline-flex h-12 items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  What is Hamatee?
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
                  alt="The Hammah Legacy — your relationship with HAMMAH"
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
