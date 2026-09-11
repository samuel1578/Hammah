"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

type Status = "draft" | "published" | "archived";
type Availability = "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";

interface Product {
  id: string;
  slug: string;
  name: string;
  status: Status;
  availability: Availability;
  pricing_mode: string;
  price_amount: number | null;
  category_id: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const statusStyles: Record<Status, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
  published: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  archived: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600",
};

const statusFilters = ["all", "draft", "published", "archived"] as const;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id, slug, name, status, availability, pricing_mode, price_amount, category_id, created_at")
      .order("created_at", { ascending: false });

    if (data) setProducts(data);
  }, []);

  const fetchCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");

    if (data) setCategories(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).then(() => setLoading(false));
  }, [fetchProducts, fetchCategories]);

  async function handleArchiveUnpublish(product: Product) {
    const newStatus: Status = product.status === "archived" ? "draft" : "archived";
    setUpdating(product.id);
    const supabase = createClient();
    await supabase.from("products").update({ status: newStatus }).eq("id", product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
    );
    setUpdating(null);
  }

  function getCategoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-serif text-2xl italic text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} total
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary" size="md">
            New Product
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:max-w-xs"
        />
        <div className="flex gap-1">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading products...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="hidden px-4 py-3 font-semibold text-foreground md:table-cell">Category</th>
                <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="hidden px-4 py-3 font-semibold text-foreground sm:table-cell">Availability</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 hover:bg-surface-elevated/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {product.slug}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {getCategoryName(product.category_id)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusStyles[product.status]}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground capitalize sm:table-cell">
                    {product.availability.toLowerCase().replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={updating === product.id}
                        onClick={() => handleArchiveUnpublish(product)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        {product.status === "archived" ? "Unpublish" : "Archive"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
