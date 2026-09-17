import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { SavedPieceCard } from "@/components/account/saved-piece-card";

export const metadata = {
  title: "Saved Pieces | SL by Hammah",
};

export default async function AccountSavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: savedRows } = await supabase
    .from("saved_products")
    .select("id, product_id, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (!savedRows || savedRows.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-2xl font-serif italic text-foreground">
          Nothing saved yet.
        </p>
        <p className="mt-3 max-w-sm mx-auto text-sm text-muted-foreground">
          When a piece catches your eye, save it here and come back when
          you&apos;re ready.
        </p>
        <div className="mt-8">
          <Link
            href="/collections/collection-001"
            className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Explore Collection 001
          </Link>
        </div>
      </div>
    );
  }

  const productIds = savedRows.map((r) => r.product_id);

  const { data: products } = await supabase
    .from("products")
    .select(`
      id, slug, name, availability, status,
      category:categories ( name ),
      product_media (
        sort_order, role,
        media_asset:media_assets ( public_url )
      ),
      product_variants ( size_label, size_value, available, sort_order )
    `)
    .in("id", productIds);

  const productMap = new Map<string, any>();
  if (products) {
    for (const p of products) {
      productMap.set(p.id, p);
    }
  }

  const saved = savedRows
    .filter((r) => productMap.has(r.product_id))
    .map((r) => {
      const p = productMap.get(r.product_id);
      const mediaRows: any[] = p.product_media ?? [];
      const primary =
        mediaRows.find((m: any) => m.role === "primary")?.media_asset
          ?.public_url ?? "";

      return {
        savedId: r.id,
        productId: p.id,
        slug: p.slug,
        name: p.name,
        status: p.status,
        availability: p.availability,
        category: Array.isArray(p.category)
          ? p.category[0]?.name
          : p.category?.name,
        image: primary,
      };
    });

  return (
    <div>
      <p className="mb-6 text-sm text-muted-foreground">
        {saved.length} {saved.length === 1 ? "piece" : "pieces"} saved
      </p>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {saved.map((item) => (
          <SavedPieceCard key={item.savedId} item={item} />
        ))}
      </div>
    </div>
  );
}
