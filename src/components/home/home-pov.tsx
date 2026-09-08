"use client";

import Link from "next/link";
import { getMediaById } from "@/data/media-manifest";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";

export function HomePointOfView() {
  const media = getMediaById("home-pov");

  return (
    <section className="py-16 md:py-36" aria-labelledby="pov-heading">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center md:gap-20">
          {/* Image — asymmetric, offset on desktop */}
          <div className="md:col-span-5 md:col-start-1">
            <MediaReveal className="aspect-[3/4] overflow-hidden">
              {media && (
                <img
                  src={media.currentSrc}
                  alt="SL by Hammah — considered essentials"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  loading="lazy"
                />
              )}
            </MediaReveal>
          </div>

          {/* Copy — bigger, more editorial */}
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <TextReveal
              as="h2"
              id="pov-heading"
              className="type-headline text-foreground"
            >
              Made for the person wearing it.
              <br />
              Not the room watching.
            </TextReveal>

            <Reveal delay={0.2} y={16}>
              <p className="type-editorial-statement mt-6 md:mt-8 max-w-lg text-foreground">
                SL by Hammah is built around considered clothing and a quieter
                kind of confidence.
              </p>
            </Reveal>

            <Reveal delay={0.3} y={16}>
              <div className="mt-8 md:mt-10">
                <Link
                  href="/our-story"
                  className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-secondary px-7 group"
                >
                  Read our story
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
