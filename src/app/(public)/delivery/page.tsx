"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { motion } from "motion/react";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";

const steps = [
  { num: "01", title: "Place your order request" },
  { num: "02", title: "Hammah confirms the order with you" },
  { num: "03", title: "Delivery details and cost are agreed" },
  { num: "04", title: "Your order is prepared and sent when ready" },
];

export default function DeliveryPage() {
  return (
    <div className="min-h-[100svh]">
      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <Container>
          <TextReveal
            as="h1"
            className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            Delivery, arranged
            <br />
            around the order.
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Hammah currently serves customers in Accra and across Ghana.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Process journey */}
      <section className="border-t border-border bg-surface/50 py-16 md:py-24" aria-labelledby="delivery-process-heading">
        <Container>
          <TextReveal
            as="h2"
            id="delivery-process-heading"
            className="mb-12 font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl"
          >
            How it works
          </TextReveal>

          <Stagger className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" staggerDelay={0.1}>
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={staggerItemVariants}
                className="relative"
              >
                <span className="text-5xl font-light text-muted-foreground/30 sm:text-6xl">
                  {step.num}
                </span>
                <p className="mt-3 text-base font-medium text-foreground">
                  {step.title}
                </p>
              </motion.div>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Detail sections */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl space-y-16">
            {/* Delivery Cost */}
            <Reveal>
              <h2 className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl">
                Quoted manually.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Delivery costs are confirmed after your order request based on
                the delivery location and arrangement.
              </p>
            </Reveal>

            {/* Delivery Methods */}
            <Reveal>
              <h2 className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl">
                Flexible fulfilment.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Delivery may be handled directly by Hammah or coordinated
                through a suitable courier service.
              </p>
            </Reveal>

            {/* Timing */}
            <Reveal>
              <h2 className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl">
                Timing is confirmed with you.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Hammah does not publish a universal delivery time because
                fulfilment depends on the order and delivery arrangement.
              </p>
            </Reveal>

            {/* Tracking */}
            <Reveal>
              <h2 className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl">
                Follow your order.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Guests can use the tracking details provided after their order
                request. Hamatees can also review orders inside The Hammah
                Legacy.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/track"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Track Order
                </Link>
                <Link
                  href="/collections/collection-001"
                  className="inline-flex h-12 items-center gap-2 rounded-md btn-engraved-secondary px-6 text-sm font-medium"
                >
                  Explore Collection 001
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  );
}
