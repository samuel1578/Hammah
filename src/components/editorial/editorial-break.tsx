"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { MediaSlot } from "@/data/media-manifest";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";

interface EditorialBreakProps {
  heading: string;
  body?: string;
  media?: MediaSlot;
  logo?: ReactNode;
  className?: string;
}

export function EditorialBreak({
  heading,
  body,
  media,
  logo,
  className = "",
}: EditorialBreakProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className={`py-16 md:py-24 ${className}`} aria-hidden="true">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center md:gap-16">
          {(media || logo) && (
            <div className="overflow-hidden">
              {logo ? (
                <div className="flex aspect-[16/10] items-center justify-center bg-surface">
                  {logo}
                </div>
              ) : media ? (
                <motion.div
                  initial={{ scale: shouldReduceMotion ? 1 : 1.06 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="aspect-[16/10]"
                >
                  <img
                    src={media.currentSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ) : null}
            </div>
          )}

          <div className="flex flex-col justify-center">
            <TextReveal
              as="p"
              className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              {heading}
            </TextReveal>
            {body && (
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  {body}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
