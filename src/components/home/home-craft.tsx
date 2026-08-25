"use client";

import { getMediaBySection } from "@/data/media-manifest";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand/brand-logo";

export function HomeDetailCraft() {
  const craftMedia = getMediaBySection("detail-craft");

  return (
    <section className="py-24 md:py-36" aria-labelledby="detail-craft-heading">
      <Container>
        {/* Eyebrow */}
        <Reveal delay={0} y={8}>
          <p className="type-eyebrow mb-5 text-muted-foreground">In the Details</p>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20 md:items-center">
          {/* Image zone — asymmetric editorial composition on desktop */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-5 gap-4">
              {/* Large primary detail image */}
              {craftMedia[0] && (
                <MediaReveal
                  delay={0}
                  className="col-span-3 relative overflow-hidden"
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={craftMedia[0].currentSrc}
                      alt={craftMedia[0].intent}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      loading="eager"
                    />
                  </div>
                </MediaReveal>
              )}

              {/* Secondary detail — offset right, different framing */}
              {craftMedia[1] && (
                <MediaReveal
                  delay={0.15}
                  className="col-span-2 relative mt-12 overflow-hidden"
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={craftMedia[1].currentSrc}
                      alt={craftMedia[1].intent}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                </MediaReveal>
              )}
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
