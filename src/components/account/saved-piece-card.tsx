"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SavedPieceItem {
  savedId: string;
  productId: string;
  slug: string;
  name: string;
  status: string;
  availability: string;
  category?: string;
  image: string;
}

export function SavedPieceCard({ item }: { item: SavedPieceItem }) {
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    const supabase = createClient();
    await supabase.from("saved_products").delete().eq("id", item.savedId);
    setRemoved(true);
  }

  if (removed) return null;

  const isArchived = item.status === "archived";

  return (
    <div className="space-y-3">
      <Link
        href={`/product/${item.slug}`}
        className="group block aspect-[3/4] overflow-hidden rounded-md bg-surface"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <div className="space-y-2">
        <div>
          <Link
            href={`/product/${item.slug}`}
            className="text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            {item.name}
          </Link>
          {item.category && (
            <p className="text-xs text-muted-foreground">{item.category}</p>
          )}
        </div>

        {isArchived ? (
          <p className="text-xs text-muted-foreground italic">
            No longer available
          </p>
        ) : (
          <Link
            href={`/product/${item.slug}`}
            className="inline-block rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-elevated"
          >
            View Design
          </Link>
        )}

        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-label={`Remove ${item.name} from saved pieces`}
        >
          <Heart className="h-3.5 w-3.5 fill-current" />
          {removing ? "Removing…" : "Saved"}
        </button>
      </div>
    </div>
  );
}
