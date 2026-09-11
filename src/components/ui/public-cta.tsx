import Link from "next/link";
import { getActiveCTAs } from "@/lib/catalogue/ctas";

interface PublicCTAProps {
  slot: string;
  className?: string;
}

export async function PublicCTA({ slot, className }: PublicCTAProps) {
  const ctas = await getActiveCTAs(slot);
  const cta = ctas[0];

  if (!cta) return null;

  const variantClasses =
    cta.variant === "secondary"
      ? "btn-engraved-secondary"
      : cta.variant === "ghost"
        ? "border border-border bg-transparent text-foreground hover:bg-surface"
        : "btn-engraved-primary";

  return (
    <div className={className}>
      <Link
        href={cta.href}
        className={`inline-flex h-12 items-center rounded-md px-6 text-sm font-medium transition-colors ${variantClasses}`}
      >
        {cta.label}
      </Link>
    </div>
  );
}
