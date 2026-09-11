import { createClient } from "@/lib/supabase/server";

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
}

export async function getActiveCTAs(slot?: string): Promise<CTA[]> {
  const supabase = await createClient();

  let query = supabase
    .from("cta_placements")
    .select("id, slot, label, href, enabled, variant, sort_order, starts_at, ends_at")
    .eq("enabled", true)
    .or("ends_at.is.null,ends_at.gt.now()")
    .order("sort_order");

  if (slot) {
    query = query.eq("slot", slot);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.filter((cta) => {
    if (cta.starts_at && new Date(cta.starts_at) > new Date()) return false;
    return true;
  });
}
