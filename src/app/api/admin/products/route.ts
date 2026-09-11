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

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const body = await request.json();
  const { name, slug, description, category_id, pricing_mode, price_amount, availability } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!category_id) {
    return NextResponse.json({ error: "Category is required." }, { status: 400 });
  }

  const finalSlug = slug?.trim() || generateSlug(name);

  if (!finalSlug) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("products")
    .select("id")
    .eq("slug", finalSlug)
    .single();

  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
  }

  const { data, error } = await admin
    .from("products")
    .insert({
      name: name.trim(),
      slug: finalSlug,
      description: description || null,
      category_id,
      pricing_mode: pricing_mode || "PRICE_ON_REQUEST",
      price_amount: price_amount ?? null,
      availability: availability || "COMING_SOON",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
