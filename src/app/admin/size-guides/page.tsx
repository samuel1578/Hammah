"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface SizeGuideRow {
  id: string;
  size_label: string;
  sort_order: number;
  measurements: Record<string, string>;
}

interface SizeGuide {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  is_active: boolean;
  created_at: string;
  size_guide_rows: SizeGuideRow[];
}

export default function AdminSizeGuidesPage() {
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  async function fetchGuides() {
    const res = await fetch("/api/admin/size-guides");
    if (res.ok) {
      const data = await res.json();
      setGuides(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/size-guides/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGuides((prev) => prev.filter((g) => g.id !== id));
    }
    setDeleting(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif italic text-foreground">Size Guides</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage measurement guides for product sizing.
          </p>
        </div>
        <Link
          href="/admin/size-guides/new"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" />
          New Guide
        </Link>
      </div>

      {guides.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-sm text-muted-foreground">No size guides yet.</p>
          <Link
            href="/admin/size-guides/new"
            className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-2 hover:text-foreground/80"
          >
            Create your first guide
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-6 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="truncate text-sm font-medium text-foreground">
                    {guide.name}
                  </h3>
                  {!guide.is_active && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {guide.unit} · {guide.size_guide_rows.length} sizes
                  {guide.description ? ` · ${guide.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/size-guides/${guide.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-elevated"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(guide.id, guide.name)}
                  disabled={deleting === guide.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                >
                  {deleting === guide.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
