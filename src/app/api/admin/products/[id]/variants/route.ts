import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { admin: createAdminClient() };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { data, error } = await admin
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;
  const body = await request.json();
  const { size_label, size_value } = body;

  if (!size_label?.trim()) {
    return NextResponse.json({ error: "Size label is required." }, { status: 400 });
  }
  if (!size_value?.trim()) {
    return NextResponse.json({ error: "Size value is required." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", id)
    .eq("size_value", size_value.trim())
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A variant with this size value already exists for this product." },
      { status: 409 }
    );
  }

  const { count } = await admin
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  const { data, error } = await admin
    .from("product_variants")
    .insert({
      product_id: id,
      size_label: size_label.trim(),
      size_value: size_value.trim(),
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
