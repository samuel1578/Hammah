"use client";

import { useState } from "react";
import type { Product, MediaMode } from "@/types/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductVideo } from "@/components/product/product-video";
import { MediaModeSelector } from "@/components/product/media-mode-selector";
import { ProductInfoPanel } from "@/components/product/product-info-panel";
import { SizeGuideModal } from "@/components/product/size-guide-modal";
import { StickyMobileCTA } from "@/components/product/sticky-mobile-cta";
import { OrderDrawer } from "@/components/product/order-drawer";
import { RelatedPieces } from "@/components/product/related-pieces";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";

interface PdpClientProps {
  product: Product;
  relatedProducts?: Product[];
}

export function PdpClient({ product, relatedProducts = [] }: PdpClientProps) {
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [mediaMode, setMediaMode] = useState<MediaMode>("photos");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const hasVariants = product.variants.length > 0;

  const handleOrderOpen = () => {
    if (hasVariants && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setOrderOpen(true);
  };

  const handleSizeChange = (size: string | null) => {
    setSelectedSize(size);
    if (size) setSizeError(false);
  };

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
                <div className="space-y-3">
                  <MediaModeSelector
                    videoUrl={product.videoUrl}
                    activeMode={mediaMode}
                    onChange={setMediaMode}
                  />
                  {mediaMode === "video" && product.videoUrl ? (
                    <ProductVideo videoUrl={product.videoUrl} alt={product.name} />
                  ) : (
                    <ProductGallery images={allImages} alt={product.name} />
                  )}
                </div>
              </Reveal>
            </div>

            {/* Right — Info panel (sticky on desktop) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <ProductInfoPanel
                  product={product}
                  onOrderOpen={handleOrderOpen}
                  selectedSize={selectedSize}
                  onSizeChange={handleSizeChange}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  sizeError={sizeError}
                  onSizeGuideOpen={() => setSizeGuideOpen(true)}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Related pieces */}
      <RelatedPieces products={relatedProducts} />

      {/* Sticky mobile CTA */}
      <StickyMobileCTA
        productName={product.name}
        onOrderClick={handleOrderOpen}
      />

      {/* Order drawer */}
      <OrderDrawer
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        product={product}
        size={selectedSize}
        quantity={quantity}
      />

      {/* Size Guide modal */}
      {product.sizeGuideId && (
        <SizeGuideModal
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          sizeGuideId={product.sizeGuideId}
        />
      )}
    </>
  );
}
