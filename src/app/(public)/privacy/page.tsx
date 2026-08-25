"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { LegalTableOfContents } from "@/components/legal/legal-toc";
import { LegalSection } from "@/components/legal/legal-section";

const tocItems = [
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-information-is-used", label: "How Information Is Used" },
  { id: "order-information", label: "Order Information" },
  { id: "account-information", label: "Account Information" },
  { id: "communications", label: "Communications" },
  { id: "service-providers", label: "Service Providers" },
  { id: "analytics", label: "Analytics" },
  { id: "retention", label: "Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-[100svh]">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <Container>
          <TextReveal
            as="h1"
            className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            Privacy Policy
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              This page explains how Hammah handles information provided through
              the website. Final legal wording should be reviewed before
              production publication.
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
              <LegalSection id="information-we-collect" heading="Information We Collect" working>
                <p>
                  Hammah may collect information you provide when creating an
                  account, placing an order request, contacting the brand, saving
                  delivery details, or using website features.
                </p>
                <p>Examples may include:</p>
                <ul className="list-inside list-disc space-y-1 pl-2">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone or WhatsApp number</li>
                  <li>Delivery information</li>
                  <li>Account information</li>
                  <li>Order information</li>
                </ul>
              </LegalSection>

              <LegalSection id="how-information-is-used" heading="How Information Is Used" working>
                <p>
                  Information may be used to manage accounts, respond to order
                  requests, coordinate fulfilment, provide customer support,
                  communicate relevant updates, and operate the website.
                </p>
              </LegalSection>

              <LegalSection id="order-information" heading="Order Information" working>
                <p>
                  Order details are used to process and track customer requests
                  and to support communication between Hammah and the customer.
                </p>
              </LegalSection>

              <LegalSection id="account-information" heading="Account Information" working>
                <p>
                  Hamatee account information is used to provide The Hammah
                  Legacy, including order history, saved pieces and member
                  privileges.
                </p>
              </LegalSection>

              <LegalSection id="communications" heading="Communications" working>
                <p>
                  Hammah may send transactional or approved member communications
                  using the contact information associated with an account or
                  order.
                </p>
              </LegalSection>

              <LegalSection id="service-providers" heading="Service Providers" working>
                <p>
                  Hammah may rely on third-party services for website hosting,
                  authentication, email delivery, analytics, communication or
                  other technical functions.
                </p>
              </LegalSection>

              <LegalSection id="analytics" heading="Analytics" working>
                <p>
                  The website may use analytics to understand how customers
                  interact with products and key website journeys. Analytics
                  should avoid collecting unnecessary personal information.
                </p>
              </LegalSection>

              <LegalSection id="retention" heading="Retention" working>
                <p>
                  Information may be retained for as long as necessary to support
                  legitimate operational, legal and customer-service
                  requirements.
                </p>
              </LegalSection>

              <LegalSection id="your-rights" heading="Your Rights" working>
                <p>
                  Final rights language must be reviewed against the applicable
                  legal requirements before launch.
                </p>
              </LegalSection>

              <LegalSection id="contact" heading="Contact" working>
                <p>
                  Questions about privacy can be directed to Hammah through the
                  official contact channels published on the website.
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
