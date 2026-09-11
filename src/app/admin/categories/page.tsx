"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  status: string;
  sort_order: number;
  product_count: number;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, status, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch categories:", error);
      setLoading(false);
      return;
    }

    const categoriesWithCount = await Promise.all(
      (data ?? []).map(async (cat) => {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .neq("status", "archived");
        return { ...cat, product_count: count ?? 0 };
      }),
    );

    setCategories(categoriesWithCount);
    setLoading(false);
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const current = categories[index];
    const above = categories[index - 1];

    const supabase = createClient();
    await supabase
      .from("categories")
      .update({ sort_order: above.sort_order })
      .eq("id", current.id);
    await supabase
      .from("categories")
      .update({ sort_order: current.sort_order })
      .eq("id", above.id);

    setCategories((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      const tmp = next[index - 1].sort_order;
      next[index - 1].sort_order = next[index].sort_order;
      next[index].sort_order = tmp;
      return next;
    });
  }

  async function handleMoveDown(index: number) {
    if (index === categories.length - 1) return;
    const current = categories[index];
    const below = categories[index + 1];

    const supabase = createClient();
    await supabase
      .from("categories")
      .update({ sort_order: below.sort_order })
      .eq("id", current.id);
    await supabase
      .from("categories")
      .update({ sort_order: current.sort_order })
      .eq("id", below.id);

    setCategories((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      const tmp = next[index].sort_order;
      next[index].sort_order = next[index + 1].sort_order;
      next[index + 1].sort_order = tmp;
      return next;
    });
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this category?")) return;
    setArchiving(id);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || "Failed to archive");
    }
    setArchiving(null);
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      published:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
      draft:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
      archived:
        "bg-muted text-muted-foreground border-border",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.draft}`}
      >
        {status}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="font-serif text-2xl italic text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product categories
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="btn-engraved-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-sm text-muted-foreground">No categories yet</p>
          <Link
            href="/admin/categories/new"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            <Plus className="h-4 w-4" />
            Create your first category
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sort
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Products
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat, index) => (
                  <tr key={cat.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === categories.length - 1}
                          className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      /{cat.slug}
                    </td>
                    <td className="px-4 py-3">{statusBadge(cat.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cat.product_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/categories/${cat.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleArchive(cat.id)}
                          disabled={archiving === cat.id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                          aria-label="Archive"
                        >
                          {archiving === cat.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
