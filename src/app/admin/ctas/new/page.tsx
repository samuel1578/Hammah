"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const SLOTS = [
  { value: "home_midpage", label: "Home Midpage" },
  { value: "home_closing", label: "Home Closing" },
  { value: "shop_banner", label: "Shop Banner" },
  { value: "shop_footer", label: "Shop Footer" },
  { value: "collection_hero", label: "Collection Hero" },
  { value: "collection_footer", label: "Collection Footer" },
];

const VARIANTS = ["primary", "secondary", "ghost"] as const;

export default function NewCTAPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [slot, setSlot] = useState("");
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [variant, setVariant] = useState<"primary" | "secondary" | "ghost">("primary");
  const [sortOrder, setSortOrder] = useState("0");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!slot) {
      setError("Slot is required.");
      return;
    }
    if (!label.trim()) {
      setError("Label is required.");
      return;
    }
    if (!href.trim()) {
      setError("Href is required.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/ctas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot,
        label: label.trim(),
        href: href.trim(),
        enabled,
        variant,
        sort_order: parseInt(sortOrder, 10) || 0,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create CTA.");
      setSaving(false);
      return;
    }

    router.push("/admin/ctas");
  }

  return (
    <Container>
      <div className="mb-8">
        <h1
          className="font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          New CTA
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="slot" className="mb-1.5 block text-sm font-medium text-foreground">
            Slot
          </label>
          <select
            id="slot"
            required
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">Select slot...</option>
            {SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="label" className="mb-1.5 block text-sm font-medium text-foreground">
            Label
          </label>
          <input
            id="label"
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Button text"
          />
        </div>

        <div>
          <label htmlFor="href" className="mb-1.5 block text-sm font-medium text-foreground">
            Href
          </label>
          <input
            id="href"
            type="text"
            required
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="/collections/new-arrivals"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Variant
          </label>
          <div className="flex gap-3">
            {VARIANTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  variant === v
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface text-muted-foreground hover:bg-surface-elevated"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sort_order" className="mb-1.5 block text-sm font-medium text-foreground">
              Sort Order
            </label>
            <input
              id="sort_order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-accent"
              />
              <span className="text-sm font-medium text-foreground">Enabled</span>
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="starts_at" className="mb-1.5 block text-sm font-medium text-foreground">
              Starts At (optional)
            </label>
            <input
              id="starts_at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="ends_at" className="mb-1.5 block text-sm font-medium text-foreground">
              Ends At (optional)
            </label>
            <input
              id="ends_at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Creating..." : "Create CTA"}
          </Button>
          <Button type="button" variant="ghost" size="md" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
