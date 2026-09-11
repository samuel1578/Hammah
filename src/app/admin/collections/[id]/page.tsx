"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  X,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hero_image_url: string | null;
  hero_image_mobile_url: string | null;
  editorial_heading: string | null;
  editorial_statement: string | null;
  editorial_body: string | null;
  sort_order: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface CollectionProduct {
  product_id: string;
  sort_order: number;
  products: Product;
}

type Tab = "details" | "products" | "media";

export default function AdminCollectionEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("details");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editorialHeading, setEditorialHeading] = useState("");
  const [editorialStatement, setEditorialStatement] = useState("");
  const [editorialBody, setEditorialBody] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState("draft");

  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageMobileUrl, setHeroImageMobileUrl] = useState("");

  const [collectionProducts, setCollectionProducts] = useState<CollectionProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchCollection = useCallback(async () => {
    const res = await fetch(`/api/admin/collections/${id}`);
    if (!res.ok) {
      setError("Collection not found");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setCollection(data);
    setName(data.name || "");
    setSlug(data.slug || "");
    setDescription(data.description || "");
    setEditorialHeading(data.editorial_heading || "");
    setEditorialStatement(data.editorial_statement || "");
    setEditorialBody(data.editorial_body || "");
    setSortOrder(data.sort_order ?? 0);
    setStatus(data.status || "draft");
    setHeroImageUrl(data.hero_image_url || "");
    setHeroImageMobileUrl(data.hero_image_mobile_url || "");
    setCollectionProducts(data.products || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchAllProducts();
    }
  }, [activeTab]);

  async function fetchAllProducts() {
    setLoadingProducts(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, status")
      .neq("status", "archived")
      .order("name", { ascending: true });
    setAllProducts(data ?? []);
    setLoadingProducts(false);
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/admin/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description: description || null,
        editorial_heading: editorialHeading || null,
        editorial_statement: editorialStatement || null,
        editorial_body: editorialBody || null,
        sort_order: sortOrder,
        status,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  async function handleSaveMedia() {
    setError("");
    setSaving(true);

    const res = await fetch(`/api/admin/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hero_image_url: heroImageUrl || null,
        hero_image_mobile_url: heroImageMobileUrl || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save media");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  async function handleAddProduct(productId: string) {
    const res = await fetch(`/api/admin/collections/${id}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });

    if (res.ok) {
      const newEntry = await res.json();
      setCollectionProducts((prev) => [...prev, newEntry]);
    }
  }

  async function handleRemoveProduct(productId: string) {
    const res = await fetch(
      `/api/admin/collections/${id}/products?product_id=${productId}&collection_id=${id}`,
      { method: "DELETE" },
    );

    if (res.ok) {
      setCollectionProducts((prev) =>
        prev.filter((p) => p.product_id !== productId),
      );
    }
  }

  async function handleMoveProductUp(index: number) {
    if (index === 0) return;
    const current = collectionProducts[index];
    const above = collectionProducts[index - 1];

    const supabase = createClient();
    await supabase
      .from("collection_products")
      .update({ sort_order: above.sort_order })
      .eq("collection_id", id)
      .eq("product_id", current.product_id);
    await supabase
      .from("collection_products")
      .update({ sort_order: current.sort_order })
      .eq("collection_id", id)
      .eq("product_id", above.product_id);

    setCollectionProducts((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      const tmp = next[index - 1].sort_order;
      next[index - 1].sort_order = next[index].sort_order;
      next[index].sort_order = tmp;
      return next;
    });
  }

  async function handleMoveProductDown(index: number) {
    if (index === collectionProducts.length - 1) return;
    const current = collectionProducts[index];
    const below = collectionProducts[index + 1];

    const supabase = createClient();
    await supabase
      .from("collection_products")
      .update({ sort_order: below.sort_order })
      .eq("collection_id", id)
      .eq("product_id", current.product_id);
    await supabase
      .from("collection_products")
      .update({ sort_order: current.sort_order })
      .eq("collection_id", id)
      .eq("product_id", below.product_id);

    setCollectionProducts((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      const tmp = next[index].sort_order;
      next[index].sort_order = next[index + 1].sort_order;
      next[index + 1].sort_order = tmp;
      return next;
    });
  }

  const assignedProductIds = new Set(collectionProducts.map((p) => p.product_id));
  const filteredAvailable = allProducts.filter(
    (p) =>
      !assignedProductIds.has(p.id) &&
      (productSearch === "" ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(productSearch.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error === "Collection not found") {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link
          href="/admin/collections"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to collections
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "products", label: `Products (${collectionProducts.length})` },
    { key: "media", label: "Media" },
  ];

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/collections"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Collections
        </Link>
        <h1
          className="mt-3 font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Edit Collection
        </h1>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <form onSubmit={handleSaveDetails} className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (!slug) setSlug(generateSlug(name));
                }}
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. Collection 002"
              />
            </div>

            <div>
              <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-foreground">
                Slug
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">/</span>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="collection-002"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                placeholder="Internal description for this collection"
              />
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="mb-4 text-sm font-medium text-foreground">Editorial Content</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editorial_heading" className="mb-1.5 block text-sm font-medium text-foreground">
                    Editorial Heading
                  </label>
                  <input
                    id="editorial_heading"
                    type="text"
                    value={editorialHeading}
                    onChange={(e) => setEditorialHeading(e.target.value)}
                    className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Section heading"
                  />
                </div>

                <div>
                  <label htmlFor="editorial_statement" className="mb-1.5 block text-sm font-medium text-foreground">
                    Editorial Statement
                  </label>
                  <textarea
                    id="editorial_statement"
                    rows={2}
                    value={editorialStatement}
                    onChange={(e) => setEditorialStatement(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    placeholder="Lead editorial statement"
                  />
                </div>

                <div>
                  <label htmlFor="editorial_body" className="mb-1.5 block text-sm font-medium text-foreground">
                    Editorial Body
                  </label>
                  <textarea
                    id="editorial_body"
                    rows={4}
                    value={editorialBody}
                    onChange={(e) => setEditorialBody(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    placeholder="Long-form editorial content"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sort_order" className="mb-1.5 block text-sm font-medium text-foreground">
                  Sort Order
                </label>
                <input
                  id="sort_order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/collections"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-engraved-primary inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-sm font-medium text-foreground">
              Assigned Products
            </h3>

            {collectionProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No products assigned yet
              </p>
            ) : (
              <div className="divide-y divide-border">
                {collectionProducts.map((cp, index) => (
                  <div
                    key={cp.product_id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveProductUp(index)}
                        disabled={index === 0}
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveProductDown(index)}
                        disabled={index === collectionProducts.length - 1}
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {cp.products?.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {cp.products?.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(cp.product_id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-sm font-medium text-foreground">
              Add Products
            </h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {loadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAvailable.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {productSearch ? "No products match your search" : "All products are assigned"}
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {filteredAvailable.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddProduct(product.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                      aria-label="Add"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "media" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
            <div>
              <label htmlFor="hero_image" className="mb-1.5 block text-sm font-medium text-foreground">
                Hero Image URL
              </label>
              <input
                id="hero_image"
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="https://..."
              />
              {heroImageUrl && (
                <div className="mt-3 aspect-video overflow-hidden rounded-md bg-muted">
                  <img
                    src={heroImageUrl}
                    alt="Hero preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="hero_image_mobile" className="mb-1.5 block text-sm font-medium text-foreground">
                Hero Mobile Image URL
              </label>
              <input
                id="hero_image_mobile"
                type="text"
                value={heroImageMobileUrl}
                onChange={(e) => setHeroImageMobileUrl(e.target.value)}
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="https://..."
              />
              {heroImageMobileUrl && (
                <div className="mt-3 aspect-[9/16] max-w-[200px] overflow-hidden rounded-md bg-muted">
                  <img
                    src={heroImageMobileUrl}
                    alt="Hero mobile preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/collections"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSaveMedia}
              disabled={saving}
              className="btn-engraved-primary inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Media
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
