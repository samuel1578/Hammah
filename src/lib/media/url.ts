/**
 * Returns the public delivery URL for a media asset stored in Cloudflare R2.
 *
 * The URL is constructed from CLOUDFLARE_R2_PUBLIC_BASE_URL + the storage key.
 * Falls back to a development placeholder when R2 is not configured.
 */
export function getMediaUrl(storageKey: string): string {
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;

  if (!baseUrl) {
    // R2 not configured yet — return a placeholder that will be replaced
    // when Sprint 0.16 migrates catalogue reads from fixtures to Supabase.
    return `https://images.pixieset.com/${storageKey}`;
  }

  return `${baseUrl.replace(/\/+$/, "")}/${storageKey.replace(/^\/+$/, "")}`;
}
