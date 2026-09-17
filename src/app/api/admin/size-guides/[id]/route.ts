import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { data, error } = await admin
    .from("size_guides")
    .select("*, size_guide_rows(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Size guide not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;
  const body = await request.json();
  const { name, description, unit, is_active, rows } = body;

  const { data: existing } = await admin
    .from("size_guides")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Size guide not found." }, { status: 404 });
  }

  const { error: updateError } = await admin
    .from("size_guides")
    .update({
      name: name?.trim(),
      description: description?.trim() || null,
      unit: unit || "cm",
      is_active: is_active ?? true,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (Array.isArray(rows)) {
    await admin.from("size_guide_rows").delete().eq("size_guide_id", id);

    if (rows.length > 0) {
      const { error: rowsError } = await admin
        .from("size_guide_rows")
        .insert(
          rows.map((r: { size_label: string; measurements: Record<string, string>; sort_order?: number }, i: number) => ({
            size_guide_id: id,
            size_label: r.size_label,
            sort_order: r.sort_order ?? i,
            measurements: r.measurements ?? {},
          })),
        );

      if (rowsError) {
        return NextResponse.json({ error: rowsError.message }, { status: 500 });
      }
    }
  }

  const { data: full } = await admin
    .from("size_guides")
    .select("*, size_guide_rows(*)")
    .eq("id", id)
    .single();

  return NextResponse.json(full);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { error } = await admin.from("size_guides").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Size guide deleted." });
}
