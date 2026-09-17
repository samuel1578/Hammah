import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("size_guides")
    .select("name, unit, description, is_active, size_guide_rows(size_label, measurements, sort_order)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Size guide not found." }, { status: 404 });
  }

  const sorted = {
    ...data,
    size_guide_rows: (data.size_guide_rows ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  };

  return NextResponse.json(sorted);
}
