"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { LegalTableOfContents } from "@/components/legal/legal-toc";
import { LegalSection } from "@/components/legal/legal-section";

const tocItems = [
  { id: "website-use", label: "Website Use" },
  { id: "accounts", label: "Accounts" },
  { id: "order-requests", label: "Order Requests" },
  { id: "pricing", label: "Pricing" },
  { id: "payment", label: "Payment" },
  { id: "delivery", label: "Delivery" },
  { id: "cancellation", label: "Cancellation" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "liability", label: "Liability" },
  { id: "governing-terms", label: "Governing Terms" },
];

export default function TermsPage() {
  return (
    <div className="min-h-[100svh]">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <TextReveal
            as="h1"
            className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            Terms &amp; Conditions
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              These terms describe the basic conditions for using the SL by
              Hammah website and submitting order requests. Final legal wording
              requires formal review before production publication.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-3 text-sm text-muted-foreground/70">
              Last updated: August 2026. This is a working draft.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Content with TOC */}
      <section className="border-t border-border bg-surface/50 py-12 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
            {/* Sidebar TOC */}
            <div className="hidden lg:block">
              <LegalTableOfContents items={tocItems} />
            </div>

            {/* Mobile TOC */}
            <div className="lg:hidden">
              <details className="group rounded-md border border-border bg-surface p-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  Table of contents
                </summary>
                <nav className="mt-3 space-y-1" aria-label="Page sections">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </details>
            </div>

            {/* Content */}
            <div className="max-w-3xl space-y-12">
              <LegalSection id="website-use" heading="Website Use" working>
                <p>
                  The website is provided to allow customers to discover Hammah
                  products, access brand information, submit order requests, and
                  use available account features.
                </p>
              </LegalSection>

              <LegalSection id="accounts" heading="Accounts" working>
                <p>
                  Users are responsible for providing accurate account
                  information and keeping their login credentials secure.
                </p>
              </LegalSection>

              <LegalSection id="order-requests" heading="Order Requests" working>
                <p>
                  Submitting an order request does not necessarily mean payment
                  has been completed or delivery has been confirmed. Hammah may
                  contact the customer to confirm product availability, payment
                  arrangements and fulfilment details.
                </p>
              </LegalSection>

              <LegalSection id="pricing" heading="Pricing" working>
                <p>
                  Products may display a fixed price or a &ldquo;Price on
                  request&rdquo; state. Final pricing is communicated through the
                  website or directly by Hammah where required.
                </p>
              </LegalSection>

              <LegalSection id="payment" heading="Payment" working>
                <p>
                  Payment may be arranged before delivery or on delivery
                  depending on the order and the agreement made with Hammah.
                </p>
              </LegalSection>

              <LegalSection id="delivery" heading="Delivery" working>
                <p>
                  Delivery arrangements, costs and timing are confirmed after an
                  order request unless otherwise stated.
                </p>
              </LegalSection>

              <LegalSection id="cancellation" heading="Cancellation" working>
                <p>
                  Customers may be able to cancel a new order request before it
                  has been confirmed. Orders already being processed may require
                  direct communication with Hammah.
                </p>
              </LegalSection>

              <LegalSection id="intellectual-property" heading="Intellectual Property" working>
                <p>
                  Brand names, logos, photography, product imagery, copy and
                  other website content remain the property of their respective
                  rights holders and may not be reused without permission.
                </p>
              </LegalSection>

              <LegalSection id="liability" heading="Liability" working>
                <p>
                  Final limitation-of-liability language requires legal review.
                </p>
              </LegalSection>

              <LegalSection id="governing-terms" heading="Governing Terms" working>
                <p>
                  Final jurisdiction and governing-law wording requires legal
                  review before launch.
                </p>
              </LegalSection>
            </div>
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
