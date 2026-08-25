"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
const measurements = [
  {
    name: "Waist",
    description: "Measure around the narrowest part of your natural waistline.",
  },
  {
    name: "Rise",
    description: "Measure from the crotch seam to the top of the waistband.",
  },
  {
    name: "Hip",
    description: "Measure around the fullest part of your hips.",
  },
  {
    name: "Outseam",
    description: "Measure from the waistband to the hem along the outer leg.",
  },
  {
    name: "Inseam",
    description: "Measure from the crotch to the hem along the inner leg.",
  },
  {
    name: "Trouser Length",
    description: "The total length of the garment from waistband to hem.",
  },
];

const sizes = [
  { size: "30", waist: "—", hip: "—", outseam: "—", inseam: "—" },
  { size: "32", waist: "—", hip: "—", outseam: "—", inseam: "—" },
  { size: "34", waist: "—", hip: "—", outseam: "—", inseam: "—" },
  { size: "36", waist: "—", hip: "—", outseam: "—", inseam: "—" },
];

export default function SizeGuidePage() {
  return (
    <div className="min-h-[100svh]">
      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <Container>
          <TextReveal
            as="h1"
            className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            Size Guide
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Find your closest fit.
            </p>
          </Reveal>
          <Reveal delay={0.2} y={12}>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Final Hammah measurements will be added from approved sizing
              information.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Diagram placeholder */}
      <section className="border-t border-border bg-surface/50 py-16 md:py-24" aria-labelledby="how-to-measure-heading">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            {/* Left — Measurement diagram placeholder */}
            <Reveal>
              <div className="relative flex aspect-[3/4] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Trouser measurement diagram
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    /images/hammah/legal/size-guide-diagram.svg
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground/50">
                    Visual reference coming soon.
                  </p>
                </div>
                {/* Measurement zone indicators */}
                <div className="absolute inset-8 rounded border border-accent/20" />
                <div className="absolute left-8 top-1/3 h-px w-12 bg-accent/30" />
                <div className="absolute left-8 top-2/3 h-px w-12 bg-accent/30" />
              </div>
            </Reveal>

            {/* Right — How to measure */}
            <div>
              <Reveal>
                <h2
                  id="how-to-measure-heading"
                  className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl"
                >
                  How to measure
                </h2>
              </Reveal>
              <div className="mt-8 space-y-6">
                {measurements.map((m, i) => (
                  <Reveal key={m.name} delay={0.05 * i}>
                    <div>
                      <h3 className="text-base font-medium text-foreground">
                        {m.name}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {m.description}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Size table */}
      <section className="py-16 md:py-24" aria-labelledby="size-table-heading">
        <Container>
          <Reveal>
            <h2
              id="size-table-heading"
              className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl"
            >
              Size table
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-3 text-sm text-muted-foreground">
              Final measurements will be added from approved sizing information.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-left text-sm font-semibold text-foreground">
                      Size
                    </th>
                    <th className="py-3 pr-4 text-left text-sm font-semibold text-foreground">
                      Waist
                    </th>
                    <th className="py-3 pr-4 text-left text-sm font-semibold text-foreground">
                      Hip
                    </th>
                    <th className="py-3 pr-4 text-left text-sm font-semibold text-foreground">
                      Outseam
                    </th>
                    <th className="py-3 text-left text-sm font-semibold text-foreground">
                      Inseam
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => (
                    <tr key={s.size} className="border-b border-border/50">
                      <td className="py-3.5 pr-4 text-sm font-medium text-foreground">
                        {s.size}
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-muted-foreground">
                        {s.waist}
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-muted-foreground">
                        {s.hip}
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-muted-foreground">
                        {s.outseam}
                      </td>
                      <td className="py-3.5 text-sm text-muted-foreground">
                        {s.inseam}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 md:py-20">
        <Container className="text-center">
          <Reveal>
            <h2 className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl">
              Found your size?
            </h2>
          </Reveal>
          <Reveal delay={0.1} y={12}>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/collections/collection-001"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Return to Collection 001
              </Link>
              <Link
                href="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-md btn-engraved-secondary px-6 text-sm font-medium"
              >
                View a Piece
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
