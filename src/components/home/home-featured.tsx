"use client";

import Link from "next/link";
import { getMediaBySection } from "@/data/media-manifest";
import { getProductsByCollection } from "@/data/products";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { ProductCard } from "@/components/product/product-card";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";

export function HomeFeaturedPieces() {
  const products = getProductsByCollection("collection-001").slice(0, 4);
  const featuredMedia = getMediaBySection("featured-pieces");

  return (
    <section className="py-24 md:py-36 bg-surface" aria-labelledby="featured-heading">
      <Container>
        <div className="mb-12 md:mb-16">
          <TextReveal
            as="h2"
            id="featured-heading"
            className="type-headline text-foreground"
          >
            Collection 001
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="type-editorial-statement mt-6 max-w-lg text-foreground">
              Available now. A selection from the opening trouser collection.
            </p>
          </Reveal>
        </div>

        <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" staggerDelay={0.08}>
          {products.map((product, i) => {
            const media = featuredMedia[i];
            return (
              <motion.div key={product.id} variants={staggerItemVariants}>
                <ProductCard product={product} media={media} index={i} />
              </motion.div>
            );
          })}
        </Stagger>

        <Reveal delay={0.2} y={12}>
          <div className="mt-10">
            <Link
              href="/shop"
              className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-secondary px-7 group"
            >
              Shop all trousers
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
