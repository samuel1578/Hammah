import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo/site";
import { LegacyPage as LegacyPageContent } from "./legacy-client";

export const metadata: Metadata = publicPageMetadata({
  title: "Hamatee",
  description:
    "Discover Hamatee — the ongoing relationship between HAMMAH and the people who return, save pieces and continue the story with us.",
  path: "/legacy",
});

export default function LegacyPage() {
  return <LegacyPageContent />;
}
