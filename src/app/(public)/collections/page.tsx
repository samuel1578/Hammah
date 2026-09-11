import { getPublishedCollections } from "@/lib/catalogue";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage() {
  const collections = await getPublishedCollections();

  return <CollectionsClient collections={collections} />;
}
