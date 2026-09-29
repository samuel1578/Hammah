import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = noindexMetadata("Media");

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
