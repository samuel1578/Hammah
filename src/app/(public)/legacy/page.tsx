"use client";

import Link from "next/link";
import { getMediaByRoute } from "@/data/media-manifest";
import { CollectionHero } from "@/components/editorial/collection-hero";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { ShoppingBag, Heart, Star, Layers } from "lucide-react";

const benefits = [
  { icon: ShoppingBag, title: "Orders", description: "See current and previous orders in one place." },
  { icon: Heart, title: "Saved Pieces", description: "Keep pieces you want to return to later." },
  { icon: Star, title: "Member Privileges", description: "See any discounts or benefits assigned to your account." },
  { icon: Layers, title: "Pieces Collected", description: "Build a simple record of completed Hammah purchases." },
];

export default function LegacyPage() {
  const media = getMediaByRoute("/legacy");
  const hero = media.find((m) => m.section === "hero");
  const since = media.find((m) => m.section === "since");
  const privileges = media.find((m) => m.section === "privileges");

  return (
    <>
      {/* Hero */}
      <CollectionHero
        heading="The Hammah Legacy"
        subheading="Stay closer to Hammah."
        body="Joining the Hammah Legacy creates your Hamatee account and keeps your relationship with the brand in one place."
        media={hero}
        cta={{ label: "Become a Hamatee", href: "/signup" }}
      />

      {/* What You Keep */}
      <section className="py-20 md:py-32" aria-labelledby="legacy-keep-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 md:items-start">
            <div>
              <TextReveal as="h2" id="legacy-keep-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
                Your Hammah, remembered.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  The Legacy keeps the parts of your relationship with Hammah that matter.
                </p>
              </Reveal>
            </div>

            <Stagger className="space-y-6" staggerDelay={0.08}>
              {benefits.map((b) => (
                <motion.div
                  key={b.title}
                  variants={staggerItemVariants}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-surface text-accent">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{b.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* Hamatee Since */}
      <section className="py-20 md:py-32 bg-surface" aria-labelledby="legacy-since-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <MediaReveal className="aspect-[4/5]">
              {since && (
                <img src={since.currentSrc} alt="Hamatee membership" className="h-full w-full object-cover" loading="lazy" />
              )}
            </MediaReveal>
            <div>
              <Reveal delay={0.1}>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Hamatee Since
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-2 font-serif italic text-7xl tracking-tight text-foreground sm:text-8xl">
                  2026
                </p>
              </Reveal>
              <Reveal delay={0.2} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  Your membership date becomes part of your Legacy profile.
                </p>
              </Reveal>
              <Reveal delay={0.25} y={12}>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  This is a visual example of future member UI.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Privileges */}
      <section className="py-20 md:py-32" aria-labelledby="legacy-privileges-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div className="order-2 md:order-1">
              <TextReveal as="h2" id="legacy-privileges-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
                A little something from Hammah.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  Privileges are assigned by Hammah and may apply to a future order.
                </p>
              </Reveal>
              <Reveal delay={0.25} y={12}>
                <div className="mt-6 rounded-md border border-border bg-surface p-6">
                  <p className="text-sm font-medium text-foreground">15% off your next piece</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Example member benefit. Actual privileges vary by account.
                  </p>
                </div>
              </Reveal>
            </div>
            <MediaReveal className="aspect-[3/4] order-1 md:order-2">
              {privileges && (
                <img src={privileges.currentSrc} alt="Member privileges" className="h-full w-full object-cover" loading="lazy" />
              )}
            </MediaReveal>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-surface" aria-labelledby="legacy-cta-heading">
        <Container className="text-center">
          <TextReveal as="h2" id="legacy-cta-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
            Join the Hammah Legacy.
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-4 mx-auto max-w-md text-base text-muted-foreground">
              Create your account and become a Hamatee.
            </p>
          </Reveal>
          <Reveal delay={0.25} y={12}>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90">
                Create Account
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
