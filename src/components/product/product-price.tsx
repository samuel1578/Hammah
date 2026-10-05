import type { PricingMode } from "@/types/products";
import { formatPrice } from "@/lib/currency";

interface ProductPriceProps {
  pricingMode: PricingMode;
  priceAmount?: number | null;
  currency?: string | null;
  className?: string;
}

/**
 * Shared PDP price presentation (Option 2 — Editorial Accent Treatment).
 *
 * Fixed prices render as large elegant serif typography in the warm HAMMAH
 * accent tone with a subtle editorial underline beneath. The accent switches
 * with the light/dark theme via the `--accent-price` token, so every current
 * and future fixed-price product inherits the treatment automatically.
 */
export function ProductPrice({ pricingMode, priceAmount, currency, className = "" }: ProductPriceProps) {
  if (pricingMode === "FIXED" && priceAmount != null && currency) {
    return (
      <div className={`inline-flex flex-col items-start gap-1.5 ${className}`}>
        <span className="font-serif text-2xl leading-none tracking-tight text-accent-price sm:text-3xl">
          {formatPrice(priceAmount, currency)}
        </span>
        <span
          aria-hidden="true"
          className="h-px w-full bg-gradient-to-r from-accent-price via-accent-price/40 to-transparent"
        />
      </div>
    );
  }

  const label = pricingMode === "FIXED" ? "Price unavailable" : "Price on request";

  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {label}
    </span>
  );
}
