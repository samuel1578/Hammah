"use client";

import { useState } from "react";
import type { Product } from "@/types/products";
import type { MediaMode } from "@/types/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfoPanel } from "@/components/product/product-info-panel";
import { MediaModeSelector, MediaModePlaceholder } from "@/components/product/media-mode-selector";
import { StickyMobileCTA } from "@/components/product/sticky-mobile-cta";
import { OrderDrawer } from "@/components/product/order-drawer";
import { RelatedPieces } from "@/components/product/related-pieces";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";

interface PdpClientProps {
  product: Product;
}

export function PdpClient({ product }: PdpClientProps) {
  const [mediaMode, setMediaMode] = useState<MediaMode>("photos");
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const allImages = [...product.media.gallery, ...product.media.details];

  return (
    <>
      {/* Product layout */}
      <section className="py-8 md:py-12" aria-labelledby="pdp-heading">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left — Gallery */}
            <div className="lg:col-span-7">
              <Reveal>
                <MediaModeSelector onChange={setMediaMode} />
              </Reveal>
              <div className="mt-4">
                {mediaMode === "photos" ? (
                  <ProductGallery images={allImages} alt={product.name} />
                ) : (
                  <MediaModePlaceholder mode={mediaMode} />
                )}
              </div>
            </div>

            {/* Right — Info panel (sticky on desktop) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <ProductInfoPanel
                  product={product}
                  onOrderOpen={() => setOrderOpen(true)}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Related pieces */}
      <RelatedPieces currentSlug={product.slug} />

      {/* Sticky mobile CTA */}
      <StickyMobileCTA
        productName={product.name}
        onOrderClick={() => setOrderOpen(true)}
      />

      {/* Order drawer */}
      <OrderDrawer
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        product={product}
        size={selectedSize}
        quantity={quantity}
      />
    </>
  );
}
