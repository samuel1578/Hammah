import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { data, error } = await admin
    .from("size_guides")
    .select("*, size_guide_rows(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const body = await request.json();
  const { name, description, unit, is_active, rows } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const { data: guide, error: guideError } = await admin
    .from("size_guides")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      unit: unit || "cm",
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (guideError) {
    return NextResponse.json({ error: guideError.message }, { status: 500 });
  }

  if (Array.isArray(rows) && rows.length > 0) {
    const { error: rowsError } = await admin
      .from("size_guide_rows")
      .insert(
        rows.map((r: { size_label: string; measurements: Record<string, string>; sort_order?: number }, i: number) => ({
          size_guide_id: guide.id,
          size_label: r.size_label,
          sort_order: r.sort_order ?? i,
          measurements: r.measurements ?? {},
        })),
      );

    if (rowsError) {
      return NextResponse.json({ error: rowsError.message }, { status: 500 });
    }
  }

  const { data: full } = await admin
    .from("size_guides")
    .select("*, size_guide_rows(*)")
    .eq("id", guide.id)
    .single();

  return NextResponse.json(full, { status: 201 });
}
