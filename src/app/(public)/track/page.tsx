import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo/site";
import { TrackPage as TrackContent } from "./track-client";

export const metadata: Metadata = noindexMetadata("Track your order");

export default function TrackPage() {
  return <TrackContent />;
}
