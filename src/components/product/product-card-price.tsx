import type { PricingMode } from "@/types/products";
import { formatPrice } from "@/lib/currency";

interface ProductCardPriceProps {
  pricingMode: PricingMode;
  priceAmount?: number | null;
  currency?: string | null;
  className?: string;
  /** Extra classes for the price figure itself (e.g. responsive size bumps) */
  priceClassName?: string;
}

/**
 * Shared storefront card price presentation (Option 3 — Editorial Price Card).
 *
 * Every product card / storefront card surface should render its price through
 * this component so fixed-price products automatically inherit the editorial
 * treatment (PRICE label framed by thin dividers + refined price below) with
 * no per-product configuration.
 */
export function ProductCardPrice({
  pricingMode,
  priceAmount,
  currency,
  className = "",
  priceClassName = "",
}: ProductCardPriceProps) {
  const isFixed = pricingMode === "FIXED";

  if (!isFixed) {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        Price on request
      </span>
    );
  }

  const hasPrice = priceAmount != null && currency;

  if (!hasPrice) {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        Price unavailable
      </span>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 pt-1.5 pb-0.5 ${className}`}>
      <div className="flex items-center justify-center gap-2.5">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="-mr-[0.25em] text-[10px] font-medium uppercase leading-none tracking-[0.25em] text-muted-foreground">
          Price
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <p className={`font-serif text-lg leading-none tracking-tight text-foreground ${priceClassName}`}>
        {formatPrice(priceAmount, currency)}
      </p>
    </div>
  );
}
