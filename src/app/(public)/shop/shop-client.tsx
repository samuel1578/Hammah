"use client";

import { useState } from "react";
import type { Product } from "@/types/products";
import type { CatalogueCategory } from "@/lib/catalogue";
import { CollectionHero } from "@/components/editorial/collection-hero";
import { ProductGrid } from "@/components/product/product-grid";
import { EditorialBreak } from "@/components/editorial/editorial-break";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand/brand-logo";
import Link from "next/link";

interface ShopClientProps {
  products: Product[];
  categories: CatalogueCategory[];
}

export function ShopClient({ products, categories }: ShopClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredProducts =
    activeFilter === "all"
      ? products
      : products.filter((p) => p.category === activeFilter);

  const firstHalf = filteredProducts.slice(0, 4);
  const secondHalf = filteredProducts.slice(4);

  return (
    <>
      {/* Hero — editorial content, fixture-driven */}
      <CollectionHero
        heading="Shop"
        subheading="The pieces."
        body="Collection 001 is available now. Kaftans and African-made footwear will join the Hammah catalogue in future releases."
      />

      {/* Category navigation */}
      <Container className="py-8 md:py-12">
        <nav aria-label="Product categories">
          <ul className="flex flex-wrap gap-2">
            <li>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === "all"
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <button
                  type="button"
                  onClick={() => setActiveFilter(cat.slug)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeFilter === cat.slug
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      {/* Product grid — first half */}
      <Container className="pb-8 md:pb-12">
        <ProductGrid products={firstHalf} />
      </Container>

      {/* Editorial break */}
      <EditorialBreak
        heading="One collection. Eight expressions."
        body="Different prints. One opening statement."
        logo={<BrandLogo variant="secondary" className="h-[120px] sm:h-[160px] md:h-[200px] w-auto" />}
      />

      {/* Product grid — second half */}
      {secondHalf.length > 0 && (
        <Container className="pt-8 md:pt-12 pb-16 md:pb-24">
          <ProductGrid products={secondHalf} />
        </Container>
      )}

      {/* Empty state for coming-soon categories */}
      {activeFilter !== "all" && filteredProducts.length === 0 && (
        <Container className="py-16 md:py-24">
          <Reveal>
            <div className="text-center">
              <p className="font-serif italic text-2xl text-foreground">
                Explore {categories.find((c) => c.slug === activeFilter)?.name ?? "this category"}
              </p>
              <p className="mt-3 text-muted-foreground">
                A wider expression of the Hammah wardrobe.
              </p>
              <Link
                href="/legacy"
                className="mt-6 inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Join the Legacy for updates
              </Link>
            </div>
          </Reveal>
        </Container>
      )}
    </>
  );
}
