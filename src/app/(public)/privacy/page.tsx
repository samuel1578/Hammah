import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo/site";
import { PrivacyPage as PrivacyPageContent } from "./privacy-client";

export const metadata: Metadata = publicPageMetadata({
  title: "Privacy Policy",
  description:
    "How SL by HAMMAH handles information provided through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
