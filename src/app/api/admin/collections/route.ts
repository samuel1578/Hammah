import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const name = body.name.trim();
  const slug =
    body.slug && typeof body.slug === "string"
      ? body.slug.trim()
      : name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

  const { data: existing } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A collection with this slug already exists" },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({
      name,
      slug,
      description: body.description || null,
      editorial_heading: body.editorial_heading || null,
      editorial_statement: body.editorial_statement || null,
      editorial_body: body.editorial_body || null,
      hero_image_url: body.hero_image_url || null,
      hero_image_mobile_url: body.hero_image_mobile_url || null,
      sort_order: body.sort_order ?? 0,
      status: body.status || "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
