import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 credentials. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY in .env.local.",
    );
  }

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
