/**
 * HAMMAH — Order transactional email dispatch (server-only)
 *
 * Wires Brevo Templates #1 (`order_new_admin`) and #2
 * (`order_received_customer`) into the real order flow.
 *
 * Contract:
 *  - Called **after** `create_order` has persisted the order. It must never
 *    fail, invalidate, roll back or re-create an order, and must never
 *    throw into the request handler.
 *  - It re-reads the **persisted** `orders` row and its `order_items`
 *    snapshot server-side (never trusting client state), then sends.
 *  - Every send is deduped through the Sprint 1 `dedupe_key` claim, so a
 *    retried POST that returns the same order cannot resend.
 *
 * All values are read through the service-role Supabase client and the
 * Brevo transport; secrets are never logged.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/seo/site";
import {
  itemPriceDisplay,
  orNotProvided,
  orderTypeLabel,
} from "@/lib/orders/display";
import { assertServerRuntime } from "./guard";
import { getEnabledOrderNotificationRecipients } from "./recipients";
import { sendTrackedTemplateEmail } from "./send";
import type { TrackedSendStatus } from "./send";
import type {
  OrderNewAdminEmailParams,
  OrderReceivedCustomerEmailParams,
} from "./templates";

/* ─────────────────────────────────────────────
   PERSISTED ROW SHAPES
   ───────────────────────────────────────────── */

interface PersistedOrderItem {
  product_id: string | null;
  product_name_snapshot: string;
  product_slug_snapshot: string;
  variant_label: string | null;
  variant_value: string | null;
  quantity: number;
  pricing_mode_snapshot: string;
  price_amount_snapshot: number | null;
  currency: string | null;
  media_url_snapshot: string | null;
}

interface PersistedOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  source: string;
  communication_channel: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_region: string;
  delivery_city: string;
  delivery_area: string | null;
  delivery_landmark: string | null;
  delivery_gps: string | null;
  delivery_notes: string | null;
  customer_note: string | null;
  created_at: string;
  order_items: PersistedOrderItem[] | null;
}

interface CollectionJoinRow {
  collection: { name: string | null } | null;
}

/* ─────────────────────────────────────────────
   DISPLAY DERIVATIONS
   ───────────────────────────────────────────── */

