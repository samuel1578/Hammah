"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricingMode, setPricingMode] = useState<"PRICE_ON_REQUEST" | "FIXED">("PRICE_ON_REQUEST");
  const [priceAmount, setPriceAmount] = useState("");
  const [availability, setAvailability] = useState<"AVAILABLE" | "COMING_SOON" | "SOLD_OUT">("COMING_SOON");

  const fetchCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");
    if (data) setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(toSlug(name));
    }
  }, [name, slugEdited]);

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(toSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

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
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        category_id: categoryId,
        pricing_mode: pricingMode,
        price_amount: pricingMode === "FIXED" ? parseInt(priceAmount, 10) || null : null,
        availability,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create product.");
      setSaving(false);
      return;
    }

    router.push(`/admin/products/${data.id}`);
  }

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8">
        <h1
          className="font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          New Product
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
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
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Product name"
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
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="product-slug"
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
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Optional description"
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
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
            Pricing Mode
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPricingMode("PRICE_ON_REQUEST")}
              className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                pricingMode === "PRICE_ON_REQUEST"
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
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
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
              }`}
            >
              Fixed Price
            </button>
          </div>
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
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="0"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Availability
          </label>
          <div className="flex gap-3">
            {(["AVAILABLE", "COMING_SOON", "SOLD_OUT"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvailability(a)}
                className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                  availability === a
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
                }`}
              >
                {a.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Creating..." : "Create Product"}
          </Button>
          <Button type="button" variant="ghost" size="md" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
