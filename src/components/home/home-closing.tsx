"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { getMediaById } from "@/data/media-manifest";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";

const triptychIds = [
  "home-featured-01",
  "home-featured-02",
  "home-featured-03",
];

export function HomeClosing() {
  const shouldReduceMotion = useReducedMotion();
  const media = getMediaById("home-closing");

  return (
    <section className="relative flex h-[70svh] min-h-[480px] items-center justify-center overflow-hidden" aria-labelledby="closing-heading">
      {/* Background */}
      {media && (
        <div className="absolute inset-0">
          {/* Mobile — single spread image */}
          <motion.div
            initial={{ scale: shouldReduceMotion ? 1 : 1.05 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full w-full md:hidden"
          >
            <img
              src={media.currentSrc}
              alt="SL by Hammah — considered essentials"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* Desktop — triptych of portrait product shots */}
          <div className="hidden h-full w-full grid-cols-3 gap-2 md:grid lg:gap-3">
            {triptychIds.map((id, i) => {
              const slot = getMediaById(id);
              if (!slot) return null;
              return (
                <motion.div
                  key={id}
                  initial={{
                    scale: shouldReduceMotion ? 1 : 1.05,
                  }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    delay: shouldReduceMotion ? 0 : i * 0.12,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="h-full w-full overflow-hidden"
                >
                  <img
                    src={slot.currentSrc}
                    alt={slot.intent}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="absolute inset-0 bg-background/60" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 px-5 text-center">
        <TextReveal
          as="h2"
          id="closing-heading"
          className="type-oversized text-foreground"
        >
          SL by Hammah
        </TextReveal>
        <Reveal delay={0.2} y={12}>
          <p className="type-statement mt-5 text-muted-foreground">
            Considered essentials.
          </p>
        </Reveal>
        <Reveal delay={0.35} y={12}>
          <div className="mt-8">
            <Link
              href="/collections/collection-001"
              className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-primary px-7"
            >
              Shop Collection 001
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
