import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function ProductNotFound() {
  return (
    <Section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <Container className="text-center">
        <h1 className="font-serif italic text-4xl tracking-tight text-foreground sm:text-5xl">
          Product not found
        </h1>
        <p className="mt-4 text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Browse the shop
          </Link>
        </div>
      </Container>
    </Section>
  );
}
