import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo/site";
import { SizeGuidePage as SizeGuidePageContent } from "./size-guide-client";

export const metadata: Metadata = publicPageMetadata({
  title: "Size Guide",
  description:
    "Measurement guidance for SL by HAMMAH trousers — waist, rise, hip, outseam and inseam explained.",
  path: "/size-guide",
});

export default function SizeGuidePage() {
  return <SizeGuidePageContent />;
}
