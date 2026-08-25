"use client";

import { getMediaByRoute } from "@/data/media-manifest";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand/brand-logo";
import Link from "next/link";

export default function CollectionsPage() {
  const collectionMedia = getMediaByRoute("/collections");

  return (
    <>
      {/* Hero — Title Style + secondary logo */}
      <section className="pt-20 pb-12 md:pt-32 md:pb-16" aria-labelledby="collections-heading">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center md:gap-12">
            <div className="md:col-span-7">
              <Reveal delay={0} y={8}>
                <p className="type-eyebrow mb-4 text-muted-foreground">Collections</p>
              </Reveal>
              <TextReveal
                as="h1"
                id="collections-heading"
                className="type-headline text-foreground"
              >
                The current release
                <br />
                and what comes next.
              </TextReveal>
              <Reveal delay={0.2} y={14}>
                <p className="type-editorial-statement mt-6 max-w-lg text-foreground">
                  Hammah begins with Collection 001 and expands from there.
                </p>
              </Reveal>
            </div>
            <div className="flex justify-center md:col-span-5 md:justify-end">
              <Reveal delay={0.3} y={12}>
                <BrandLogo variant="secondary" className="h-[100px] sm:h-[140px] md:h-[180px] lg:h-[220px] w-auto" />
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Collection 001 — dominant */}
      <section className="py-12 md:py-20" aria-labelledby="c001-heading">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 md:items-center">
            <MediaReveal className="aspect-[4/5]">
              {collectionMedia.find((m) => m.section === "collection-001") && (
                <img
                  src={
                    collectionMedia.find((m) => m.section === "collection-001")!
                      .currentSrc
                  }
                  alt="Collection 001 — African-print trousers"
                  className="h-full w-full object-cover"
                />
              )}
            </MediaReveal>

            <div>
              <Reveal delay={0.1}>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                  Available now
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <h2
                  id="c001-heading"
                  className="mt-2 type-headline text-foreground"
                >
                  Collection 001
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-1 text-lg text-muted-foreground">
                  African-print trousers
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <p className="mt-4 max-w-md type-body text-muted-foreground">
                  Eight trouser designs form the first orderable Hammah
                  collection.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-6">
                  <Link
                    href="/collections/collection-001"
                    className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-primary px-7"
                  >
                    Enter Collection 001
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Kaftans */}
      <section className="py-12 md:py-20 bg-surface" aria-labelledby="kaftans-heading">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 md:items-center">
            <div className="order-2 md:order-1">
              <Reveal delay={0.15}>
                <h2
                  id="kaftans-heading"
                  className="type-headline text-foreground"
                >
                  Kaftans
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-4 max-w-md type-body text-muted-foreground">
                  A wider expression of the Hammah wardrobe.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-6">
                  <Link
                    href="/collections/kaftans"
                    className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-secondary px-7"
                  >
                    Explore Kaftans
                  </Link>
                </div>
              </Reveal>
            </div>

            <MediaReveal className="aspect-[4/5] order-1 md:order-2">
              <img
                src="/images/hammah/home/categories/kaftan.jpg"
                alt="Kaftans"
                className="h-full w-full object-cover"
              />
            </MediaReveal>
          </div>
        </Container>
      </section>

      {/* Footwear */}
      <section className="py-12 md:py-20" aria-labelledby="footwear-heading">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 md:items-center">
            <MediaReveal className="aspect-[4/5]">
              {collectionMedia.find((m) => m.section === "footwear") && (
                <img
                  src={
                    collectionMedia.find((m) => m.section === "footwear")!
                      .currentSrc
                  }
                  alt="African-made Footwear"
                  className="h-full w-full object-cover"
                />
              )}
            </MediaReveal>

            <div>
              <Reveal delay={0.15}>
                <h2
                  id="footwear-heading"
                  className="type-headline text-foreground"
                >
                  African-made Footwear
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-4 max-w-md type-body text-muted-foreground">
                  The Hammah wardrobe continues from the ground up.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-6">
                  <Link
                    href="/collections/footwear"
                    className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-secondary px-7"
                  >
                    Explore Footwear
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
