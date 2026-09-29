import type { Metadata } from "next";

export const SITE_ORIGIN = "https://www.hammah.store";

export const SITE_NAME = "SL by HAMMAH";
export const BRAND_NAME = "SL by HAMMAH";
export const BRAND_ALTERNATE_NAME = "HAMMAH";

export const SITE_TITLE = "SL by HAMMAH | Contemporary African Fashion";
export const SITE_DESCRIPTION =
  "Discover SL by HAMMAH — contemporary African fashion shaped through expressive print, modern tailoring and statement trousers.";

export const OG_IMAGE_PATH = "/images/hammah/global/logo/og-image.png";
export const LOGO_PATH = "/images/hammah/global/logo/logo-primary-light.png";

export const OG_IMAGE = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: SITE_NAME,
} as const;

export function absoluteUrl(path: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function publicPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}

export function noindexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
