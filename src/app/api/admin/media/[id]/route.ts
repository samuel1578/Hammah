import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteObject } from "@/lib/cloudflare/r2";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;
  const body = await request.json();

  const { data: existing } = await admin
    .from("media_assets")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if ("alt_text" in body) updateData.alt_text = body.alt_text;
  if ("caption" in body) updateData.caption = body.caption || null;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("media_assets")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;

  const { id } = await params;

  const { data: asset, error: fetchError } = await admin
    .from("media_assets")
    .select("id, storage_key")
    .eq("id", id)
    .single();

  if (fetchError || !asset) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  const { count: productMediaCount } = await admin
    .from("product_media")
    .select("id", { count: "exact", head: true })
    .eq("media_asset_id", id);

  const { count: heroCount } = await admin
    .from("homepage_hero_images")
    .select("id", { count: "exact", head: true })
    .eq("media_asset_id", id);

  const totalRefs = (productMediaCount ?? 0) + (heroCount ?? 0);

  if (totalRefs > 0) {
    return NextResponse.json(
      { error: `Cannot delete — referenced by ${totalRefs} item(s).`, references: totalRefs },
      { status: 409 },
    );
  }

  try {
    await deleteObject(asset.storage_key);
  } catch {
    return NextResponse.json(
      { error: "Failed to delete file from R2." },
      { status: 500 },
    );
  }

  const { error: deleteError } = await admin
    .from("media_assets")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Asset deleted." });
}
