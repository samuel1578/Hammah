"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import {
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  GripVertical,
  Video,
  Trash2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductVariant {
  id: string;
  size_label: string;
  size_value: string;
  available: boolean;
  sort_order: number;
}

interface MediaAsset {
  id: string;
  public_url: string;
  alt_text: string;
  mime_type: string;
}

interface ProductMedia {
  id: string;
  media_asset_id: string;
  role: "primary" | "hover" | "gallery" | "detail";
  sort_order: number;
  media_assets: MediaAsset | MediaAsset[] | null;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface ProductCollection {
  collection_id: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  pricing_mode: "PRICE_ON_REQUEST" | "FIXED";
  price_amount: number | null;
  availability: "AVAILABLE" | "COMING_SOON" | "SOLD_OUT";
  status: "draft" | "published" | "archived";
  video_url: string | null;
  sort_order: number;
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const statusOptions = ["draft", "published", "archived"] as const;
const mediaRoles = ["primary", "hover", "gallery", "detail"] as const;

const statusStyles: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
  published: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  archived: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600",
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [productMedia, setProductMedia] = useState<ProductMedia[]>([]);
  const [allMedia, setAllMedia] = useState<MediaAsset[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [productCollections, setProductCollections] = useState<string[]>([]);
  const [allSizeGuides, setAllSizeGuides] = useState<{ id: string; name: string }[]>([]);
  const [sizeGuideId, setSizeGuideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricingMode, setPricingMode] = useState<"PRICE_ON_REQUEST" | "FIXED">("PRICE_ON_REQUEST");
  const [priceAmount, setPriceAmount] = useState("");
  const [availability, setAvailability] = useState<"AVAILABLE" | "COMING_SOON" | "SOLD_OUT">("COMING_SOON");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [videoUrl, setVideoUrl] = useState("");

  const [newVariantLabel, setNewVariantLabel] = useState("");
  const [newVariantValue, setNewVariantValue] = useState("");
  const [addingVariant, setAddingVariant] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"single" | "multi">("single");
  const [pickerRole, setPickerRole] = useState<string>("");
  const [pickerTitle, setPickerTitle] = useState("");

  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [videoMediaId, setVideoMediaId] = useState<string | null>(null);
  const [videoMediaUrl, setVideoMediaUrl] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    const res = await fetch(`/api/admin/products/${productId}`);
    if (!res.ok) {
      setError("Failed to load product.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProduct(data);
    setName(data.name);
    setSlug(data.slug);
    setCategoryId(data.category_id);
    setPricingMode(data.pricing_mode);
    setPriceAmount(data.price_amount?.toString() ?? "");
    setAvailability(data.availability);
    setStatus(data.status);
    setDescription(data.description ?? "");
    setVideoUrl(data.video_url ?? "");
    setVideoMediaId(data.video_media_id ?? null);
    // Derive video preview URL: prefer the joined video_asset, fall back to legacy video_url
    const videoAsset = Array.isArray(data.video_asset) ? data.video_asset[0] : data.video_asset;
    if (videoAsset?.public_url) {
      setVideoMediaUrl(videoAsset.public_url);
    } else if (data.video_url) {
      setVideoMediaUrl(data.video_url);
    } else {
      setVideoMediaUrl(null);
    }
    setSizeGuideId(data.size_guide_id ?? null);
  }, [productId]);

  const fetchCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("id, name").order("name");
    if (data) setCategories(data);
  }, []);

  const fetchVariants = useCallback(async () => {
    const res = await fetch(`/api/admin/products/${productId}/variants`);
    if (res.ok) {
      const data = await res.json();
      setVariants(data);
    }
  }, [productId]);

  const fetchMedia = useCallback(async () => {
    const supabase = createClient();
    const { data: pm } = await supabase
      .from("product_media")
      .select("id, media_asset_id, role, sort_order, media_assets(id, public_url, alt_text, mime_type)")
      .eq("product_id", productId)
      .order("sort_order");
    if (pm) setProductMedia(pm as unknown as ProductMedia[]);

    const { data: ma } = await supabase
      .from("media_assets")
      .select("id, public_url, alt_text, mime_type")
      .order("created_at", { ascending: false });
    if (ma) setAllMedia(ma);
  }, [productId]);

  const fetchCollections = useCallback(async () => {
    const supabase = createClient();
    const { data: collections } = await supabase
      .from("collections")
      .select("id, name, slug")
      .order("name");
    if (collections) setAllCollections(collections);

    const { data: cp } = await supabase
      .from("collection_products")
      .select("collection_id")
      .eq("product_id", productId);
    if (cp) setProductCollections(cp.map((r: ProductCollection) => r.collection_id));
  }, [productId]);

