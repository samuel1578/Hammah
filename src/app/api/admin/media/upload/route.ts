import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { uploadObject } from "@/lib/cloudflare/r2";
import { getMediaUrl } from "@/lib/media/url";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES] as const;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;   // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;   // 50 MB

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getMediaType(mimeType: string): "image" | "video" {
  if (mimeType.startsWith("video/")) return "video";
  return "image";
}

function isVideo(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin({ includeUserId: true });
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
      { error: `Invalid file type "${file.type}". Accepted: JPEG, PNG, WebP, MP4, WebM.` },
      { status: 400 },
    );
  }

  const maxSize = isVideo(file.type) ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return NextResponse.json(
      { error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max: ${maxMB} MB.` },
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
