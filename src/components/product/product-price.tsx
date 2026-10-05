import type { PricingMode } from "@/types/products";
import { formatPrice } from "@/lib/currency";

interface ProductPriceProps {
  pricingMode: PricingMode;
  priceAmount?: number | null;
  currency?: string | null;
  className?: string;
}

export function ProductPrice({ pricingMode, priceAmount, currency, className = "" }: ProductPriceProps) {
  let label = "Price on request";

  if (pricingMode === "FIXED") {
    label =
      priceAmount != null && currency
        ? formatPrice(priceAmount, currency)
        : "Price unavailable";
  }

  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {label}
    </span>
  );
}
