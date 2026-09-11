import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";

async function getCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  filters?: Record<string, unknown>,
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
  }
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    publishedProducts,
    draftProducts,
    archivedProducts,
    publishedCollections,
    draftCollections,
    mediaAssets,
    featuredProducts,
    activeCtas,
  ] = await Promise.all([
    getCount(supabase, "products", { status: "published" }),
    getCount(supabase, "products", { status: "draft" }),
    getCount(supabase, "products", { status: "archived" }),
    getCount(supabase, "collections", { status: "published" }),
    getCount(supabase, "collections", { status: "draft" }),
    getCount(supabase, "media_assets"),
    getCount(supabase, "homepage_featured_products", { is_active: true }),
    getCount(supabase, "cta_placements", { enabled: true }),
  ]);

  const cards = [
    { label: "Published Products", value: publishedProducts },
    { label: "Draft Products", value: draftProducts },
    { label: "Archived Products", value: archivedProducts },
    { label: "Published Collections", value: publishedCollections },
    { label: "Draft Collections", value: draftCollections },
    { label: "Media Assets", value: mediaAssets },
    { label: "Featured Products", value: featuredProducts },
    { label: "Active CTAs", value: activeCtas },
  ];

  return (
    <Container>
      <div className="mb-8">
        <h1
          className="font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store overview at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p
              className="mt-2 font-serif text-3xl italic text-foreground"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
