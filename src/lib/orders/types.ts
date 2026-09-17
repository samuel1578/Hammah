export type OrderSource = "website_guest" | "hamatee";
export type OrderStatus =
  | "pending"
  | "contacted"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  source: OrderSource;
  communicationChannel: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryRegion: string;
  deliveryCity: string;
  deliveryArea: string | null;
  deliveryLandmark: string | null;
  deliveryGps: string | null;
  deliveryNotes: string | null;
  customerNote: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productNameSnapshot: string;
  productSlugSnapshot: string;
  variantLabel: string | null;
  variantValue: string | null;
  quantity: number;
  pricingModeSnapshot: string;
  priceAmountSnapshot: number | null;
  currency: string;
  mediaUrlSnapshot: string | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_region: string;
  delivery_city: string;
  delivery_area?: string | null;
  delivery_landmark?: string | null;
  delivery_gps?: string | null;
  delivery_notes?: string | null;
  customer_note?: string | null;
  product_id: string;
  variant_value?: string | null;
  quantity?: number;
  idempotency_key?: string | null;
  date_of_birth?: string | null;
}

export interface CreateOrderResponse {
  order_id: string;
  order_number: string;
}
