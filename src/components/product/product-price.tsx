import type { PricingMode } from "@/types/products";

interface ProductPriceProps {
  pricingMode: PricingMode;
  className?: string;
}

export function ProductPrice({ pricingMode, className = "" }: ProductPriceProps) {
  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {pricingMode === "PRICE_ON_REQUEST" ? "Price on request" : "—"}
    </span>
  );
}
