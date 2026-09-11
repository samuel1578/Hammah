"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

const SLOT_LABELS: Record<string, string> = {
  home_midpage: "Home Midpage",
  home_closing: "Home Closing",
  shop_banner: "Shop Banner",
  shop_footer: "Shop Footer",
  collection_hero: "Collection Hero",
  collection_footer: "Collection Footer",
};

export default function AdminCTAsPage() {
  const router = useRouter();
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchCtas = useCallback(async () => {
    const res = await fetch("/api/admin/ctas");
    if (res.ok) {
      const data = await res.json();
      setCtas(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCtas();
  }, [fetchCtas]);

  async function handleToggle(id: string, current: boolean) {
    setToggling(id);
    const res = await fetch(`/api/admin/ctas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !current }),
    });
    if (res.ok) {
      setCtas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, enabled: !current } : c))
      );
    }
    setToggling(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this CTA?")) return;
    const res = await fetch(`/api/admin/ctas/${id}`, { method: "DELETE" });
    if (res.ok) setCtas((prev) => prev.filter((c) => c.id !== id));
  }

  const grouped = ctas.reduce<Record<string, CTA[]>>((acc, cta) => {
    if (!acc[cta.slot]) acc[cta.slot] = [];
    acc[cta.slot].push(cta);
    return acc;
  }, {});

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-serif text-2xl italic text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            CTA Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ctas.length} total placements
          </p>
        </div>
        <Link href="/admin/ctas/new">
          <Button variant="primary" size="md">
            New CTA
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading CTAs...
        </div>
      ) : ctas.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No CTAs yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([slot, items]) => (
            <div key={slot}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {SLOT_LABELS[slot] ?? slot}
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated">
                      <th className="px-4 py-3 font-semibold text-foreground">Label</th>
                      <th className="hidden px-4 py-3 font-semibold text-foreground md:table-cell">Href</th>
                      <th className="px-4 py-3 font-semibold text-foreground">Variant</th>
                      <th className="px-4 py-3 font-semibold text-foreground">Enabled</th>
                      <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((cta) => (
                      <tr
                        key={cta.id}
                        className="border-b border-border last:border-0 hover:bg-surface-elevated/50"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{cta.label}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            #{cta.sort_order}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {cta.href}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-xs font-medium capitalize text-foreground">
                            {cta.variant}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={toggling === cta.id}
                            onClick={() => handleToggle(cta.id, cta.enabled)}
                            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: cta.enabled
                                ? "hsl(var(--accent))"
                                : "hsl(var(--border))",
                            }}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                                cta.enabled ? "translate-x-4.5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/ctas/${cta.id}`)}
                              className="text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cta.id)}
                              className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
