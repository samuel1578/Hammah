import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo/site";
import { OurStoryPage as OurStoryPageContent } from "./our-story-client";

export const metadata: Metadata = publicPageMetadata({
  title: "Our Story",
  description:
    "The story behind SL by HAMMAH — a contemporary African fashion brand shaped by a considered design philosophy, expressive African print and attention to craft.",
  path: "/our-story",
});

export default function OurStoryPage() {
  return <OurStoryPageContent />;
}
