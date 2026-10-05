/**
 * Single price formatter shared by the storefront and order history.
 *
 * HAMMAH convention: database amounts are WHOLE units (e.g. products.price_amount
 * = 300 means GHS 300). There is no major/minor unit conversion anywhere.
 */
export function formatPrice(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/** Decimal-only price string for structured data (e.g. "300.00"). */
export function priceToDecimalString(amount: number): string {
  return amount.toFixed(2);
}
