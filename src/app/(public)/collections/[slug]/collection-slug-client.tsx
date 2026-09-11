"use client";

import Link from "next/link";
import type { Product } from "@/types/products";
import { CollectionHero } from "@/components/editorial/collection-hero";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";

interface CollectionSlugClientProps {
  collection: { id: string; slug: string; name: string; description?: string };
  products: Product[];
}

export function CollectionSlugClient({ collection, products }: CollectionSlugClientProps) {
  const hasProducts = products.length > 0;

  return (
    <>
      {/* Hero */}
      <CollectionHero
        heading={collection.name}
        subheading="The opening collection."
        body={collection.description ?? `${collection.name} — SL by Hammah.`}
      />

      {hasProducts ? (
        <>
          {/* Featured product — first product large */}
          <section className="py-16 md:py-24" aria-labelledby="featured-heading">
            <Container>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 md:items-center">
                <div>
                  <TextReveal
                    as="h2"
                    id="featured-heading"
                    className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl"
                  >
                    {products[0].name}
                  </TextReveal>
                  <Reveal delay={0.1} y={12}>
                    <p className="mt-3 text-muted-foreground">
                      {collection.name} · {products[0].category}
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
                        href={`/product/${products[0].slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent group"
                      >
                        View product
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </Reveal>
                </div>

                <Link href={`/product/${products[0].slug}`} className="group">
                  <MediaReveal className="aspect-[3/4]">
                    <img
                      src={products[0].media.primary}
                      alt={`${products[0].name} — ${collection.name}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </MediaReveal>
                </Link>
              </div>
            </Container>
          </section>

          {/* Paired products */}
          {products.length > 1 && (
            <section className="py-8 md:py-12" aria-label="More designs">
              <Container>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {[1, 2].filter((i) => i < products.length).map((idx) => (
                    <Reveal key={idx} delay={idx * 0.1}>
                      <ProductCard product={products[idx]} index={idx} />
                    </Reveal>
                  ))}
                </div>
              </Container>
            </section>
          )}

          {/* Full product grid */}
          <section id="products" className="py-12 md:py-20 bg-surface" aria-labelledby="all-heading">
            <Container>
              <TextReveal
                as="h2"
                id="all-heading"
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
                    <ProductCard product={product} index={i} />
                  </motion.div>
                ))}
              </Stagger>
            </Container>
          </section>
        </>
      ) : (
        /* Empty state */
        <section className="py-16 md:py-24" aria-labelledby="empty-heading">
          <Container>
            <Reveal>
              <div className="text-center">
                <TextReveal
                  as="h2"
                  id="empty-heading"
                  className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl"
                >
                  Coming soon.
                </TextReveal>
                <p className="mt-4 mx-auto max-w-md text-muted-foreground">
                  {collection.description ?? "This collection is being prepared. Check back soon."}
                </p>
                <div className="mt-8">
                  <Link
                    href="/legacy"
                    className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    Join the Legacy for updates
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {/* Legacy CTA */}
      <section className="py-16 md:py-24 bg-surface" aria-labelledby="legacy-heading">
        <Container className="text-center">
          <TextReveal
            as="h2"
            id="legacy-heading"
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
