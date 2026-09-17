"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
}

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, date_of_birth")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone: data.phone ?? "",
          date_of_birth: data.date_of_birth ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    setErrorMessage("");

    if (!profile.first_name.trim() || !profile.last_name.trim()) {
      setStatus("error");
      setErrorMessage("First name and last name are required.");
      setSaving(false);
      return;
    }

    if (profile.date_of_birth) {
      const dob = new Date(profile.date_of_birth);
      if (isNaN(dob.getTime())) {
        setStatus("error");
        setErrorMessage("Please enter a valid date.");
        setSaving(false);
        return;
      }
      if (dob > new Date()) {
        setStatus("error");
        setErrorMessage("Birthday cannot be in the future.");
        setSaving(false);
        return;
      }
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        phone: profile.phone.trim() || null,
        date_of_birth: profile.date_of_birth || null,
      })
      .eq("id", user.id);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("success");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <h2 className="font-serif italic text-xl text-foreground">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details.
        </p>
      </div>

      {/* Email — read-only */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Contact support to change your email address.
        </p>
      </div>

      {/* First name */}
      <div>
        <label
          htmlFor="first_name"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          First name
        </label>
        <input
          id="first_name"
          type="text"
          required
          value={profile.first_name}
          onChange={(e) =>
            setProfile({ ...profile, first_name: e.target.value })
          }
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Last name */}
      <div>
        <label
          htmlFor="last_name"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Last name
        </label>
        <input
          id="last_name"
          type="text"
          required
          value={profile.last_name}
          onChange={(e) =>
            setProfile({ ...profile, last_name: e.target.value })
          }
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Phone / WhatsApp
        </label>
        <input
          id="phone"
          type="tel"
          value={profile.phone}
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Birthday */}
      <div>
        <label
          htmlFor="date_of_birth"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Birthday — optional
        </label>
        <input
          id="date_of_birth"
          type="date"
          value={profile.date_of_birth}
          onChange={(e) =>
            setProfile({ ...profile, date_of_birth: e.target.value })
          }
          max={new Date().toISOString().split("T")[0]}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Optional. This becomes part of your Hamatee profile.
        </p>
      </div>

      {/* Status messages */}
      {status === "success" && (
        <p className="text-sm text-green-600" role="status">
          Profile updated.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="h-10 rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
