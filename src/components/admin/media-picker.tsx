"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Search, X, Check, Image as ImageIcon, Video } from "lucide-react";

interface MediaAsset {
  id: string;
  public_url: string;
  alt_text: string;
  mime_type: string;
  media_type: "image" | "video" | "360_frame";
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (assets: MediaAsset[]) => void;
  mode: "single" | "multi";
  title: string;
  excludeIds?: string[];
}

const typeFilters = ["all", "image", "video"] as const;

export function MediaPicker({
  open,
  onClose,
  onSelect,
  mode,
  title,
  excludeIds = [],
}: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("all");
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map());

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("media_assets")
      .select("id, public_url, alt_text, mime_type, media_type")
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(`alt_text.ilike.%${search.trim()}%,storage_key.ilike.%${search.trim()}%`);
    }
    if (typeFilter !== "all") {
      query = query.eq("media_type", typeFilter);
    }

    const { data } = await query;
    if (data) setAssets(data);
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => {
    if (open) {
      fetchAssets();
      setSelected(new Map());
      setSearch("");
      setTypeFilter("all");
    }
  }, [open, fetchAssets]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function toggleAsset(asset: MediaAsset) {
    if (mode === "single") {
      setSelected(new Map([[asset.id, asset]]));
    } else {
      setSelected((prev) => {
        const next = new Map(prev);
        if (next.has(asset.id)) {
          next.delete(asset.id);
        } else {
          next.set(asset.id, asset);
        }
        return next;
      });
    }
  }

  function handleConfirm() {
    onSelect(Array.from(selected.values()));
    onClose();
  }

  if (!open) return null;

  const available = assets.filter((a) => !excludeIds.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-overlay" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or alt text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex gap-1">
            {typeFilters.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${
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

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading media...
            </div>
          ) : available.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No media assets found.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {available.map((asset) => {
                const isSelected = selected.has(asset.id);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggleAsset(asset)}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-accent ring-1 ring-accent"
                        : "border-border hover:border-accent/50"
                    }`}
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
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                      <p className="truncate text-[10px] font-medium text-white">
                        {asset.alt_text || "Untitled"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} selected`
              : `${available.length} available`}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={selected.size === 0}
              onClick={handleConfirm}
            >
              {mode === "single" ? "Select" : `Add ${selected.size > 0 ? `(${selected.size})` : ""}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
