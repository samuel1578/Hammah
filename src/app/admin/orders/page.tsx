import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import {
  itemPriceDisplay,
  orderStatusLabel,
  orderTypeLabel,
} from "@/lib/orders/display";

export const metadata: Metadata = {
  title: "Orders | Admin",
  robots: { index: false, follow: false },
};

interface OrderItemRow {
  product_name_snapshot: string;
  quantity: number | null;
  pricing_mode_snapshot: string | null;
  price_amount_snapshot: number | null;
  currency: string | null;
}

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  source: string | null;
  user_id: string | null;
  status: string;
  communication_channel: string | null;
  created_at: string;
  order_items: OrderItemRow[] | null;
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, customer_name, source, user_id, status,
       communication_channel, created_at,
       order_items (
         product_name_snapshot, quantity,
         pricing_mode_snapshot, price_amount_snapshot, currency
       )`,
    )
    .order("created_at", { ascending: false });

  const orders = ((data as OrderRow[] | null) ?? []);

  return (
    <Container>
      <div className="mb-8">
        <h1
          className="font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {error
            ? "Could not load orders."
            : `${orders.length} ${orders.length === 1 ? "order" : "orders"} — newest first`}
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Failed to load orders. Please refresh the page.
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No orders yet. Website orders will appear here as they are placed.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-4 py-3 font-semibold text-foreground">Order</th>
                <th className="px-4 py-3 font-semibold text-foreground">Customer</th>
                <th className="hidden px-4 py-3 font-semibold text-foreground md:table-cell">
                  Product
                </th>
                <th className="px-4 py-3 font-semibold text-foreground">Source</th>
                <th className="hidden px-4 py-3 font-semibold text-foreground lg:table-cell">
                  Price
                </th>
                <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="hidden px-4 py-3 font-semibold text-foreground sm:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const items = order.order_items ?? [];
                const primary = items[0];
                const extraCount = items.reduce(
                  (sum, item) => sum + (item.quantity ?? 1),
                  0,
                );
                return (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-surface-elevated/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.order_number}`}
                        className="font-mono font-medium text-foreground hover:text-accent"
                      >
                        {order.order_number}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                        {primary?.product_name_snapshot ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {order.customer_name}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {primary ? (
                        <>
                          {primary.product_name_snapshot}
                          {extraCount > 1 && (
                            <span className="ml-1 text-xs">
                              +{extraCount - 1} more
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-xs font-medium text-foreground">
                        {orderTypeLabel(order.source, order.user_id)}
                      </span>
                      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                        {order.communication_channel ?? "whatsapp"}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {primary
                        ? itemPriceDisplay(
                            primary.pricing_mode_snapshot,
                            primary.price_amount_snapshot,
                            primary.currency,
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-foreground">
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
