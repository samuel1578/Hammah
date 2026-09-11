"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Archive, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Collection {
  id: string;
  name: string;
  slug: string;
  status: string;
  sort_order: number;
  product_count: number;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("collections")
      .select("id, name, slug, status, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch collections:", error);
      setLoading(false);
      return;
    }

    const collectionsWithCount = await Promise.all(
      (data ?? []).map(async (col) => {
        const { count } = await supabase
          .from("collection_products")
          .select("id", { count: "exact", head: true })
          .eq("collection_id", col.id);
        return { ...col, product_count: count ?? 0 };
      }),
    );

    setCollections(collectionsWithCount);
    setLoading(false);
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this collection?")) return;
    setArchiving(id);
    const res = await fetch(`/api/admin/collections/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
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
            Collections
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated product collections
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="btn-engraved-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-sm text-muted-foreground">No collections yet</p>
          <Link
            href="/admin/collections/new"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            <Plus className="h-4 w-4" />
            Create your first collection
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
                {collections.map((col) => (
                  <tr key={col.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-4 py-3 text-muted-foreground">
                      {col.sort_order}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {col.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      /{col.slug}
                    </td>
                    <td className="px-4 py-3">{statusBadge(col.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {col.product_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/collections/${col.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleArchive(col.id)}
                          disabled={archiving === col.id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                          aria-label="Archive"
                        >
                          {archiving === col.id ? (
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
