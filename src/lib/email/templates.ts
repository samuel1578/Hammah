/**
 * HAMMAH — Brevo transactional template registry (server-only)
 *
 * The single source of truth mapping stable internal template keys to the
 * Brevo template IDs configured through environment variables. Route
 * handlers and future email workflows must never hardcode a Brevo template
 * ID — resolve it through this registry.
 *
 * Brevo template IDs (production):
 *   1 — HAMMAH — New Order Notification — Admin   → order_new_admin
 *   2 — HAMMAH — Order Request Received — Customer → order_received_customer
 *   3 — HAMMAH — Hamatee Welcome                    → hamatee_welcome
 *   4 — HAMMAH — Happy Birthday                     → birthday
 *
 * Templates 5 and 6 are RESERVED and must not be implemented, mapped or
 * referenced until a real order-status architecture exists.
 */
import { getBrevoTemplateId } from "./config";

export const EMAIL_TEMPLATE_KEYS = {
  ORDER_NEW_ADMIN: "order_new_admin",
  ORDER_RECEIVED_CUSTOMER: "order_received_customer",
  HAMATEE_WELCOME: "hamatee_welcome",
  BIRTHDAY: "birthday",
} as const;

export type EmailTemplateKey =
  (typeof EMAIL_TEMPLATE_KEYS)[keyof typeof EMAIL_TEMPLATE_KEYS];

/** How duplicates for a template should be prevented via `dedupe_key`. */
export type DedupeScope = "order_recipient" | "user" | "year_recipient";

export interface EmailTemplateDefinition {
  key: EmailTemplateKey;
  /** The environment variable holding the Brevo template ID. */
  envVar: string;
  /** Brevo template number in the HAMMAH Brevo account (documentation). */
  brevoTemplateNumber: number;
  description: string;
  dedupeScope: DedupeScope;
  /** Expected Brevo `params` keys. Documentational contract for callers. */
  params: readonly string[];
}

export const EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplateDefinition> = {
  order_new_admin: {
    key: "order_new_admin",
    envVar: "BREVO_TEMPLATE_ID_ORDER_ADMIN",
    brevoTemplateNumber: 1,
    description: "HAMMAH — New Order Notification — Admin",
    dedupeScope: "order_recipient",
    params: [
      "order_number",
      "created_at",
      "order_status",
      "product_name",
      "collection_name",
      "product_image_url",
      "product_url",
      "size",
      "quantity",
      "price_display",
      "customer_name",
      "customer_phone",
      "customer_email",
      "customer_type",
      "communication_channel",
      "delivery_region",
      "delivery_city",
      "delivery_area",
      "delivery_landmark",
      "delivery_gps",
      "delivery_notes",
      "customer_note",
      "admin_order_url",
    ],
  },
  order_received_customer: {
    key: "order_received_customer",
    envVar: "BREVO_TEMPLATE_ID_ORDER_CUSTOMER",
    brevoTemplateNumber: 2,
    description: "HAMMAH — Order Request Received — Customer",
    dedupeScope: "order_recipient",
    params: [
      "order_number",
      "created_at",
      "order_status",
      "customer_first_name",
      "product_name",
      "collection_name",
      "product_image_url",
      "product_url",
      "size",
      "quantity",
      "price_display",
      "delivery_region",
      "delivery_city",
      "delivery_area",
      "delivery_landmark",
      "delivery_gps",
      "order_url",
      "show_order_cta",
    ],
  },
  hamatee_welcome: {
    key: "hamatee_welcome",
    envVar: "BREVO_TEMPLATE_ID_HAMATEE_WELCOME",
    brevoTemplateNumber: 3,
    description: "HAMMAH — Hamatee Welcome",
    dedupeScope: "user",
    params: [
      "first_name",
      "full_name",
      "email",
      "joined_at",
      "account_url",
      "shop_url",
    ],
  },
  birthday: {
    key: "birthday",
    envVar: "BREVO_TEMPLATE_ID_BIRTHDAY",
    brevoTemplateNumber: 4,
    description: "HAMMAH — Happy Birthday",
    dedupeScope: "year_recipient",
    params: ["first_name", "account_url", "shop_url"],
  },
};

