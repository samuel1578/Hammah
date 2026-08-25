"use client";

import Link from "next/link";
import { getMediaByRoute } from "@/data/media-manifest";
import { CollectionHero } from "@/components/editorial/collection-hero";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Container } from "@/components/ui/container";

export default function FootwearPage() {
  const heroMedia = getMediaByRoute("/collections/footwear").find(
    (m) => m.section === "hero",
  );
  const previewMedia = getMediaByRoute("/collections/footwear").find(
    (m) => m.section === "preview",
  );

  return (
    <>
      {/* Hero */}
      <CollectionHero
        heading="African-made Footwear"
        subheading="The wardrobe continues"
        body="The Hammah wardrobe continues from the ground up."
        media={heroMedia}
      />

      {/* Editorial preview */}
      <section className="py-16 md:py-24" aria-labelledby="footwear-preview-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 md:items-center">
            <MediaReveal className="aspect-[4/5] order-2 md:order-1">
              {previewMedia && (
                <img
                  src={previewMedia.currentSrc}
                  alt="African-made Footwear — editorial preview"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </MediaReveal>

            <div className="order-1 md:order-2">
              <TextReveal
                as="h2"
                id="footwear-preview-heading"
                className="type-headline text-foreground"
              >
                Built for what comes next.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-6 max-w-md type-body text-muted-foreground">
                  African-made footwear extends the Hammah wardrobe beyond
                  clothing.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Legacy CTA */}
      <section className="py-16 md:py-24 bg-surface" aria-labelledby="footwear-legacy-heading">
        <Container className="text-center">
          <TextReveal
            as="h2"
            id="footwear-legacy-heading"
            className="type-headline text-foreground"
          >
            Follow what comes next.
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-6 mx-auto max-w-md type-body text-muted-foreground">
              Become a Hamatee and stay closer to future Hammah releases.
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
