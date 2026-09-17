import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${id} | SL by Hammah` };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderNumber } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, created_at, source,
      customer_name, customer_phone, customer_email,
      delivery_region, delivery_city, delivery_area,
      delivery_landmark, delivery_gps, delivery_notes, customer_note,
      order_items (
        product_name_snapshot, product_slug_snapshot,
        variant_label, variant_value, quantity,
        pricing_mode_snapshot, price_amount_snapshot, currency,
        media_url_snapshot
      )
    `)
    .eq("order_number", orderNumber)
    .eq("user_id", user!.id)
    .single();

  if (!order) {
    notFound();
  }

  const items = (order.order_items as any[]) ?? [];

  const statusLabels: Record<string, string> = {
    pending: "Request received",
    contacted: "Contacted",
    confirmed: "Confirmed",
    preparing: "In preparation",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/account/orders"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; All orders
      </Link>

      {/* Header */}
      <div>
        <p className="font-mono text-2xl font-medium tracking-wider text-foreground">
          {order.order_number}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-surface-elevated px-2.5 py-1 text-xs font-medium text-foreground">
            {statusLabels[order.status] ?? order.status}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Items */}
      <section>
        <h2 className="mb-4 font-serif italic text-lg text-foreground">
          Items
        </h2>
        <div className="space-y-4">
          {items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-md border border-border bg-surface p-4"
            >
              <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-muted">
                {item.media_url_snapshot ? (
                  <img
                    src={item.media_url_snapshot}
                    alt={item.product_name_snapshot}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {item.product_name_snapshot}
                </p>
                {item.variant_label && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Size: {item.variant_label}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.pricing_mode_snapshot === "PRICE_ON_REQUEST"
                    ? "Price on request"
                    : item.price_amount_snapshot != null
                      ? `${item.currency} ${(item.price_amount_snapshot / 100).toFixed(2)}`
                      : "Price on request"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer snapshot */}
      <section>
        <h2 className="mb-4 font-serif italic text-lg text-foreground">
          Contact Details
        </h2>
        <div className="rounded-md border border-border bg-surface p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="w-24 text-muted-foreground">Name</dt>
              <dd className="text-foreground">{order.customer_name}</dd>
            </div>
            {order.customer_email && (
              <div className="flex gap-4">
                <dt className="w-24 text-muted-foreground">Email</dt>
                <dd className="text-foreground">{order.customer_email}</dd>
              </div>
            )}
            <div className="flex gap-4">
              <dt className="w-24 text-muted-foreground">Phone</dt>
              <dd className="text-foreground">{order.customer_phone}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Delivery */}
      <section>
        <h2 className="mb-4 font-serif italic text-lg text-foreground">
          Delivery
        </h2>
        <div className="rounded-md border border-border bg-surface p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="w-24 text-muted-foreground">Region</dt>
              <dd className="text-foreground">{order.delivery_region}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 text-muted-foreground">City</dt>
              <dd className="text-foreground">{order.delivery_city}</dd>
            </div>
            {order.delivery_area && (
              <div className="flex gap-4">
                <dt className="w-24 text-muted-foreground">Area</dt>
                <dd className="text-foreground">{order.delivery_area}</dd>
              </div>
            )}
            {order.delivery_landmark && (
              <div className="flex gap-4">
                <dt className="w-24 text-muted-foreground">Landmark</dt>
                <dd className="text-foreground">{order.delivery_landmark}</dd>
              </div>
            )}
            {order.delivery_gps && (
              <div className="flex gap-4">
                <dt className="w-24 text-muted-foreground">GPS</dt>
                <dd className="text-foreground">{order.delivery_gps}</dd>
              </div>
            )}
            {order.delivery_notes && (
              <div className="flex gap-4">
                <dt className="w-24 text-muted-foreground">Notes</dt>
                <dd className="text-foreground">{order.delivery_notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* Customer note */}
      {order.customer_note && (
        <section>
          <h2 className="mb-4 font-serif italic text-lg text-foreground">
            Your Note
          </h2>
          <div className="rounded-md border border-border bg-surface p-4">
            <p className="text-sm text-foreground">{order.customer_note}</p>
          </div>
        </section>
      )}
    </div>
  );
}
