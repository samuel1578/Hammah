"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function AdminCollectionNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editorialHeading, setEditorialHeading] = useState("");
  const [editorialStatement, setEditorialStatement] = useState("");
  const [editorialBody, setEditorialBody] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState("draft");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/admin/collections", {
      method: "POST",
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
      setError(data.error || "Failed to create collection");
      setSaving(false);
      return;
    }

    const data = await res.json();
    router.push(`/admin/collections/${data.id}`);
  }

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
          New Collection
        </h1>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
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
                  placeholder="Section heading for the collection page"
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
            Create Collection
          </button>
        </div>
      </form>
    </div>
  );
}
