import type { Metadata } from "next";
import { getPublishedCollections } from "@/lib/catalogue";
import { CollectionsClient } from "./collections-client";
import { publicPageMetadata } from "@/lib/seo/site";

const COLLECTIONS_TITLE = "Collections";
const COLLECTIONS_DESCRIPTION =
  "Browse SL by HAMMAH collections — African print, contemporary fashion and the current releases.";

export const metadata: Metadata = publicPageMetadata({
  title: COLLECTIONS_TITLE,
  description: COLLECTIONS_DESCRIPTION,
  path: "/collections",
});

export default async function CollectionsPage() {
  const collections = await getPublishedCollections();

  return <CollectionsClient collections={collections} />;
}
