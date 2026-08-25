"use client";

import Link from "next/link";
import { getMediaByRoute } from "@/data/media-manifest";
import { CollectionHero } from "@/components/editorial/collection-hero";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";

export default function OurStoryPage() {
  const media = getMediaByRoute("/our-story");

  const hero = media.find((m) => m.section === "hero");
  const pov = media.find((m) => m.section === "pov");
  const african = media.find((m) => m.section === "african-fashion");
  const craft01 = media.find((m) => m.id === "story-craft-01");
  const craft02 = media.find((m) => m.id === "story-craft-02");
  const sourcing = media.find((m) => m.section === "sourcing");
  const sustainability = media.find((m) => m.section === "sustainability");
  const closing = media.find((m) => m.section === "closing");

  return (
    <>
      {/* Hero — directional overlay for readability over media */}
      <CollectionHero
        heading="Our Story"
        subheading="Why Hammah exists."
        body="SL by Hammah begins with a simple position: clothing should feel considered before it feels loud."
        media={hero}
        overlay="linear-gradient(90deg, rgba(17,17,16,0.70) 0%, rgba(17,17,16,0.38) 42%, rgba(17,17,16,0.08) 70%, transparent 100%)"
        headingColor="#F7F5F1"
        bodyColor="rgba(247,245,241,0.80)"
      />

      {/* Point of View */}
      <section className="py-20 md:py-32" aria-labelledby="story-pov-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-16">
            <div className="md:col-span-5">
              <MediaReveal className="aspect-[3/4]">
                {pov && (
                  <img src={pov.currentSrc} alt="For the person wearing it" className="h-full w-full object-cover" loading="lazy" />
                )}
              </MediaReveal>
            </div>
            <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
              <TextReveal as="h2" id="story-pov-heading" className="font-serif italic text-3xl leading-snug tracking-tight text-foreground sm:text-4xl md:text-5xl">
                For the person wearing it.
              </TextReveal>
              <Reveal delay={0.2} y={12}>
                <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                  The brand is made for adults who prefer fewer, better pieces and value quality over visible logos.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* African Fashion Context */}
      <section className="py-20 md:py-32 bg-surface" aria-labelledby="story-african-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div className="order-2 md:order-1">
              <TextReveal as="h2" id="story-african-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
                Rooted here. Designed to move.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                  African print is part of Hammah&apos;s opening visual language, while the wider brand will extend into kaftans, footwear and future categories.
                </p>
              </Reveal>
            </div>
            <MediaReveal className="aspect-[4/5] order-1 md:order-2">
              {african && (
                <img src={african.currentSrc} alt="African fashion context" className="h-full w-full object-cover" loading="lazy" />
              )}
            </MediaReveal>
          </div>
        </Container>
      </section>

      {/* Craft */}
      <section className="py-20 md:py-32" aria-labelledby="story-craft-heading">
        <Container>
          <TextReveal as="h2" id="story-craft-heading" className="mb-10 md:mb-16 font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
            The making matters.
          </TextReveal>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[craft01, craft02].map(
              (slot, i) =>
                slot && (
                  <MediaReveal key={slot.id} delay={i * 0.15} className={i === 1 ? "mt-8" : ""}>
                    <div className="aspect-square">
                      <img src={slot.currentSrc} alt={slot.intent} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  </MediaReveal>
                ),
            )}
          </div>
          <Reveal delay={0.3} y={12}>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              This section is reserved for approved information about Hammah&apos;s manufacturing, construction and finishing process.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Sourcing */}
      <section className="py-20 md:py-32 bg-surface" aria-labelledby="story-sourcing-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <MediaReveal className="aspect-[4/5]">
              {sourcing && (
                <img src={sourcing.currentSrc} alt="What a piece begins with" className="h-full w-full object-cover" loading="lazy" />
              )}
            </MediaReveal>
            <div>
              <TextReveal as="h2" id="story-sourcing-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
                What a piece begins with.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  This section will explain approved sourcing and material information once the brand has finalised the facts it wants to publish.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Sustainability */}
      <section className="py-20 md:py-32" aria-labelledby="story-sustainability-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div className="order-2 md:order-1">
              <TextReveal as="h2" id="story-sustainability-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
                Responsibility needs specifics.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  Hammah&apos;s sustainability position will be published here once sourcing, production and material claims have been formally documented.
                </p>
              </Reveal>
            </div>
            <MediaReveal className="aspect-[3/4] order-1 md:order-2">
              {sustainability && (
                <img src={sustainability.currentSrc} alt="Sustainability" className="h-full w-full object-cover" loading="lazy" />
              )}
            </MediaReveal>
          </div>
        </Container>
      </section>

      {/* Closing */}
      <section className="relative flex h-[70svh] min-h-[480px] items-center justify-center overflow-hidden" aria-labelledby="story-closing-heading">
        {closing && (
          <div className="absolute inset-0">
            <img src={closing.currentSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-background/60" />
          </div>
        )}
        <div className="relative z-10 text-center">
          <TextReveal as="p" id="story-closing-heading" className="type-headline text-foreground">
            Considered essentials, cut for people who don&apos;t dress for anyone else.
          </TextReveal>
          <Reveal delay={0.2} y={12}>
            <div className="mt-8">
              <Link href="/collections/collection-001" className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-primary px-7">
                Explore Collection 001
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
