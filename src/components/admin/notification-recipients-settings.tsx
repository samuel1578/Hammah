"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface NotificationRecipient {
  id: string;
  email: string;
  label: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function NotificationRecipientsSettings({
  initialRecipients,
}: {
  initialRecipients: NotificationRecipient[];
}) {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>(
    initialRecipients,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add form
  const [newEmail, setNewEmail] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newEnabled, setNewEnabled] = useState(true);
  const [adding, setAdding] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function flash(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function refreshRecipients() {
    const res = await fetch("/api/admin/settings/notification-recipients");
    if (res.ok) {
      setRecipients((await res.json()) as NotificationRecipient[]);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newEmail.trim()) {
      setError("Email is required.");
      return;
    }
    setAdding(true);
    const res = await fetch("/api/admin/settings/notification-recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newEmail,
        label: newLabel,
        enabled: newEnabled,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) {
      setError(data.error || "Failed to add recipient.");
      return;
    }
    setNewEmail("");
    setNewLabel("");
    setNewEnabled(true);
    flash("Recipient added.");
    await refreshRecipients();
  }

  async function handleToggle(recipient: NotificationRecipient) {
    setError("");
    setTogglingId(recipient.id);
    const res = await fetch(
      `/api/admin/settings/notification-recipients/${recipient.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !recipient.enabled }),
      },
    );
    const data = await res.json().catch(() => ({}));
    setTogglingId(null);
    if (!res.ok) {
      setError(data.error || "Failed to update recipient.");
      return;
    }
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === recipient.id ? { ...r, enabled: !recipient.enabled } : r,
      ),
    );
  }

  function startEdit(recipient: NotificationRecipient) {
    setError("");
    setEditingId(recipient.id);
    setEditEmail(recipient.email);
    setEditLabel(recipient.label ?? "");
    setEditEnabled(recipient.enabled);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id: string) {
    setError("");
    if (!editEmail.trim()) {
      setError("Email is required.");
      return;
    }
    setSavingId(id);
    const res = await fetch(
      `/api/admin/settings/notification-recipients/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          label: editLabel,
          enabled: editEnabled,
        }),
      },
    );
    const data = await res.json().catch(() => ({}));
    setSavingId(null);
    if (!res.ok) {
      setError(data.error || "Failed to update recipient.");
      return;
    }
    setEditingId(null);
    flash("Recipient updated.");
    await refreshRecipients();
  }

  async function handleDelete(recipient: NotificationRecipient) {
    if (
      !confirm(
        `Remove ${recipient.email} from order notifications? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError("");
    const res = await fetch(
      `/api/admin/settings/notification-recipients/${recipient.id}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to delete recipient.");
      return;
    }
    setRecipients((prev) => prev.filter((r) => r.id !== recipient.id));
    flash("Recipient removed.");
  }

  return (
    <section className="max-w-4xl">
      <h2 className="mb-1 font-serif text-lg italic text-foreground">
        Order Notifications
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Addresses listed here will receive Admin new-order notifications once
        email sending is enabled. Disabled addresses are kept but will not
        receive messages.
      </p>

      <form
        onSubmit={handleAdd}
        className="mb-8 rounded-lg border border-border bg-surface p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="new-email"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="orders@hammah.store"
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="new-label"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Label (optional)
            </label>
            <input
              id="new-label"
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Owner"
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={newEnabled}
              onChange={(e) => setNewEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            <span className="text-sm font-medium text-foreground">Enabled</span>
          </label>
          <Button type="submit" variant="primary" size="md" disabled={adding}>
            {adding ? "Adding..." : "Add recipient"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
          {success}
        </div>
      )}

      {recipients.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            No order notification recipients configured.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add at least one email address before enabling Admin order
            notifications.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-4 py-3 font-semibold text-foreground">Label</th>
                <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((recipient) => {
                const isEditing = editingId === recipient.id;
                return (
                  <tr
                    key={recipient.id}
                    className="border-b border-border last:border-0 hover:bg-surface-elevated/50"
                  >
                    {isEditing ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            placeholder="Label"
                            className="h-9 w-full min-w-28 rounded-md border border-border bg-surface px-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="h-9 w-full min-w-48 rounded-md border border-border bg-surface px-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editEnabled}
                              onChange={(e) => setEditEnabled(e.target.checked)}
                              className="h-4 w-4 rounded border-border accent-accent"
                            />
                            <span className="text-xs text-muted-foreground">
                              {editEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </label>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={savingId === recipient.id}
                              onClick={() => handleSaveEdit(recipient.id)}
                              className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                            >
                              {savingId === recipient.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          {recipient.label ? (
                            <span className="font-medium text-foreground">
                              {recipient.label}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {recipient.email}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              disabled={togglingId === recipient.id}
                              onClick={() => handleToggle(recipient)}
                              aria-label={
                                recipient.enabled
                                  ? "Disable recipient"
                                  : "Enable recipient"
                              }
                              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50"
                              style={{
                                backgroundColor: recipient.enabled
                                  ? "hsl(var(--accent))"
                                  : "hsl(var(--border))",
                              }}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                                  recipient.enabled
                                    ? "translate-x-4.5"
                                    : "translate-x-0.5"
                                }`}
                              />
                            </button>
                            <span className="text-xs font-medium text-muted-foreground">
                              {recipient.enabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => startEdit(recipient)}
                              className="text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(recipient)}
                              className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
