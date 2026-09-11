"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

interface FeaturedProduct {
  id: string;
  product_id: string;
  sort_order: number;
  is_active: boolean;
  products: {
    id: string;
    name: string;
    slug: string;
    price_amount: number | null;
    availability: string;
  } | null;
}

interface CollectionFeature {
  id: string;
  collection_id: string | null;
  heading: string;
  statement: string;
  is_active: boolean;
  collections: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price_amount: number | null;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export default function AdminHomepagePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [collectionFeature, setCollectionFeature] = useState<CollectionFeature | null>(null);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  const [cfCollectionId, setCfCollectionId] = useState("");
  const [cfHeading, setCfHeading] = useState("");
  const [cfStatement, setCfStatement] = useState("");
  const [cfActive, setCfActive] = useState(false);
  const [savingCf, setSavingCf] = useState(false);

  const fetchFeaturedProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_featured_products")
      .select("id, product_id, sort_order, is_active, products(id, name, slug, price_amount, availability)")
      .order("sort_order");
    if (data) setFeaturedProducts(data as unknown as FeaturedProduct[]);
  }, []);

  const fetchCollectionFeature = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("homepage_collection_feature")
      .select("id, collection_id, heading, statement, is_active, collections(id, name, slug)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      const cf = data as unknown as CollectionFeature;
      setCollectionFeature(cf);
      setCfCollectionId(cf.collection_id ?? "");
      setCfHeading(cf.heading ?? "");
      setCfStatement(cf.statement ?? "");
      setCfActive(cf.is_active);
    }
  }, []);

  const fetchAllProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price_amount, availability")
      .eq("status", "published")
      .order("name");
    if (data) setAllProducts(data);
  }, []);

  const fetchAllCollections = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("collections")
      .select("id, name, slug")
      .order("name");
    if (data) setAllCollections(data);
  }, []);

  useEffect(() => {
    Promise.all([
      fetchFeaturedProducts(),
      fetchCollectionFeature(),
      fetchAllProducts(),
      fetchAllCollections(),
    ]).then(() => setLoading(false));
  }, [fetchFeaturedProducts, fetchCollectionFeature, fetchAllProducts, fetchAllCollections]);

  async function handleAddProduct() {
    if (!selectedProductId) return;
    setAddingProduct(true);
    const maxOrder = featuredProducts.reduce((max, fp) => Math.max(max, fp.sort_order), -1);
    const res = await fetch("/api/admin/homepage/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: selectedProductId,
        sort_order: maxOrder + 1,
      }),
    });
    if (res.ok) {
      setSelectedProductId("");
      await fetchFeaturedProducts();
    }
    setAddingProduct(false);
  }

  async function handleRemoveProduct(id: string) {
    const res = await fetch("/api/admin/homepage/featured", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) await fetchFeaturedProducts();
  }

  async function handleToggleProduct(id: string, current: boolean) {
    const supabase = createClient();
    await supabase
      .from("homepage_featured_products")
      .update({ is_active: !current })
      .eq("id", id);
    await fetchFeaturedProducts();
  }

  async function handleMoveProduct(index: number, direction: "up" | "down") {
    const sorted = [...featuredProducts].sort((a, b) => a.sort_order - b.sort_order);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const updates = [
      { id: sorted[index].id, sort_order: sorted[targetIndex].sort_order },
      { id: sorted[targetIndex].id, sort_order: sorted[index].sort_order },
    ];

    const res = await fetch("/api/admin/homepage/featured", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) await fetchFeaturedProducts();
  }

  async function handleSaveCollectionFeature() {
    setSavingCf(true);
    const res = await fetch("/api/admin/homepage/collection-feature", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_id: cfCollectionId || null,
        heading: cfHeading,
        statement: cfStatement,
        is_active: cfActive,
      }),
    });
    if (res.ok) await fetchCollectionFeature();
    setSavingCf(false);
  }

  const sortedFeatured = [...featuredProducts].sort((a, b) => a.sort_order - b.sort_order);
  const availableProducts = allProducts.filter(
    (p) => !featuredProducts.some((fp) => fp.product_id === p.id)
  );

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading homepage settings...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8">
        <h1
          className="font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Homepage Merchandising
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage featured products and collection spotlight on the homepage.
        </p>
      </div>

      <div className="space-y-10">
        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Featured Products
            </h2>
          </div>

          <div className="mb-4 flex gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select a product to add...</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedProductId || addingProduct}
              onClick={handleAddProduct}
            >
              {addingProduct ? "Adding..." : "Add"}
            </Button>
          </div>

          {sortedFeatured.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No featured products yet.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedFeatured.map((fp, index) => (
                <div
                  key={fp.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3"
                >
                  <span className="w-6 text-center text-xs text-muted-foreground">
                    {fp.sort_order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {fp.products?.name ?? "Unknown product"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fp.products?.slug}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      fp.is_active
                        ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                        : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600"
                    }`}
                  >
                    {fp.is_active ? "Active" : "Inactive"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveProduct(index, "up")}
                      className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={index === sortedFeatured.length - 1}
                      onClick={() => handleMoveProduct(index, "down")}
                      className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleProduct(fp.id, fp.is_active)}
                      className="rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    >
                      {fp.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(fp.id)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Collection Feature
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Featured Collection
              </label>
              <select
                value={cfCollectionId}
                onChange={(e) => setCfCollectionId(e.target.value)}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">None</option>
                {allCollections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Heading
              </label>
              <input
                type="text"
                value={cfHeading}
                onChange={(e) => setCfHeading(e.target.value)}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. The Essentials"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Statement
              </label>
              <textarea
                rows={3}
                value={cfStatement}
                onChange={(e) => setCfStatement(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="A short description of this collection."
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={cfActive}
                  onChange={(e) => setCfActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700" />
              </label>
              <span className="text-sm text-foreground">
                {cfActive ? "Active on homepage" : "Hidden from homepage"}
              </span>
            </div>

            <div>
              <Button
                variant="primary"
                size="md"
                disabled={savingCf}
                onClick={handleSaveCollectionFeature}
              >
                {savingCf ? "Saving..." : "Save Collection Feature"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}
