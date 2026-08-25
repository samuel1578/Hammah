import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
  id?: string;
}

export function Section({
  children,
  className = "",
  as: Tag = "section",
  id,
}: SectionProps) {
  return (
    <Tag id={id} className={`py-16 md:py-24 ${className}`}>
      {children}
    </Tag>
  );
}
