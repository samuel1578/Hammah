"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

interface CTA {
  id: string;
  slot: string;
  label: string;
  href: string;
  enabled: boolean;
  variant: string;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const SLOTS = [
  { value: "home_midpage", label: "Home Midpage" },
  { value: "home_closing", label: "Home Closing" },
  { value: "shop_banner", label: "Shop Banner" },
  { value: "shop_footer", label: "Shop Footer" },
  { value: "collection_hero", label: "Collection Hero" },
  { value: "collection_footer", label: "Collection Footer" },
];

const VARIANTS = ["primary", "secondary", "ghost"] as const;

function toLocalDatetime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditCTAPage() {
  const router = useRouter();
  const params = useParams();
  const ctaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [slot, setSlot] = useState("");
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [variant, setVariant] = useState<"primary" | "secondary" | "ghost">("primary");
  const [sortOrder, setSortOrder] = useState("0");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const fetchCta = useCallback(async () => {
    const res = await fetch(`/api/admin/ctas/${ctaId}`);
    if (!res.ok) {
      setError("Failed to load CTA.");
      setLoading(false);
      return;
    }
    const data: CTA = await res.json();
    setSlot(data.slot);
    setLabel(data.label);
    setHref(data.href);
    setEnabled(data.enabled);
    setVariant(data.variant as typeof variant);
    setSortOrder(data.sort_order.toString());
    setStartsAt(toLocalDatetime(data.starts_at));
    setEndsAt(toLocalDatetime(data.ends_at));
    setLoading(false);
  }, [ctaId]);

  useEffect(() => {
    fetchCta();
  }, [fetchCta]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

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
    const res = await fetch(`/api/admin/ctas/${ctaId}`, {
      method: "PUT",
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

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update CTA.");
      setSaving(false);
      return;
    }

    setSuccess("CTA saved.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this CTA? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/ctas/${ctaId}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/ctas");
  }

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading CTA...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1
          className="font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Edit CTA
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="border border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900"
        >
          Delete CTA
        </Button>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
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
        {success && (
          <div className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="ghost" size="md" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
