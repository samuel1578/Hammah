"use client";

import Link from "next/link";
import { getMediaBySection } from "@/data/media-manifest";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";

const worldCategories = [
  {
    label: "Trousers",
    status: "Available now",
    href: "/collections/collection-001",
    mediaId: "home-category-trousers",
    dominant: true,
  },
  {
    label: "Kaftans",
    status: "Coming soon",
    href: "/collections/kaftans",
    mediaId: "home-category-kaftans",
    dominant: false,
  },
  {
    label: "African-made Footwear",
    status: "Coming soon",
    href: "/collections/footwear",
    mediaId: "home-category-footwear",
    dominant: false,
  },
];

export function HomeHammahWorld() {
  return (
    <section className="py-24 md:py-36 bg-surface" aria-labelledby="hammah-world-heading">
      <Container>
        {/* Header */}
        <div className="mb-12 md:mb-20">
          <TextReveal
            as="h2"
            id="hammah-world-heading"
            className="type-headline text-foreground"
          >
            The Hammah World
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="type-editorial-statement mt-6 max-w-2xl text-foreground">
              More than one expression. Trousers open the story. Kaftans and
              African-made footwear will extend it.
            </p>
          </Reveal>
        </div>

        {/* Desktop: dominant + 2 smaller. Mobile: stacked. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-4">
          {worldCategories.map((cat) => {
            const slot = getMediaBySection("hammah-world").find(
              (m) => m.id === cat.mediaId,
            );
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={`group relative overflow-hidden ${
                  cat.dominant
                    ? "md:col-span-7 aspect-[4/5] md:aspect-[3/4]"
                    : "md:col-span-5 aspect-[4/5]"
                }`}
              >
                <MediaReveal className="absolute inset-0">
                  {slot && (
                    <img
                      src={slot.currentSrc}
                      alt={cat.label}
                      className="h-full w-cover object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </MediaReveal>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <Reveal delay={cat.dominant ? 0 : 0.1}>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
                      {cat.status}
                    </p>
                  </Reveal>
                  <Reveal delay={cat.dominant ? 0.1 : 0.15}>
                    <h3 className="mt-1 type-statement text-foreground">
                      {cat.label}
                    </h3>
                  </Reveal>
                  <Reveal delay={cat.dominant ? 0.15 : 0.2}>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
                      Explore
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Reveal>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
