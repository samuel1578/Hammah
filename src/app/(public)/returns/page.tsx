"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { LegalSection } from "@/components/legal/legal-section";

export default function ReturnsPage() {
  return (
    <div className="min-h-[100svh]">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <TextReveal
            as="h1"
            className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            Returns &amp; Refunds
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Clear terms, before anything is final.
            </p>
          </Reveal>
          <Reveal delay={0.2} y={12}>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              This page is the working structure for Hammah&apos;s returns and
              refunds policy. Final operational terms must be approved before
              production launch.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-3 text-sm text-muted-foreground/70">
              Last updated: August 2026. This is a working draft.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Content */}
      <section className="border-t border-border bg-surface/50 py-12 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-12">
            <LegalSection id="eligibility" heading="Eligibility" working>
              <p>
                Final eligibility rules will state which items can be returned
                or exchanged and the applicable time period.
              </p>
            </LegalSection>

            <LegalSection id="item-condition" heading="Item Condition" working>
              <p>
                Final policy wording will define the required condition for any
                returned item.
              </p>
            </LegalSection>

            <LegalSection id="how-to-request" heading="How to Request a Return" working>
              <p>
                Customers should contact Hammah using the official contact
                channel and provide the relevant order reference and reason for
                the request.
              </p>
            </LegalSection>

            <LegalSection id="refunds" heading="Refunds" working>
              <p>
                Final refund timing, method and eligibility requirements must be
                approved before publication.
              </p>
            </LegalSection>

            <LegalSection id="exclusions" heading="Exclusions" working>
              <p>
                Any exclusions, including personalised, altered or otherwise
                non-returnable items, must be formally approved before
                publication.
              </p>
            </LegalSection>

            <LegalSection id="delivery-costs" heading="Delivery Costs" working>
              <p>
                Final responsibility for return delivery costs must be approved
                before publication.
              </p>
            </LegalSection>

            <LegalSection id="need-help" heading="Need Help?" working={false}>
              <p>
                If you have a question about an order, contact Hammah with your
                order reference.
              </p>
              <div className="mt-4">
                <Link
                  href="/track"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Track Order
                </Link>
              </div>
            </LegalSection>
          </div>
        </Container>
      </section>

      {/* Back link */}
      <section className="border-t border-border py-10">
        <Container>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to home
          </Link>
        </Container>
      </section>
    </div>
  );
}
