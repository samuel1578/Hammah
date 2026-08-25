"use client";

import type { Product } from "@/types/products";
import type { MediaSlot } from "@/data/media-manifest";
import { ProductCard } from "@/components/product/product-card";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";

interface ProductGridProps {
  products: Product[];
  mediaSlots?: MediaSlot[];
  className?: string;
}

export function ProductGrid({ products, mediaSlots = [], className = "" }: ProductGridProps) {
  return (
    <Stagger
      className={`grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 ${className}`}
      staggerDelay={0.06}
    >
      {products.map((product, i) => {
        const media = mediaSlots[i];
        return (
          <motion.div key={product.id} variants={staggerItemVariants}>
            <ProductCard product={product} media={media} index={i} />
          </motion.div>
        );
      })}
    </Stagger>
  );
}