  const fetchSizeGuides = useCallback(async () => {
    const res = await fetch("/api/admin/size-guides");
    if (res.ok) {
      const data = await res.json();
      setAllSizeGuides(data.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })));
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchProduct(),
      fetchCategories(),
      fetchVariants(),
      fetchMedia(),
      fetchCollections(),
      fetchSizeGuides(),
    ]).then(() => setLoading(false));
  }, [fetchProduct, fetchCategories, fetchVariants, fetchMedia, fetchCollections, fetchSizeGuides]);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(toSlug(name));
    }
  }, [name, slugEdited]);

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(toSlug(value));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        category_id: categoryId,
        pricing_mode: pricingMode,
        price_amount: pricingMode === "FIXED" ? parseInt(priceAmount, 10) || null : null,
        availability,
        status,
        video_url: videoUrl.trim() || null,
        video_media_id: videoMediaId || null,
        size_guide_id: sizeGuideId || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update product.");
      setSaving(false);
      return;
    }

    await fetchProduct();
    setSuccess("Product saved.");
    setSaving(false);
  }

  async function handleStatusChange(newStatus: typeof status) {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      setSuccess("Status updated.");
    }
  }

  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!newVariantLabel.trim() || !newVariantValue.trim()) return;

    setAddingVariant(true);
    const res = await fetch(`/api/admin/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        size_label: newVariantLabel.trim(),
        size_value: newVariantValue.trim(),
      }),
    });

    if (res.ok) {
      setNewVariantLabel("");
      setNewVariantValue("");
      await fetchVariants();
    }
    setAddingVariant(false);
  }

  async function handleDeleteVariant(variantId: string) {
    if (!confirm("Delete this variant?")) return;
    await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
      method: "DELETE",
    });
    await fetchVariants();
  }

  async function handleToggleCollection(collectionId: string) {
    const supabase = createClient();
    const isMember = productCollections.includes(collectionId);

    if (isMember) {
      await supabase
        .from("collection_products")
        .delete()
        .eq("product_id", productId)
        .eq("collection_id", collectionId);
      setProductCollections((prev) => prev.filter((id) => id !== collectionId));
    } else {
      await supabase.from("collection_products").insert({
        product_id: productId,
        collection_id: collectionId,
        sort_order: 0,
      });
      setProductCollections((prev) => [...prev, collectionId]);
    }
  }

  async function handleAssignMedia(mediaAssetId: string, role: string) {
    const supabase = createClient();
    await supabase.from("product_media").upsert(
      {
        product_id: productId,
        media_asset_id: mediaAssetId,
        role,
        sort_order: productMedia.filter((m) => m.role === role).length,
      },
      { onConflict: "product_id,media_asset_id" }
    );
    await fetchMedia();
  }

  async function handleRemoveMedia(mediaId: string) {
    const supabase = createClient();
    await supabase.from("product_media").delete().eq("id", mediaId);
    await fetchMedia();
  }

  function openPicker(role: string) {
    const isSingle = role === "primary" || role === "hover";
    setPickerMode(isSingle ? "single" : "multi");
    setPickerRole(role);
    setPickerTitle(
      isSingle
        ? `Select ${role.charAt(0).toUpperCase() + role.slice(1)} image`
        : `Add ${role.charAt(0).toUpperCase() + role.slice(1)} images`
    );
    setPickerOpen(true);
  }

  async function handlePickerSelect(assets: MediaAsset[]) {
    const supabase = createClient();
    for (const asset of assets) {
      const existingForRole = productMedia.filter((m) => m.role === pickerRole);
      await supabase.from("product_media").upsert(
        {
          product_id: productId,
          media_asset_id: asset.id,
          role: pickerRole,
          sort_order: existingForRole.length,
        },
        { onConflict: "product_id,media_asset_id" }
      );
    }
    await fetchMedia();
  }

  function handleVideoPickerSelect(assets: MediaAsset[]) {
    if (assets.length === 0) return;
    const asset = assets[0];
    setVideoMediaId(asset.id);
    setVideoMediaUrl(asset.public_url);
    setVideoUrl(asset.public_url);
  }

  function handleRemoveVideo() {
    setVideoMediaId(null);
    setVideoMediaUrl(null);
    setVideoUrl("");
  }

  async function handleMoveMedia(mediaId: string, direction: "left" | "right") {
    const supabase = createClient();
    const roleItems = productMedia
      .filter((m) => m.role === pickerRole)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = roleItems.findIndex((m) => m.id === mediaId);
    if (idx === -1) return;

    const swapIdx = direction === "left" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= roleItems.length) return;

    const current = roleItems[idx];
    const swap = roleItems[swapIdx];

    await supabase
      .from("product_media")
      .update({ sort_order: swap.sort_order })
      .eq("id", current.id);
    await supabase
      .from("product_media")
      .update({ sort_order: current.sort_order })
      .eq("id", swap.id);
    await fetchMedia();
  }

  async function handleArchive() {
    if (!confirm("Archive this product? It will be hidden from the storefront.")) return;
    await handleStatusChange("archived");
  }

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading product...
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <div className="py-20 text-center text-sm text-red-600">
          Product not found.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-serif text-2xl italic text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[status]}`}>
            {status}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </h2>
              <div className="space-y-4">
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
                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-foreground">
                    Slug
                  </label>
                  <input
                    id="slug"
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
                    Category
                  </label>
                  <select
                    id="category"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Product Video
                  </label>
                  {videoMediaUrl ? (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border bg-muted">
                          <video
                            src={videoMediaUrl}
                            className="h-full w-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="h-6 w-6 text-white drop-shadow" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {videoMediaUrl.split("/").pop()}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setVideoPickerOpen(true)}
                            >
                              Change video
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveVideo}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVideoPickerOpen(true)}
                      className="flex h-28 w-full items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent hover:bg-surface-elevated"
                    >
                      <div className="text-center">
                        <Video className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Select product video
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          MP4 or WebM from the Media Library
                        </p>
                      </div>
                    </button>
                  )}
                </div>
                <div>
                  <label htmlFor="size_guide_id" className="mb-1.5 block text-sm font-medium text-foreground">
                    Size Guide
                  </label>
                  <select
                    id="size_guide_id"
                    value={sizeGuideId ?? ""}
                    onChange={(e) => setSizeGuideId(e.target.value || null)}
                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">None</option>
                    {allSizeGuides.map((sg) => (
                      <option key={sg.id} value={sg.id}>
                        {sg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Pricing
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPricingMode("PRICE_ON_REQUEST")}
                    className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                      pricingMode === "PRICE_ON_REQUEST"
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    Price on Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("FIXED")}
                    className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                      pricingMode === "FIXED"
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    Fixed Price
                  </button>
                </div>
                {pricingMode === "FIXED" && (
                  <div>
                    <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-foreground">
                      Price (GHS)
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Availability
              </h2>
              <div className="flex gap-3">
                {(["AVAILABLE", "COMING_SOON", "SOLD_OUT"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvailability(a)}
                    className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                      availability === a
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    {a.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </h2>
              <div className="space-y-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`w-full rounded-md border px-4 py-2.5 text-left text-sm font-medium capitalize transition-colors ${
                      status === s
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Collections
              </h2>
              <div className="space-y-2">
                {allCollections.length === 0 && (
                  <p className="text-xs text-muted-foreground">No collections found.</p>
                )}
                {allCollections.map((col) => (
                  <label
                    key={col.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface-elevated"
                  >
                    <input
                      type="checkbox"
                      checked={productCollections.includes(col.id)}
                      onChange={() => handleToggleCollection(col.id)}
                      className="h-4 w-4 rounded border-border accent-accent"
                    />
                    <span className="text-foreground">{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="ghost" size="md" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Variants
        </h2>
        <div className="mb-4 space-y-2">
          {variants.length === 0 && (
            <p className="text-xs text-muted-foreground">No variants yet.</p>
          )}
          {variants.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{v.size_label}</span>
                <span className="text-xs text-muted-foreground">({v.size_value})</span>
                {!v.available && (
                  <span className="text-xs text-red-500">Unavailable</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteVariant(v.id)}
                className="text-xs font-medium text-muted-foreground hover:text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddVariant} className="flex gap-2">
          <input
            type="text"
            placeholder="Label (e.g. 32)"
            value={newVariantLabel}
            onChange={(e) => setNewVariantLabel(e.target.value)}
            className="h-9 w-24 rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            type="text"
            placeholder="Value"
            value={newVariantValue}
            onChange={(e) => setNewVariantValue(e.target.value)}
            className="h-9 w-24 rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button type="submit" variant="secondary" size="sm" disabled={addingVariant}>
            Add
          </Button>
        </form>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Media
        </h2>

        <div className="space-y-6">
          {/* PRIMARY */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Primary / Cover
              </h3>
              <span className="text-[10px] text-muted-foreground">Exactly 1</span>
            </div>
            {productMedia.filter((m) => m.role === "primary").length > 0 ? (
              <div className="flex items-start gap-4">
                {productMedia
                  .filter((m) => m.role === "primary")
                  .map((m) => {
                    const asset = Array.isArray(m.media_assets)
                      ? m.media_assets[0]
                      : m.media_assets;
                    return (
                      <div key={m.id} className="relative">
                        <div className="h-32 w-32 overflow-hidden rounded-lg border border-border">
                          {asset?.public_url && (
                            <img
                              src={asset.public_url}
                              alt={asset.alt_text}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(m.id)}
                          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openPicker("primary")}
                  >
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                    Change primary image
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openPicker("primary")}
                className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent hover:bg-surface-elevated"
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Select primary image
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* HOVER */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hover
              </h3>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            {productMedia.filter((m) => m.role === "hover").length > 0 ? (
              <div className="flex items-start gap-4">
                {productMedia
                  .filter((m) => m.role === "hover")
                  .map((m) => {
                    const asset = Array.isArray(m.media_assets)
                      ? m.media_assets[0]
                      : m.media_assets;
                    return (
                      <div key={m.id} className="relative">
                        <div className="h-32 w-32 overflow-hidden rounded-lg border border-border">
                          {asset?.public_url && (
                            <img
                              src={asset.public_url}
                              alt={asset.alt_text}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(m.id)}
                          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openPicker("hover")}
                  >
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                    Change hover image
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openPicker("hover")}
                className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent hover:bg-surface-elevated"
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Select hover image
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* GALLERY */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gallery
              </h3>
              <span className="text-[10px] text-muted-foreground">Multiple</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {productMedia
                .filter((m) => m.role === "gallery")
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((m, idx, arr) => {
                  const asset = Array.isArray(m.media_assets)
                    ? m.media_assets[0]
                    : m.media_assets;
                  return (
                    <div key={m.id} className="group relative">
                      <div className="h-24 w-24 overflow-hidden rounded-lg border border-border">
                        {asset?.public_url && (
                          <img
                            src={asset.public_url}
                            alt={asset.alt_text}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(m.id)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveMedia(m.id, "left")}
                          className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white disabled:opacity-30"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() => handleMoveMedia(m.id, "right")}
                          className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white disabled:opacity-30"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              <button
                type="button"
                onClick={() => openPicker("gallery")}
                className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent hover:bg-surface-elevated"
              >
                <div className="text-center">
                  <span className="text-lg font-bold text-muted-foreground">+</span>
                  <p className="text-[10px] text-muted-foreground">Add</p>
                </div>
              </button>
            </div>
          </div>

          {/* DETAIL */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detail
              </h3>
              <span className="text-[10px] text-muted-foreground">Multiple</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {productMedia
                .filter((m) => m.role === "detail")
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((m, idx, arr) => {
                  const asset = Array.isArray(m.media_assets)
                    ? m.media_assets[0]
                    : m.media_assets;
                  return (
                    <div key={m.id} className="group relative">
                      <div className="h-24 w-24 overflow-hidden rounded-lg border border-border">
                        {asset?.public_url && (
                          <img
                            src={asset.public_url}
                            alt={asset.alt_text}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(m.id)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveMedia(m.id, "left")}
                          className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white disabled:opacity-30"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === arr.length - 1}
                          onClick={() => handleMoveMedia(m.id, "right")}
                          className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white disabled:opacity-30"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              <button
                type="button"
                onClick={() => openPicker("detail")}
                className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent hover:bg-surface-elevated"
              >
                <div className="text-center">
                  <span className="text-lg font-bold text-muted-foreground">+</span>
                  <p className="text-[10px] text-muted-foreground">Add</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        mode={pickerMode}
        title={pickerTitle}
        excludeIds={productMedia.map((m) => m.media_asset_id)}
      />

      <MediaPicker
        open={videoPickerOpen}
        onClose={() => setVideoPickerOpen(false)}
        onSelect={handleVideoPickerSelect}
        mode="single"
        title="Select product video"
        forceMediaType="video"
      />

      <div className="mt-10 rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/50">
        <h2 className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          Archiving a product will hide it from the storefront. You can unarchive it later.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleArchive}
          disabled={status === "archived"}
          className="border border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900"
        >
          Archive Product
        </Button>
      </div>
    </Container>
  );
}
