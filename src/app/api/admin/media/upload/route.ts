import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadObject } from "@/lib/cloudflare/r2";
import { getMediaUrl } from "@/lib/media/url";

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
  return { admin: createAdminClient(), userId: user.id };
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 10 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getMediaType(mimeType: string): "image" | "video" | "360_frame" {
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp")
    return "image";
  return "image";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const admin = auth.admin;
  const userId = auth.userId;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type "${file.type}". Accepted: JPEG, PNG, WebP.` },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max: 10 MB.` },
      { status: 400 },
    );
  }

  const uuid = crypto.randomUUID();
  const safeName = sanitizeFilename(file.name);
  const storageKey = `uploads/${uuid}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadObject(storageKey, buffer, file.type);
  } catch (err) {
    return NextResponse.json(
      { error: `R2 upload failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 },
    );
  }

  const publicUrl = getMediaUrl(storageKey);

  const mediaType = getMediaType(file.type);

  const { data, error } = await admin
    .from("media_assets")
    .insert({
      storage_key: storageKey,
      public_url: publicUrl,
      media_type: mediaType,
      mime_type: file.type,
      file_size_bytes: file.size,
      alt_text: file.name,
      uploaded_by: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
