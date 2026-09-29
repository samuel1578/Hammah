import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo/site";
import { TermsPage as TermsPageContent } from "./terms-client";

export const metadata: Metadata = publicPageMetadata({
  title: "Terms & Conditions",
  description:
    "The basic conditions for using the SL by HAMMAH website and submitting order requests.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsPageContent />;
}
