import type { ReactNode } from "react";

interface EditorialHeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export function EditorialHeading({
  children,
  level = 2,
  className = "",
}: EditorialHeadingProps) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  const sizeClasses = {
    1: "text-4xl sm:text-5xl md:text-6xl",
    2: "text-3xl sm:text-4xl md:text-5xl",
    3: "text-2xl sm:text-3xl",
  };

  return (
    <Tag
      className={`font-serif italic leading-tight tracking-tight ${sizeClasses[level]} ${className}`}
    >
      {children}
    </Tag>
  );
}
