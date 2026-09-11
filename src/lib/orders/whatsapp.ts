const WHATSAPP_NUMBER_KEY = "NEXT_PUBLIC_HAMMAH_WHATSAPP_NUMBER";
const SITE_URL_KEY = "NEXT_PUBLIC_SITE_URL";
const DEFAULT_WHATSAPP_NUMBER = "233542739539";

function getWhatsAppNumber(): string {
  const raw = process.env[WHATSAPP_NUMBER_KEY];
  if (!raw) return DEFAULT_WHATSAPP_NUMBER;
  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? digits : DEFAULT_WHATSAPP_NUMBER;
}

function getSiteUrl(): string | null {
  const raw = process.env[SITE_URL_KEY];
  if (!raw) return null;
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

export interface WhatsAppOrderDetails {
  orderNumber: string;
  productName: string;
  productSlug: string;
  size: string | null;
  quantity: number;
  customerName: string;
  deliveryRegion: string;
  deliveryCity: string;
  deliveryGps: string | null;
}

export function buildWhatsAppMessage(details: WhatsAppOrderDetails): string {
  const lines = [
    "Hello HAMMAH,",
    "",
    "I've submitted an order request through the website.",
    "",
    `Order: ${details.orderNumber}`,
    `Piece: ${details.productName}`,
  ];

  if (details.size) {
    lines.push(`Size: ${details.size}`);
  }

  lines.push(`Quantity: ${details.quantity}`);

  const siteUrl = getSiteUrl();
  if (siteUrl) {
    lines.push("");
    lines.push(`${siteUrl}/product/${details.productSlug}`);
  }

  lines.push("");
  lines.push("Delivery:");

  const deliveryParts = [details.deliveryRegion, details.deliveryCity].filter(
    Boolean,
  );
  if (deliveryParts.length > 0) {
    lines.push(deliveryParts.join(", "));
  }

  if (details.deliveryGps) {
    lines.push(`Digital Address: ${details.deliveryGps}`);
  }

  lines.push("");
  lines.push(`Name: ${details.customerName}`);
  lines.push("");
  lines.push("I'd like to continue with this order.");

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = getWhatsAppNumber();
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export function isWhatsAppConfigured(): boolean {
  const raw = process.env[WHATSAPP_NUMBER_KEY];
  if (!raw) return false;
  return raw.replace(/\D/g, "").length > 0;
}
