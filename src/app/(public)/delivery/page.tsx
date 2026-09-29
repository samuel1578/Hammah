import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo/site";
import { DeliveryPage as DeliveryPageContent } from "./delivery-client";

export const metadata: Metadata = publicPageMetadata({
  title: "Delivery",
  description:
    "How delivery works for SL by HAMMAH orders — from order request to confirmed, agreed delivery details.",
  path: "/delivery",
});

export default function DeliveryPage() {
  return <DeliveryPageContent />;
}
