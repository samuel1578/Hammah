import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = noindexMetadata("Sign in");

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
