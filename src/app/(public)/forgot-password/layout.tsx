import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = noindexMetadata("Forgot password");

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
