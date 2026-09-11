"use client";

import type { Product } from "@/types/products";
import { ProductCard } from "@/components/product/product-card";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { TextReveal } from "@/components/motion/text-reveal";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";

interface RelatedPiecesProps {
  products: Product[];
}

export function RelatedPieces({ products }: RelatedPiecesProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-surface" aria-labelledby="related-heading">
      <Container>
        <TextReveal
          as="h2"
          id="related-heading"
          className="mb-8 md:mb-12 font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl"
        >
          More from Collection 001
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
  );
}
