/**
 * Shared display helpers for the Admin Orders surfaces.
 *
 * These only translate persisted values for presentation. They must never
 * imply a status workflow exists — `orders.status` is currently always
 * `pending` because nothing in the application writes any other value.
 */
import { formatPrice } from "@/lib/currency";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  contacted: "Contacted",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function orderStatusLabel(status: string | null | undefined): string {
  if (!status) return "Unknown";
  return ORDER_STATUS_LABELS[status] ?? status;
}

/** Derive the customer type from the persisted order source/user. */
export function orderTypeLabel(
  source: string | null | undefined,
  userId: string | null | undefined,
): "Hamatee" | "Guest" {
  if (source === "hamatee" || userId) return "Hamatee";
  return "Guest";
}

/**
 * Price display for a snapshot item.
 * Convention: database amounts are WHOLE units (300 = GHS 300.00) — never
 * divide by 100. PRICE_ON_REQUEST has a null amount.
 */
export function itemPriceDisplay(
  pricingMode: string | null | undefined,
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (pricingMode === "PRICE_ON_REQUEST" || amount == null) {
    return "Price on request";
  }
  return formatPrice(amount, currency ?? "GHS");
}

/** Human label for a nullable snapshot value. */
export function orNotProvided(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Not provided";
}
