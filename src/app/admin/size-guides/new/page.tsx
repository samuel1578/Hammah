"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface GuideRow {
  size_label: string;
  measurements: Record<string, string>;
  sort_order: number;
}

export default function NewSizeGuidePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("cm");
  const [isActive, setIsActive] = useState(true);
  const [rows, setRows] = useState<GuideRow[]>([
    { size_label: "", measurements: {}, sort_order: 0 },
  ]);
  const [measurementKeys, setMeasurementKeys] = useState<string[]>(["waist", "hip", "length"]);
  const [newKey, setNewKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addRow() {
    setRows((prev) => [
      ...prev,
      { size_label: "", measurements: {}, sort_order: prev.length },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRowLabel(index: number, label: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, size_label: label } : r)));
  }

  function updateRowMeasurement(index: number, key: string, value: string) {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, measurements: { ...r.measurements, [key]: value } } : r,
      ),
    );
  }

  function addMeasurementKey() {
    const trimmed = newKey.trim().toLowerCase();
    if (trimmed && !measurementKeys.includes(trimmed)) {
      setMeasurementKeys((prev) => [...prev, trimmed]);
      setNewKey("");
    }
  }

  function removeMeasurementKey(key: string) {
    setMeasurementKeys((prev) => prev.filter((k) => k !== key));
    setRows((prev) =>
      prev.map((r) => {
        const m = { ...r.measurements };
        delete m[key];
        return { ...r, measurements: m };
      }),
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const validRows = rows.filter((r) => r.size_label.trim());
    if (validRows.length === 0) {
      setError("Add at least one size row.");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/size-guides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        unit,
        is_active: isActive,
        rows: validRows.map((r, i) => ({
          size_label: r.size_label.trim(),
          sort_order: i,
          measurements: r.measurements,
        })),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create size guide.");
      setSaving(false);
      return;
    }

    router.push("/admin/size-guides");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/size-guides"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif italic text-foreground">New Size Guide</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a reusable measurement guide.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Guide Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="guide-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="guide-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Standard Trouser Guide"
            />
          </div>
          <div>
            <label htmlFor="guide-unit" className="mb-1.5 block text-sm font-medium text-foreground">
              Unit
            </label>
            <select
              id="guide-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="cm">cm</option>
              <option value="in">inches</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="guide-desc" className="mb-1.5 block text-sm font-medium text-foreground">
            Description
          </label>
          <input
            id="guide-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Optional description"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="guide-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          <label htmlFor="guide-active" className="text-sm text-foreground">
            Active (visible to customers)
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Measurement Columns
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {measurementKeys.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {key}
              <button
                type="button"
                onClick={() => removeMeasurementKey(key)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
          <div className="flex gap-1">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMeasurementKey()}
              className="h-8 w-24 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:border-accent focus:outline-none"
              placeholder="Add field"
            />
            <button
              type="button"
              onClick={addMeasurementKey}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border px-2 text-xs text-foreground hover:bg-surface-elevated"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Size Rows
          </h2>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-elevated"
          >
            <Plus className="h-3 w-3" />
            Add Row
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((row, ri) => (
            <div key={ri} className="flex items-start gap-2 rounded-md border border-border bg-background p-3">
              <input
                type="text"
                value={row.size_label}
                onChange={(e) => updateRowLabel(ri, e.target.value)}
                className="h-9 w-20 flex-shrink-0 rounded-md border border-border bg-surface px-2 text-sm text-foreground focus:border-accent focus:outline-none"
                placeholder="Size"
              />
              <div className="flex flex-1 flex-wrap gap-2">
                {measurementKeys.map((key) => (
                  <input
                    key={key}
                    type="text"
                    value={row.measurements[key] ?? ""}
                    onChange={(e) => updateRowMeasurement(ri, key, e.target.value)}
                    className="h-9 w-20 rounded-md border border-border bg-surface px-2 text-sm text-foreground focus:border-accent focus:outline-none"
                    placeholder={key}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => removeRow(ri)}
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/size-guides"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Guide
        </button>
      </div>
    </div>
  );
}
