import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { data, error } = await admin
    .from("homepage_collection_feature")
    .select("id, collection_id, heading, statement, is_active, created_at, collections(id, name, slug)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? null);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const body = await request.json();
  const { collection_id, heading, statement, is_active } = body;

  const { data: existing } = await admin
    .from("homepage_collection_feature")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await admin
      .from("homepage_collection_feature")
      .update({
        collection_id: collection_id || null,
        heading: heading ?? "",
        statement: statement ?? "",
        is_active: is_active ?? false,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await admin
    .from("homepage_collection_feature")
    .insert({
      collection_id: collection_id || null,
      heading: heading ?? "",
      statement: statement ?? "",
      is_active: is_active ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
