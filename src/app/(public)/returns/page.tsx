import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo/site";
import { ReturnsPage as ReturnsPageContent } from "./returns-client";

export const metadata: Metadata = publicPageMetadata({
  title: "Returns & Refunds",
  description:
    "Clear returns and refund terms for SL by HAMMAH orders, explained before anything is final.",
  path: "/returns",
});

export default function ReturnsPage() {
  return <ReturnsPageContent />;
}
