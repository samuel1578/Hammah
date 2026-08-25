"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/products";
import type { MediaSlot } from "@/data/media-manifest";
import { ProductPrice } from "@/components/product/product-price";
import { AvailabilityLabel } from "@/components/product/availability-label";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface ProductCardProps {
  product: Product;
  media?: MediaSlot;
  index?: number;
}

/** Collect up to 3 card images: primary, hover, first gallery fallback */
function getCardImages(
  product: Product,
  media?: MediaSlot,
): { mobile: string[]; desktopPrimary: string; desktopHover?: string } {
  const primary = media?.currentSrc || product.media?.primary || "";
  const hover = product.media?.hover;
  // For mobile Swiper: primary + hover + first gallery (max 3)
  const galleryExtras = (product.media?.gallery || []).filter(
    (g) => g !== primary && g !== hover,
  );
  const mobile: string[] = [primary];
  if (hover && hover !== primary) mobile.push(hover);
  if (galleryExtras[0] && galleryExtras[0] !== primary && galleryExtras[0] !== hover)
    mobile.push(galleryExtras[0]);
  return { mobile, desktopPrimary: primary, desktopHover: hover };
}

export function ProductCard({ product, media, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mobile, desktopPrimary, desktopHover } = getCardImages(product, media);

  const handleMouseEnter = useCallback(() => {
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const handleFocus = useCallback(() => {
    setHovered(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Small delay so click still registers
    focusTimeoutRef.current = setTimeout(() => setHovered(false), 150);
  }, []);

  const showHover = hovered && desktopHover && desktopHover !== desktopPrimary;
  const isMobileCard = mobile.length > 1;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <MediaReveal delay={index * 0.08} className="relative aspect-[3/4] overflow-hidden">
        {/* Desktop: primary + hover crossfade */}
        {!isMobileCard ? (
          <div className="h-full w-full">
            {/* Primary */}
            <img
              src={desktopPrimary}
              alt={`${product.name} — Collection 001`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                showHover ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
            />
            {/* Hover */}
            {desktopHover && (
              <img
                src={desktopHover}
                alt={`${product.name} — alternate view`}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${
                  showHover
                    ? "opacity-100 scale-[1.015]"
                    : "opacity-0 scale-100"
                }`}
                loading="lazy"
              />
            )}
          </div>
        ) : (
          /* Mobile: Swiper with 2-3 images */
          <Swiper
            modules={[Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            pagination={{ clickable: true }}
            className="product-card-swiper h-full"
            touchRatio={1}
            preventClicks={false}
            preventClicksPropagation={false}
          >
            {mobile.map((img, i) => (
              <SwiperSlide key={img}>
                <img
                  src={img}
                  alt={`${product.name} — photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Hover arrow — desktop only */}
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 opacity-0 transition-all duration-300 group-hover:opacity-100 max-md:hidden">
          <ArrowRight className="h-3.5 w-3.5 text-foreground" />
        </div>
      </MediaReveal>

      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">Collection 001</p>
        <ProductPrice pricingMode={product.pricingMode} />
        <div className="pt-0.5">
          <AvailabilityLabel availability={product.availability} />
        </div>
      </div>
    </Link>
  );
}
