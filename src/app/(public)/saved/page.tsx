"use client";

import { useState } from "react";
import Link from "next/link";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";

type SavedState = "populated" | "empty" | "signed-out";

const demoProducts = products.slice(0, 4);

export default function SavedPage() {
  const [state, setState] = useState<SavedState>("populated");

  return (
    <section className="py-20 md:py-32" aria-labelledby="saved-heading">
      <Container>
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <TextReveal as="h1" id="saved-heading" className="font-serif italic text-4xl tracking-tight text-foreground sm:text-5xl">
            Saved
          </TextReveal>
          <Reveal delay={0.1} y={12}>
            <p className="mt-3 text-muted-foreground">
              Saved Pieces
            </p>
          </Reveal>
        </div>

        {/* Dev state selector */}
        <Reveal delay={0.15}>
          <div className="mb-8 flex gap-2 rounded-md border border-border bg-surface p-1">
            {(["populated", "empty", "signed-out"] as SavedState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setState(s)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  state === s
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "populated" ? "Populated" : s === "empty" ? "Empty" : "Signed Out"}
              </button>
            ))}
          </div>
        </Reveal>

        {/* States */}
        {state === "populated" && (
          <>
            <Reveal delay={0.2}>
              <p className="mb-8 text-sm text-muted-foreground">
                Keep the Hammah pieces you want to return to.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {demoProducts.map((product, i) => (
                <div key={product.id} className="space-y-3">
                  <ProductCard product={product} index={i} />
                  <div className="flex gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex-1 rounded-md border border-border bg-surface py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-surface-elevated"
                    >
                      View Product
                    </Link>
                    <button
                      type="button"
                      className="flex-1 rounded-md border border-border bg-surface py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-elevated"
                    >
                      Order This Piece
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {state === "empty" && (
          <Reveal delay={0.2}>
            <div className="py-20 text-center">
              <p className="text-2xl font-serif italic text-foreground">
                Nothing saved yet.
              </p>
              <p className="mt-3 max-w-sm mx-auto text-sm text-muted-foreground">
                When a piece catches your eye, save it here and come back when you&apos;re ready.
              </p>
              <div className="mt-8">
                <Link
                  href="/collections/collection-001"
                  className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Explore Collection 001
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {state === "signed-out" && (
          <Reveal delay={0.2}>
            <div className="py-20 text-center">
              <p className="text-2xl font-serif italic text-foreground">
                Keep your saved pieces together.
              </p>
              <p className="mt-3 max-w-sm mx-auto text-sm text-muted-foreground">
                Join the Hammah Legacy or sign in to keep saved pieces connected to your account.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center rounded-md btn-engraved-secondary px-5 text-sm font-medium"
                >
                  Join the Legacy
                </Link>
              </div>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
