"use client";

import Link from "next/link";
import { getMediaByRoute } from "@/data/media-manifest";
import { CollectionHero } from "@/components/editorial/collection-hero";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Container } from "@/components/ui/container";

export default function KaftansPage() {
  const heroMedia = getMediaByRoute("/collections/kaftans").find(
    (m) => m.section === "hero",
  );
  const previewMedia = getMediaByRoute("/collections/kaftans").find(
    (m) => m.section === "preview",
  );

  return (
    <>
      {/* Hero */}
      <CollectionHero
        heading="Kaftans"
        subheading="A wider expression"
        body="A wider expression of the Hammah wardrobe. Kaftans are part of the Hammah product world."
        media={heroMedia}
      />

      {/* Editorial preview */}
      <section className="py-16 md:py-24" aria-labelledby="kaftans-preview-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 md:items-center">
            <div>
              <TextReveal
                as="h2"
                id="kaftans-preview-heading"
                className="type-headline text-foreground"
              >
                A category taking shape.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-6 max-w-md type-body text-muted-foreground">
                  Kaftans are part of the wider Hammah wardrobe. This is a first
                  look at where the collection is heading.
                </p>
              </Reveal>
            </div>

            <MediaReveal className="aspect-[4/5]">
              {previewMedia && (
                <img
                  src={previewMedia.currentSrc}
                  alt="Kaftans — editorial preview"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </MediaReveal>
          </div>
        </Container>
      </section>

      {/* Legacy CTA */}
      <section className="py-16 md:py-24 bg-surface" aria-labelledby="kaftans-legacy-heading">
        <Container className="text-center">
          <TextReveal
            as="h2"
            id="kaftans-legacy-heading"
            className="type-headline text-foreground"
          >
            Know when it arrives.
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-6 mx-auto max-w-md type-body text-muted-foreground">
              Join the Hammah Legacy for future collection updates and
              early-access opportunities.
            </p>
          </Reveal>
          <Reveal delay={0.25} y={12}>
            <div className="mt-8">
              <Link
                href="/legacy"
                className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-primary px-7"
              >
                Join the Legacy
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
