"use client";

import Link from "next/link";
import { getMediaByRouteAndSection } from "@/data/media-manifest";
import { getProductsByCollection } from "@/data/products";
import { CollectionHero } from "@/components/editorial/collection-hero";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { SwipeHintToast } from "@/components/ui/swipe-hint-toast";
import { RotatingDetailImages } from "@/components/editorial/rotating-detail-images";

export default function Collection001Page() {
  const heroMedia = getMediaByRouteAndSection("/collections/collection-001", "hero")[0];
  const heroDesktop = getMediaByRouteAndSection("/collections/collection-001", "hero-desktop")[0];
  const heroMobile = getMediaByRouteAndSection("/collections/collection-001", "hero-mobile")[0];
  const productMedia = getMediaByRouteAndSection("/collections/collection-001", "products");
  const detailMedia = getMediaByRouteAndSection("/collections/collection-001", "detail");
  const products = getProductsByCollection("collection-001");

  return (
    <>
      {/* Mobile swipe hint */}
      <SwipeHintToast triggerId="products" />

      {/* Hero */}
      <CollectionHero
        heading="Collection 001"
        subheading="The opening collection."
        body="Eight African-print trouser designs introduce the first orderable collection from SL by Hammah."
        media={heroMedia}
        desktopMedia={heroDesktop}
        mobileMedia={heroMobile}
        cta={{ label: "Explore the pieces", href: "#products" }}
        contentClassName="items-start justify-end max-w-[320px] sm:max-w-[360px] md:max-w-7xl md:items-center md:justify-center pb-20 md:pb-0"
      />

      {/* Featured product — one large */}
      <section className="py-16 md:py-24" aria-labelledby="c001-featured-heading">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 md:items-center">
            <div>
              <TextReveal
                as="h2"
                id="c001-featured-heading"
                className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl"
              >
                Design 01
              </TextReveal>
              <Reveal delay={0.1} y={12}>
                <p className="mt-3 text-muted-foreground">
                  Collection 001 · Trousers
                </p>
              </Reveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-1 text-sm text-muted-foreground">Price on request</p>
              </Reveal>
              <Reveal delay={0.2} y={12}>
                <p className="mt-1 text-xs text-accent">Available</p>
              </Reveal>
              <Reveal delay={0.25} y={12}>
                <div className="mt-6">
                  <Link
                    href="/product/design-01"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent group"
                  >
                    View product
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </Reveal>
            </div>

            <Link href="/product/design-01" className="group">
              <MediaReveal className="aspect-[3/4]">
                {productMedia[0] && (
                  <img
                    src={productMedia[0].currentSrc}
                    alt="Design 01 — Collection 001"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </MediaReveal>
            </Link>
          </div>
        </Container>
      </section>

      {/* Paired products */}
      <section className="py-8 md:py-12" aria-label="More designs">
        <Container>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[1, 2].map((idx) => (
              <Reveal key={idx} delay={idx * 0.1}>
                <ProductCard
                  product={products[idx]}
                  media={productMedia[idx]}
                  index={idx}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Full product grid */}
      <section id="products" className="py-12 md:py-20 bg-surface" aria-labelledby="c001-all-heading">
        <Container>
          <TextReveal
            as="h2"
            id="c001-all-heading"
            className="mb-8 md:mb-12 font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl"
          >
            All pieces
          </TextReveal>
          <Stagger
            className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4"
            staggerDelay={0.06}
          >
            {products.map((product, i) => (
              <motion.div key={product.id} variants={staggerItemVariants}>
                <ProductCard product={product} media={productMedia[i]} index={i} />
              </motion.div>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Detail interlude */}
      <section className="py-16 md:py-24" aria-labelledby="c001-detail-heading">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 md:items-center">
            <RotatingDetailImages
              initialPair={[detailMedia[0]?.currentSrc ?? "", detailMedia[1]?.currentSrc ?? ""]}
              alts={[
                detailMedia[0]?.intent ?? "Collection 001 — detail close-up",
                detailMedia[1]?.intent ?? "Collection 001 — construction detail",
              ]}
            />

            <div className="flex flex-col justify-center">
              <TextReveal
                as="h2"
                id="c001-detail-heading"
                className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl"
              >
                Seen from closer
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  The collection changes when you look again.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Legacy CTA */}
      <section className="py-16 md:py-24 bg-surface" aria-labelledby="c001-legacy-heading">
        <Container className="text-center">
          <TextReveal
            as="h2"
            id="c001-legacy-heading"
            className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl"
          >
            Keep what catches your eye.
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-4 mx-auto max-w-md text-base text-muted-foreground">
              Hamatees can save pieces and keep their Hammah activity together.
            </p>
          </Reveal>
          <Reveal delay={0.25} y={12}>
            <div className="mt-8">
              <Link
                href="/legacy"
                className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
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
