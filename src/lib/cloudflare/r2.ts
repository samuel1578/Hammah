import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function sanitizeAccountId(raw: string): string {
  // Strip protocol (https://) and any trailing path/domain (.r2.cloudflarestorage.com)
  return raw
    .replace(/^https?:\/\//, "")
    .replace(/\.r2\.cloudflarestorage\.com.*$/, "")
    .replace(/\/+$/, "");
}

function getR2Client(): S3Client {
  const rawAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!rawAccountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 credentials. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY in .env.local.",
    );
  }

  const accountId = sanitizeAccountId(rawAccountId);

  console.log("[R2] accountId present:", !!accountId);
  console.log("[R2] accountId length:", accountId.length);
  console.log("[R2] constructed endpoint hostname:", `${accountId}.r2.cloudflarestorage.com`);

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function uploadObject(
  key: string,
  body: ReadableStream | Buffer | Uint8Array,
  contentType: string,
): Promise<{ key: string; bucket: string }> {
  const client = getR2Client();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;

  if (!bucket) {
    throw new Error("Missing CLOUDFLARE_R2_BUCKET in .env.local.");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return { key, bucket };
}

export async function deleteObject(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;

  if (!bucket) {
    throw new Error("Missing CLOUDFLARE_R2_BUCKET in .env.local.");
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
