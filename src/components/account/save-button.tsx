"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  productId: string;
}

export function SaveButton({ productId }: SaveButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("saved_products")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (data) {
        setSaved(true);
        setSavedId(data.id);
      }
      setLoading(false);
    }
    check();
  }, [productId]);

  async function handleClick() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setMutating(true);

    if (saved && savedId) {
      await supabase.from("saved_products").delete().eq("id", savedId);
      setSaved(false);
      setSavedId(null);
    } else {
      const { data, error } = await supabase
        .from("saved_products")
        .insert({ user_id: user.id, product_id: productId })
        .select("id")
        .single();

      if (!error && data) {
        setSaved(true);
        setSavedId(data.id);
      }
    }

    setMutating(false);
    router.refresh();
  }

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
      >
        <Heart className="h-4 w-4" />
        Save Piece
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutating}
      className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors disabled:opacity-50 ${
        saved
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface text-foreground hover:bg-surface-elevated"
      }`}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved pieces" : "Save this piece"}
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {mutating ? "…" : saved ? "Saved" : "Save Piece"}
    </button>
  );
}
