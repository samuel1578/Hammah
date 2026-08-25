"use client";

import { useState } from "react";
import { Heart, Ruler, Truck } from "lucide-react";
import type { Product } from "@/types/products";
import { PRODUCT_SIZES, type SizeOption } from "@/types/products";
import { ProductPrice } from "@/components/product/product-price";
import { AvailabilityLabel } from "@/components/product/availability-label";
import { Reveal } from "@/components/motion/reveal";

interface ProductInfoPanelProps {
  product: Product;
  onOrderOpen: () => void;
  selectedSize: string | null;
  onSizeChange: (size: string | null) => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
}

export function ProductInfoPanel({
  product,
  onOrderOpen,
  selectedSize,
  onSizeChange,
  quantity,
  onQuantityChange,
}: ProductInfoPanelProps) {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Title */}
        <Reveal delay={0.1}>
          <div>
            <h1 className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Collection 001
            </p>
          </div>
        </Reveal>

        {/* Price + Availability */}
        <Reveal delay={0.15}>
          <div className="space-y-1">
            <ProductPrice
              pricingMode={product.pricingMode}
              className="text-base"
            />
            <AvailabilityLabel availability={product.availability} />
          </div>
        </Reveal>

        {/* Description */}
        <Reveal delay={0.2}>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </Reveal>

        {/* Size selector */}
        <Reveal delay={0.25}>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Select size
            </label>
            <div className="flex gap-2">
              {PRODUCT_SIZES.map((size: SizeOption) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => onSizeChange(size.value)}
                  disabled={!size.available}
                  className={`h-10 min-w-[2.5rem] rounded-md border px-3 text-sm font-medium transition-colors ${
                    selectedSize === size.value
                      ? "border-accent bg-accent text-accent-foreground"
                      : size.available
                        ? "border-border bg-surface text-foreground hover:border-foreground/30"
                        : "border-border bg-muted text-muted-foreground/40 cursor-not-allowed"
                  }`}
                  aria-label={`Size ${size.label}${selectedSize === size.value ? " (selected)" : ""}`}
                >
                  {size.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Choose the closest available option. Final sizing guidance will be
              added from approved measurements.
            </p>
          </div>
        </Reveal>

        {/* Quantity */}
        <Reveal delay={0.3}>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Quantity
            </label>
            <div className="inline-flex items-center rounded-md border border-border">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="flex h-10 w-10 items-center justify-center text-sm font-medium text-foreground border-x border-border">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        </Reveal>

        {/* Primary CTA */}
        <Reveal delay={0.35}>
          <button
            type="button"
            onClick={onOrderOpen}
            className="w-full h-12 rounded-md btn-engraved-primary font-medium text-sm"
          >
            Order This Piece
          </button>
        </Reveal>

        {/* Save + Size Guide row */}
        <Reveal delay={0.4}>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSaved(!saved)}
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors ${
                saved
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-foreground hover:bg-surface-elevated"
              }`}
              aria-pressed={saved}
            >
              <Heart
                className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
              />
              {saved ? "Saved" : "Save Piece"}
            </button>
            <button
              type="button"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md btn-engraved-secondary text-sm font-medium"
            >
              <Ruler className="h-4 w-4" />
              Size Guide
            </button>
          </div>
        </Reveal>

        {/* Delivery */}
        <Reveal delay={0.45}>
          <div className="rounded-md border border-border bg-surface p-4">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Delivery</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Delivery arrangements and costs are confirmed after your order
                  request.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* How ordering works */}
        <Reveal delay={0.5}>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              How ordering works
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Submit your order request first. Hammah will then continue the
              conversation with you directly and confirm the next steps,
              including payment and delivery.
            </p>
          </div>
        </Reveal>

        {/* Product details */}
        <Reveal delay={0.55}>
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">
              Product details
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Collection 001</li>
              <li>Category: Trousers</li>
              <li>Design: {product.name}</li>
            </ul>
          </div>
        </Reveal>
      </div>


    </>
  );
}
