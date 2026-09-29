import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = noindexMetadata("Reset password");

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
