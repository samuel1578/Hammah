import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata: Metadata = noindexMetadata("Create an account");

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
