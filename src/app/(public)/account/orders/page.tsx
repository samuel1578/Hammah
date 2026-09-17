import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";

export const metadata = {
  title: "Orders | SL by Hammah",
};

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, created_at,
      delivery_region, delivery_city,
      order_items (
        product_name_snapshot, quantity, media_url_snapshot
      )
    `)
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-2xl font-serif italic text-foreground">
          No orders yet.
        </p>
        <p className="mt-3 max-w-sm mx-auto text-sm text-muted-foreground">
          When you place your first order, it will appear here.
        </p>
        <div className="mt-8">
          <Link
            href="/collections/collection-001"
            className="inline-flex h-10 items-center rounded-md btn-engraved-primary px-5 text-sm font-medium"
          >
            Explore Collection 001
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>

      <div className="space-y-4">
        {orders.map((order) => {
          const items = (order.order_items as any[]) ?? [];
          const firstItem = items[0];
          const itemCount = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);

          return (
            <Link
              key={order.id}
              href={`/account/orders/${order.order_number}`}
              className="group block rounded-md border border-border bg-surface p-4 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="h-16 w-12 flex-shrink-0 overflow-hidden bg-muted">
                  {firstItem?.media_url_snapshot ? (
                    <img
                      src={firstItem.media_url_snapshot}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm font-medium text-foreground truncate">
                      {order.order_number}
                    </p>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {firstItem && (
                    <p className="mt-1 text-sm text-muted-foreground truncate">
                      {firstItem.product_name_snapshot}
                      {itemCount > 1 && ` + ${itemCount - 1} more`}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-foreground">
                      {statusLabels[order.status] ?? order.status}
                    </span>
                    {(order.delivery_region || order.delivery_city) && (
                      <span className="text-xs text-muted-foreground truncate">
                        {[order.delivery_region, order.delivery_city].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
