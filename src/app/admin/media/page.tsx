"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/admin/media-upload";
import {
  Image as ImageIcon,
  Video,
  RotateCcw,
  Search,
  Upload,
  X,
  Trash2,
  Pencil,
} from "lucide-react";

type MediaType = "image" | "video" | "360_frame";

interface MediaAsset {
  id: string;
  storage_key: string;
  public_url: string;
  media_type: MediaType;
  mime_type: string;
  file_size_bytes: number | null;
  alt_text: string;
  caption: string | null;
  created_at: string;
}

const PAGE_SIZE = 24;

const typeFilters = ["all", "image", "video"] as const;

const typeBadgeStyles: Record<MediaType, string> = {
  image:
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  video:
    "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700",
  "360_frame":
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
};

const typeIcons: Record<MediaType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  "360_frame": RotateCcw,
};

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileName(storageKey: string): string {
  const parts = storageKey.split("/");
  const last = parts[parts.length - 1];
  return last.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, "");
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("all");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAssets(reset = false) {
    const newOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const supabase = createClient();
    let query = supabase
      .from("media_assets")
      .select("id, storage_key, public_url, media_type, mime_type, file_size_bytes, alt_text, caption, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(newOffset, newOffset + PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.or(`alt_text.ilike.%${search.trim()}%,storage_key.ilike.%${search.trim()}%`);
    }
    if (typeFilter !== "all") {
      query = query.eq("media_type", typeFilter);
    }

    const { data, count } = await query;
    if (data) {
      if (reset) {
        setAssets(data);
        setOffset(data.length);
      } else {
        setAssets((prev) => [...prev, ...data]);
        setOffset((prev) => prev + data.length);
      }
      setHasMore(count != null && newOffset + data.length < count);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    fetchAssets(true);
  }, [search, typeFilter]);

  function handleUploadComplete() {
    setShowUpload(false);
    setOffset(0);
    setHasMore(true);
    fetchAssets(true);
  }

  function handleSelectAsset(asset: MediaAsset) {
    setSelectedAsset(asset);
    setEditAltText(asset.alt_text);
    setEditCaption(asset.caption ?? "");
    setError(null);
  }

  async function handleSaveAsset() {
    if (!selectedAsset) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/media/${selectedAsset.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt_text: editAltText, caption: editCaption || null }),
    });

    if (res.ok) {
      const updated = await res.json();
      setAssets((prev) =>
        prev.map((a) =>
          a.id === updated.id
            ? { ...a, alt_text: updated.alt_text, caption: updated.caption }
            : a,
        ),
      );
      setSelectedAsset((prev) =>
        prev
          ? { ...prev, alt_text: updated.alt_text, caption: updated.caption }
          : prev,
      );
    } else {
      const body = await res.json();
      setError(body.error ?? "Failed to save.");
    }

    setSaving(false);
  }

  async function handleDeleteAsset() {
    if (!selectedAsset) return;
    setDeleting(true);
    setError(null);

    const refRes = await fetch(`/api/admin/media/${selectedAsset.id}/references`);
    const refs = await refRes.json();
    const totalCount = (refs.references ?? []).length;

    if (totalCount > 0) {
      setError(`Cannot delete — referenced by ${totalCount} item(s).`);
      setDeleting(false);
      return;
    }

    const res = await fetch(`/api/admin/media/${selectedAsset.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));
      setSelectedAsset(null);
    } else {
      const body = await res.json();
      setError(body.error ?? "Failed to delete.");
    }

    setDeleting(false);
  }

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-serif text-2xl italic text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Media Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {assets.length} assets loaded
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowUpload(!showUpload)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {showUpload && (
        <div className="mb-8">
          <MediaUpload onComplete={handleUploadComplete} />
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by alt text or file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex gap-1">
          {typeFilters.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                typeFilter === t
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading media...
        </div>
      ) : assets.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No media assets found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {assets.map((asset) => {
              const Icon = typeIcons[asset.media_type];
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleSelectAsset(asset)}
                  className="group relative overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent"
                >
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    {asset.media_type === "image" ? (
                      <img
                        src={asset.public_url}
                        alt={asset.alt_text}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${typeBadgeStyles[asset.media_type]}`}
                    >
                      <Icon className="h-3 w-3" />
                      {asset.media_type === "360_frame" ? "360" : asset.media_type}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-foreground">
                      {getFileName(asset.storage_key)}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {asset.alt_text || "No alt text"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                size="md"
                disabled={loadingMore}
                onClick={() => fetchAssets(false)}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}

      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-overlay"
            onClick={() => setSelectedAsset(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Asset Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {selectedAsset.media_type === "image" ? (
                <img
                  src={selectedAsset.public_url}
                  alt={selectedAsset.alt_text}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {(() => {
                    const Icon = typeIcons[selectedAsset.media_type];
                    return <Icon className="h-12 w-12 text-muted-foreground" />;
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  File Name
                </label>
                <p className="text-sm text-foreground">
                  {getFileName(selectedAsset.storage_key)}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Type
                </label>
                <p className="text-sm capitalize text-foreground">
                  {selectedAsset.media_type === "360_frame"
                    ? "360"
                    : selectedAsset.media_type}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Size
                </label>
                <p className="text-sm text-foreground">
                  {formatBytes(selectedAsset.file_size_bytes)}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Caption
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Uploaded
                </label>
                <p className="text-sm text-foreground">
                  {new Date(selectedAsset.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={handleDeleteAsset}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAsset(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={saving}
                  onClick={handleSaveAsset}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