/** Resolve the configured Brevo template ID for a registry key. */
export function getTemplateId(key: EmailTemplateKey): number {
  return getBrevoTemplateId(key);
}

/** Look up a template definition by key. */
export function getTemplateDefinition(
  key: EmailTemplateKey,
): EmailTemplateDefinition {
  return EMAIL_TEMPLATES[key];
}

/** Narrow an arbitrary string to a known template key. */
export function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return Object.prototype.hasOwnProperty.call(EMAIL_TEMPLATES, value);
}

/** All registered template keys. */
export function getEmailTemplateKeys(): EmailTemplateKey[] {
  return Object.keys(EMAIL_TEMPLATES) as EmailTemplateKey[];
}

/**
 * Brevo `params` contracts. These interfaces document the variables each
 * Brevo template expects and match the live production templates. Values
 * are supplied by `src/lib/email/order-emails.ts`; the transport itself
 * accepts a plain object.
 *
 * NOTE: the HAMMAH order model persists exactly one `order_items` row per
 * order, so the order templates take a single flat product block rather
 * than an `items[]` array (the Sprint 1 pre-design contract).
 */

/** Template #1 — HAMMAH — New Order Notification — Admin. */
export interface OrderNewAdminEmailParams {
  order_number: string;
  created_at: string;
  /** Customer-facing display of the persisted `orders.status`. */
  order_status: string;

  product_name: string;
  collection_name: string;
  /** Absolute media URL; empty string when the product has no primary media. */
  product_image_url: string;
  product_url: string;
  size: string;
  quantity: number;
  price_display: string;

  customer_name: string;
  customer_phone: string;
  /** "Not provided" when the order has no email. */
  customer_email: string;
  /** "Hamatee" | "Guest". */
  customer_type: string;
  communication_channel: string;

  delivery_region: string;
  delivery_city: string;
  delivery_area: string;
  delivery_landmark: string;
  delivery_gps: string;
  delivery_notes: string;

  customer_note: string;

  /** Absolute Admin order-detail URL. */
  admin_order_url: string;
}

/** Template #2 — HAMMAH — Order Request Received — Customer. */
export interface OrderReceivedCustomerEmailParams {
  order_number: string;
  created_at: string;
  /** Customer-facing display of the persisted `orders.status`. */
  order_status: string;

  customer_first_name: string;

  product_name: string;
  collection_name: string;
  /** Absolute media URL; empty string when the product has no primary media. */
  product_image_url: string;
  product_url: string;
  size: string;
  quantity: number;
  price_display: string;

  delivery_region: string;
  delivery_city: string;
  delivery_area: string;
  delivery_landmark: string;
  delivery_gps: string;

  /**
   * Authenticated Hamatee: the real `/account/orders/<order_number>` URL.
   * Guest: the selected-piece product URL (never an account or demo route).
   */
  order_url: string;
  /**
   * True only for authenticated Hamatee orders. Guests receive `false` so a
   * conditional Brevo block can hide the order-view CTA entirely. See the
   * Sprint 3 report for the exact required Brevo template edit.
   */
  show_order_cta: boolean;
}

/**
 * Template #3 — HAMMAH — Hamatee Welcome.
 *
 * Matches the live production template. Sent only from the confirmed direct
 * signup callback (`src/lib/email/hamatee-welcome.ts`).
 */
export interface HamateeWelcomeEmailParams {
  first_name: string;
  full_name: string;
  /** The authenticated, email-confirmed Supabase user's email. */
  email: string;
  /** Formatted account creation date, e.g. "5 October 2026". */
  joined_at: string;
  account_url: string;
  shop_url: string;
}

/**
 * Template #4 — HAMMAH — Happy Birthday.
 *
 * Matches the live production template. Sent only from the protected
 * birthday cron (`src/lib/email/birthday.ts`).
 */
export interface BirthdayEmailParams {
  first_name: string;
  account_url: string;
  shop_url: string;
}
