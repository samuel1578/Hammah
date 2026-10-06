import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { absoluteUrl } from "@/lib/seo/site";
import {
  itemPriceDisplay,
  orNotProvided,
  orderStatusLabel,
  orderTypeLabel,
} from "@/lib/orders/display";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ order_number: string }>;
}): Promise<Metadata> {
  const { order_number } = await params;
  return {
    title: `${order_number} | Admin`,
    robots: { index: false, follow: false },
  };
}

interface OrderItemRow {
  id: string;
  product_name_snapshot: string;
  product_slug_snapshot: string;
  variant_label: string | null;
  variant_value: string | null;
  quantity: number | null;
  pricing_mode_snapshot: string | null;
  price_amount_snapshot: number | null;
  currency: string | null;
  media_url_snapshot: string | null;
}

interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  source: string | null;
  communication_channel: string | null;
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
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItemRow[] | null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-40 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ order_number: string }>;
}) {
  const { order_number } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      `id, order_number, user_id, source, communication_channel, status,
       customer_name, customer_phone, customer_email,
       delivery_region, delivery_city, delivery_area, delivery_landmark,
       delivery_gps, delivery_notes, customer_note, admin_notes,
       created_at, updated_at,
       order_items (
         id, product_name_snapshot, product_slug_snapshot,
         variant_label, variant_value, quantity,
         pricing_mode_snapshot, price_amount_snapshot, currency,
         media_url_snapshot
       )`,
    )
    .eq("order_number", order_number)
    .maybeSingle();

  const order = data as OrderRow | null;

  if (!order) {
    notFound();
  }

  const items = order.order_items ?? [];
  const createdAt = new Date(order.created_at);

  return (
    <Container>
      <Link
        href="/admin/orders"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; All orders
      </Link>

      <div className="mt-6 mb-8">
        <p className="font-mono text-2xl font-medium tracking-wider text-foreground">
          {order.order_number}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-surface-elevated px-2.5 py-1 text-xs font-medium text-foreground">
            {orderStatusLabel(order.status)}
          </span>
          <span className="text-sm text-muted-foreground">
            {createdAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" · "}
            {createdAt.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Order summary */}
        <section>
          <h2 className="mb-4 font-serif text-lg italic text-foreground">
            Order Summary
          </h2>
          <div className="rounded-md border border-border bg-surface p-4">
            <dl className="space-y-2 text-sm">
              <DetailRow label="Order number" value={order.order_number} />
              <DetailRow
                label="Created"
                value={`${createdAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })} at ${createdAt.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              />
              <DetailRow label="Status" value={orderStatusLabel(order.status)} />
              <DetailRow
                label="Customer type"
                value={orderTypeLabel(order.source, order.user_id)}
              />
              <DetailRow
                label="Channel"
                value={order.communication_channel ?? "whatsapp"}
              />
            </dl>
          </div>
        </section>

        {/* Customer */}
        <section>
          <h2 className="mb-4 font-serif text-lg italic text-foreground">
            Customer
          </h2>
          <div className="rounded-md border border-border bg-surface p-4">
            <dl className="space-y-2 text-sm">
              <DetailRow label="Name" value={orNotProvided(order.customer_name)} />
              <DetailRow label="Phone" value={orNotProvided(order.customer_phone)} />
              <DetailRow
                label="Email"
                value={orNotProvided(order.customer_email)}
              />
              <DetailRow
                label="Customer type"
                value={orderTypeLabel(order.source, order.user_id)}
              />
            </dl>
          </div>
        </section>

        {/* Items */}
        <section>
          <h2 className="mb-4 font-serif text-lg italic text-foreground">
            {items.length === 1 ? "Item" : "Items"}
          </h2>
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-md border border-border bg-surface p-4 text-sm text-muted-foreground">
                No order items recorded.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-md border border-border bg-surface p-4 sm:flex-row"
                >
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-muted">
                    {item.media_url_snapshot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.media_url_snapshot}
                        alt={item.product_name_snapshot}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {item.product_name_snapshot}
                    </p>
                    <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div className="flex gap-2">
                        <dt className="w-24">Size</dt>
                        <dd className="text-foreground">
                          {orNotProvided(item.variant_label ?? item.variant_value)}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-24">Quantity</dt>
                        <dd className="text-foreground">{item.quantity ?? 1}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-24">Pricing mode</dt>
                        <dd className="text-foreground">
                          {item.pricing_mode_snapshot ?? "—"}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-24">Price</dt>
                        <dd className="text-foreground">
                          {itemPriceDisplay(
                            item.pricing_mode_snapshot,
                            item.price_amount_snapshot,
                            item.currency,
                          )}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-24">Currency</dt>
                        <dd className="text-foreground">
                          {item.currency ?? "GHS"}
                        </dd>
                      </div>
                    </dl>
                    {item.product_slug_snapshot && (
                      <a
                        href={absoluteUrl(`/product/${item.product_slug_snapshot}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                      >
                        View product &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Delivery */}
        <section>
          <h2 className="mb-4 font-serif text-lg italic text-foreground">
            Delivery
          </h2>
          <div className="rounded-md border border-border bg-surface p-4">
            <dl className="space-y-2 text-sm">
              <DetailRow
                label="Region"
                value={orNotProvided(order.delivery_region)}
              />
              <DetailRow
                label="City / Town"
                value={orNotProvided(order.delivery_city)}
              />
              <DetailRow label="Area" value={orNotProvided(order.delivery_area)} />
              <DetailRow
                label="Landmark"
                value={orNotProvided(order.delivery_landmark)}
              />
              <DetailRow
                label="GhanaPost GPS"
                value={orNotProvided(order.delivery_gps)}
              />
              <DetailRow
                label="Delivery notes"
                value={orNotProvided(order.delivery_notes)}
              />
            </dl>
          </div>
        </section>

        {/* Customer note */}
        <section>
          <h2 className="mb-4 font-serif text-lg italic text-foreground">
            Customer Note
          </h2>
          <div className="rounded-md border border-border bg-surface p-4">
            {order.customer_note ? (
              <p className="text-sm text-foreground">{order.customer_note}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No customer note</p>
            )}
          </div>
        </section>

        {/* Admin notes (read-only) */}
        <section>
          <h2 className="mb-4 font-serif text-lg italic text-foreground">
            Admin Notes
          </h2>
          <div className="rounded-md border border-border bg-surface p-4">
            {order.admin_notes ? (
              <p className="text-sm text-foreground">{order.admin_notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                None. Editing is not available yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </Container>
  );
}
