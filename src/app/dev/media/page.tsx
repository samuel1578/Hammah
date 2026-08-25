/**
 * INTERNAL DEVELOPMENT TOOL — /dev/media
 *
 * This is a development-only route for inspecting the Collection 001 image pool.
 * It must NOT be publicly promoted or linked from the Hammah website.
 *
 * Shows all 160 recovered Pixieset images in a responsive visual grid.
 * Supports: search by number, copy URL, copy reference, fullscreen preview.
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Search,
} from "lucide-react";
import {
  COLLECTION_001_PIXIESET,
  type PixiesetImage,
} from "@/data/pixieset-collection-001";

export default function MediaContactSheet() {
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState<PixiesetImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [jumpValue, setJumpValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const filtered = search
    ? COLLECTION_001_PIXIESET.filter((img) =>
        img.number.toString().includes(search) ||
        img.label.toLowerCase().includes(search.toLowerCase()),
      )
    : COLLECTION_001_PIXIESET;

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  }, []);

  const jumpToImage = useCallback((num: string) => {
    const n = parseInt(num, 10);
    if (n >= 1 && n <= 160) {
      const el = document.getElementById(`image-${n}`);
      el?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "center" });
      setJumpValue("");
    }
  }, [shouldReduceMotion]);

  const openPreview = useCallback((img: PixiesetImage) => {
    setPreviewImage(img);
    document.body.classList.add("menu-open");
  }, []);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
    document.body.classList.remove("menu-open");
  }, []);

  const navPreview = useCallback(
    (dir: number) => {
      if (!previewImage) return;
      const idx = filtered.findIndex((i) => i.number === previewImage.number);
      const next = (idx + dir + filtered.length) % filtered.length;
      setPreviewImage(filtered[next]);
    },
    [previewImage, filtered],
  );

  useEffect(() => {
    if (!previewImage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowRight") navPreview(1);
      if (e.key === "ArrowLeft") navPreview(-1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [previewImage, closePreview, navPreview]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-serif italic text-xl text-foreground">
                Collection 001 — Media Contact Sheet
              </h1>
              <p className="text-xs text-muted-foreground">
                {COLLECTION_001_PIXIESET.length} images recovered from Pixieset
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search number..."
                  className="h-8 w-32 rounded-md border border-border bg-surface pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent sm:w-40"
                />
              </div>
              {/* Jump */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={160}
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && jumpToImage(jumpValue)}
                  placeholder="#"
                  className="h-8 w-14 rounded-md border border-border bg-surface px-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => jumpToImage(jumpValue)}
                  className="h-8 rounded-md bg-accent px-2 text-xs font-medium text-accent-foreground"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filtered.map((img) => (
            <div
              key={img.number}
              id={`image-${img.number}`}
              className="group relative"
            >
              <button
                type="button"
                onClick={() => openPreview(img)}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-surface"
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 rounded bg-background/80 px-1.5 py-0.5 text-xs font-bold text-foreground backdrop-blur">
                  {String(img.number).padStart(3, "0")}
                </div>
              </button>
              <div className="mt-1.5 flex items-center gap-1">
                <p className="flex-1 truncate text-[10px] text-muted-foreground">
                  {img.label}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(img.url, `url-${img.number}`)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                  title="Copy URL"
                >
                  {copiedId === `url-${img.number}` ? (
                    <Check className="h-3 w-3 text-accent" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `COLLECTION_001_PIXIESET[${img.number - 1}]`,
                      `ref-${img.number}`,
                    )
                  }
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                  title="Copy reference"
                >
                  {copiedId === `ref-${img.number}` ? (
                    <Check className="h-3 w-3 text-accent" />
                  ) : (
                    <span className="text-[8px] font-mono">[]</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur"
            role="dialog"
            aria-modal="true"
            aria-label={`Image ${previewImage.number} preview`}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground hover:bg-surface-elevated"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => navPreview(-1)}
              className="absolute left-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground hover:bg-surface-elevated"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <motion.div
              key={previewImage.number}
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex max-h-[85vh] max-w-[90vw] flex-col items-center"
            >
              <img
                src={previewImage.url}
                alt={previewImage.label}
                className="max-h-[75vh] max-w-[90vw] object-contain"
              />
              <div className="mt-3 flex items-center gap-4">
                <span className="text-sm font-bold text-foreground">
                  IMAGE {String(previewImage.number).padStart(3, "0")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {previewImage.label}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(previewImage.url, "preview-url")}
                  className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedId === "preview-url" ? (
                    <Check className="h-3 w-3 text-accent" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `COLLECTION_001_PIXIESET[${previewImage.number - 1}]`,
                      "preview-ref",
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copiedId === "preview-ref" ? (
                    <Check className="h-3 w-3 text-accent" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Copy reference
                </button>
              </div>
            </motion.div>

            <button
              type="button"
              onClick={() => navPreview(1)}
              className="absolute right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground hover:bg-surface-elevated"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-surface/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              {previewImage.number} / {COLLECTION_001_PIXIESET.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