const ORDER_STATUS_DISPLAY: Record<string, string> = {
  pending: "Request received",
  contacted: "Contacted",
  confirmed: "Confirmed",
  preparing: "In preparation",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Customer-facing display of the persisted status. Never mutates it. */
export function orderStatusDisplay(status: string | null | undefined): string {
  if (!status) return "Request received";
  return ORDER_STATUS_DISPLAY[status] ?? status;
}

/** Display label for the persisted `communication_channel` value. */
export function communicationChannelDisplay(
  channel: string | null | undefined,
): string {
  const value = channel?.trim();
  if (!value) return "WhatsApp";
  if (value.toLowerCase() === "whatsapp") return "WhatsApp";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Safe first-name derivation; never crashes on a malformed name. */
export function firstNameFrom(fullName: string | null | undefined): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return "there";
  const first = trimmed.split(/\s+/)[0];
  return first && first.length > 0 ? first : "there";
}

/** Human, stable timestamp for email bodies (en-GB). */
export function formatOrderTimestamp(iso: string | null | undefined): string {
  if (!iso) return "Not provided";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function sizeDisplay(item: PersistedOrderItem | null): string {
  if (!item) return "Not provided";
  return orNotProvided(item.variant_label ?? item.variant_value);
}

function productImageUrl(item: PersistedOrderItem | null): string {
  return item?.media_url_snapshot?.trim() ?? "";
}

function productUrl(item: PersistedOrderItem | null): string {
  const slug = item?.product_slug_snapshot?.trim();
  if (!slug) return absoluteUrl("/shop");
  return absoluteUrl(`/product/${slug}`);
}

/* ─────────────────────────────────────────────
   DATA ACCESS
   ───────────────────────────────────────────── */

async function readPersistedOrder(orderId: string): Promise<PersistedOrder | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, user_id, source, communication_channel, status,
      customer_name, customer_phone, customer_email,
      delivery_region, delivery_city, delivery_area,
      delivery_landmark, delivery_gps, delivery_notes, customer_note, created_at,
      order_items (
        product_id, product_name_snapshot, product_slug_snapshot,
        variant_label, variant_value, quantity,
        pricing_mode_snapshot, price_amount_snapshot, currency, media_url_snapshot
      )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as PersistedOrder;
}

/**
 * `collection_name` is NOT persisted on `order_items`. The cleanest stable
 * real source is the product's first published collection (by
 * `collection_products.sort_order`). Returns null when the product belongs
 * to no published collection.
 */
async function lookupCollectionName(productId: string | null): Promise<string | null> {
  if (!productId) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("collection_products")
      .select("collection:collections!inner ( name )")
      .eq("product_id", productId)
      .eq("collection.status", "published")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    const name = (data as unknown as CollectionJoinRow).collection?.name?.trim();
    return name && name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────
   PARAM BUILDERS
   ───────────────────────────────────────────── */

function buildAdminParams(
  order: PersistedOrder,
  item: PersistedOrderItem | null,
  collectionName: string | null,
): OrderNewAdminEmailParams {
  return {
    order_number: order.order_number,
    created_at: formatOrderTimestamp(order.created_at),
    order_status: orderStatusDisplay(order.status),

    product_name: item?.product_name_snapshot?.trim() || "Not provided",
    collection_name: orNotProvided(collectionName),
    product_image_url: productImageUrl(item),
    product_url: productUrl(item),
    size: sizeDisplay(item),
    quantity: item?.quantity ?? 1,
    price_display: item
      ? itemPriceDisplay(
          item.pricing_mode_snapshot,
          item.price_amount_snapshot,
          item.currency,
        )
      : "Price on request",

    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    customer_email: orNotProvided(order.customer_email),
    customer_type: orderTypeLabel(order.source, order.user_id),
    communication_channel: communicationChannelDisplay(order.communication_channel),

    delivery_region: orNotProvided(order.delivery_region),
    delivery_city: orNotProvided(order.delivery_city),
    delivery_area: orNotProvided(order.delivery_area),
    delivery_landmark: orNotProvided(order.delivery_landmark),
    delivery_gps: orNotProvided(order.delivery_gps),
    delivery_notes: orNotProvided(order.delivery_notes),

    customer_note: order.customer_note?.trim() || "No customer note",

    admin_order_url: absoluteUrl(`/admin/orders/${order.order_number}`),
  };
}

function buildCustomerParams(
  order: PersistedOrder,
  item: PersistedOrderItem | null,
  collectionName: string | null,
): OrderReceivedCustomerEmailParams {
  // Only authenticated Hamatee orders get an order-history CTA. Guests have
  // no such route and must never be linked to a fake one.
  const isHamatee = orderTypeLabel(order.source, order.user_id) === "Hamatee";
  const selectedPieceUrl = productUrl(item);
  const orderUrl = isHamatee
    ? absoluteUrl(`/account/orders/${order.order_number}`)
    : selectedPieceUrl;

  return {
    order_number: order.order_number,
    created_at: formatOrderTimestamp(order.created_at),
    order_status: orderStatusDisplay(order.status),

    customer_first_name: firstNameFrom(order.customer_name),

    product_name: item?.product_name_snapshot?.trim() || "Not provided",
    collection_name: orNotProvided(collectionName),
    product_image_url: productImageUrl(item),
    product_url: selectedPieceUrl,
    size: sizeDisplay(item),
    quantity: item?.quantity ?? 1,
    price_display: item
      ? itemPriceDisplay(
          item.pricing_mode_snapshot,
          item.price_amount_snapshot,
          item.currency,
        )
      : "Price on request",

    delivery_region: orNotProvided(order.delivery_region),
    delivery_city: orNotProvided(order.delivery_city),
    delivery_area: orNotProvided(order.delivery_area),
    delivery_landmark: orNotProvided(order.delivery_landmark),
    delivery_gps: orNotProvided(order.delivery_gps),

    order_url: orderUrl,
    show_order_cta: isHamatee,
  };
}

/* ─────────────────────────────────────────────
   DISPATCH
   ───────────────────────────────────────────── */

export type CustomerEmailOutcome = TrackedSendStatus | "no_email" | "not_attempted";

export interface OrderEmailDispatchSummary {
  adminRecipients: number;
  adminSent: number;
  adminFailed: number;
  adminDuplicate: number;
  customer: CustomerEmailOutcome;
}

/**
 * Re-read the persisted order and dispatch Templates #1 and #2.
 *
 * NEVER throws. Safe to call from `after()` so the order response is not
 * delayed and email problems cannot change the HTTP result.
 */
export async function dispatchOrderEmails(
  orderId: string,
): Promise<OrderEmailDispatchSummary> {
  assertServerRuntime();

  const summary: OrderEmailDispatchSummary = {
    adminRecipients: 0,
    adminSent: 0,
    adminFailed: 0,
    adminDuplicate: 0,
    customer: "not_attempted",
  };

  try {
    const order = await readPersistedOrder(orderId);
    if (!order) {
      console.warn(
        `[email/orders] persisted order ${orderId} not found; skipping email dispatch.`,
      );
      return summary;
    }

    const item = order.order_items?.[0] ?? null;
    const collectionName = item ? await lookupCollectionName(item.product_id) : null;

    // ── Template #1 → every enabled Admin recipient ──
    const recipients = await getEnabledOrderNotificationRecipients();
    summary.adminRecipients = recipients.length;

    if (recipients.length === 0) {
      console.warn(
        `[email/orders] no enabled Admin notification recipients; Template #1 not sent for ${order.order_number}.`,
      );
    } else {
      const adminParams = buildAdminParams(order, item, collectionName);
      const results = await Promise.all(
        recipients.map((recipient) =>
          sendTrackedTemplateEmail({
            templateKey: "order_new_admin",
            to: recipient.email,
            params: { ...adminParams },
            orderId: order.id,
            tags: ["order_new_admin"],
            metadata: { order_number: order.order_number, source: order.source },
          }),
        ),
      );

      for (const result of results) {
        if (result.status === "sent") summary.adminSent += 1;
        else if (result.status === "failed") summary.adminFailed += 1;
        else if (result.status === "duplicate") summary.adminDuplicate += 1;
      }
    }

    // ── Template #2 → customer, only when an email exists ──
    if (!order.customer_email || !order.customer_email.trim()) {
      summary.customer = "no_email";
      return summary;
    }

    const customerParams = buildCustomerParams(order, item, collectionName);
    const customerResult = await sendTrackedTemplateEmail({
      templateKey: "order_received_customer",
      to: order.customer_email,
      params: { ...customerParams },
      orderId: order.id,
      tags: ["order_received_customer"],
      metadata: { order_number: order.order_number, source: order.source },
    });
    summary.customer = customerResult.status;

    return summary;
  } catch (err) {
    // Defence-in-depth: nothing here may bubble into the order handler.
    console.error("[email/orders] unexpected dispatch error", {
      orderId,
      message: err instanceof Error ? err.message : String(err),
    });
    return summary;
  }
}
