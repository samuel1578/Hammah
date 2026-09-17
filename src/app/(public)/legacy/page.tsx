"use client";

import Link from "next/link";
import { getMediaByRoute } from "@/data/media-manifest";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Stagger, staggerItemVariants } from "@/components/motion/stagger";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { ShoppingBag, Heart, User, CalendarHeart } from "lucide-react";
import { AnimatedBrandMark } from "@/components/editorial/animated-brand-mark";

const benefits = [
  { icon: Heart, title: "Saved Pieces", description: "Keep the pieces you want to return to, all in one place." },
  { icon: ShoppingBag, title: "Order History", description: "See your past and current orders whenever you need them." },
  { icon: User, title: "Your Profile", description: "The details that help HAMMAH know you — name, phone, and birthday." },
  { icon: CalendarHeart, title: "A Birthday Worth Remembering", description: "HAMMAH wants every Hamatee to feel remembered when their day comes around." },
];

export default function LegacyPage() {
  const media = getMediaByRoute("/legacy");
  const since = media.find((m) => m.section === "since");

  return (
    <>
      {/* Hero — Motion-led composition */}
      <section
        className="flex min-h-[78svh] items-center bg-background py-16 md:min-h-[82svh] md:py-24"
        aria-labelledby="legacy-hero-heading"
      >
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-16">
            {/* Left — Text */}
            <div className="order-2 md:order-1">
              <TextReveal
                as="h1"
                id="legacy-hero-heading"
                className="font-serif italic text-4xl tracking-tight text-foreground sm:text-5xl md:text-5xl lg:text-6xl"
              >
                Stay close to what you love.
              </TextReveal>

              <Reveal delay={0.2} y={16}>
                <p className="mt-5 max-w-md text-xl text-muted-foreground sm:text-2xl">
                  Save the pieces that speak to you, keep your order history in
                  one place, and let HAMMAH remember the details that make the
                  relationship yours.
                </p>
              </Reveal>

              <Reveal delay={0.4} y={12}>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="inline-flex h-12 items-center rounded-md bg-accent px-7 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    Become a Hamatee
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Right — Contour + Logo */}
            <div className="order-1 md:order-2">
              <AnimatedBrandMark />
            </div>
          </div>
        </Container>
      </section>

      {/* What You Keep */}
      <section className="py-20 md:py-32" aria-labelledby="legacy-keep-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 md:items-start">
            <div>
              <TextReveal as="h2" id="legacy-keep-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
                Your HAMMAH, remembered.
              </TextReveal>
              <Reveal delay={0.15} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  When you become a Hamatee, the parts of your relationship with
                  HAMMAH that matter stay with you — saved for when you need
                  them, and ready whenever you come back.
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

      {/* You become part of the story */}
      <section className="py-20 md:py-32 bg-surface" aria-labelledby="legacy-story-heading">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <MediaReveal className="aspect-[4/5]">
              {since && (
                <img src={since.currentSrc} alt="HAMMAH Hamatee" className="h-full w-full object-cover" loading="lazy" />
              )}
            </MediaReveal>
            <div>
              <Reveal delay={0.1}>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  More than an account
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <TextReveal as="h2" id="legacy-story-heading" className="mt-2 font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
                  You become part of the story.
                </TextReveal>
              </Reveal>
              <Reveal delay={0.2} y={12}>
                <p className="mt-4 max-w-md text-base text-muted-foreground">
                  Hamatee gives HAMMAH a way to remember the people who continue
                  with us — the pieces you save, the orders you make, and the
                  details you choose to share.
                </p>
              </Reveal>
              <Reveal delay={0.25} y={12}>
                <p className="mt-3 max-w-md text-base text-muted-foreground">
                  It means your relationship with HAMMAH does not have to begin
                  again every time you return.
                </p>
              </Reveal>

              {/* Divider */}
              <Reveal delay={0.3} y={8}>
                <div className="my-8 h-px w-12 bg-border" />
              </Reveal>

              {/* Birthday subsection */}
              <Reveal delay={0.35}>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Your birthday matters
                </p>
              </Reveal>
              <Reveal delay={0.4} y={12}>
                <p className="mt-3 max-w-md text-base text-muted-foreground">
                  Tell us when your day is. HAMMAH wants every Hamatee to feel
                  remembered when it comes around.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 bg-surface" aria-labelledby="legacy-cta-heading">
        <Container className="text-center">
          <TextReveal as="h2" id="legacy-cta-heading" className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl">
            Become a Hamatee.
          </TextReveal>
          <Reveal delay={0.15} y={12}>
            <p className="mt-4 mx-auto max-w-md text-base text-muted-foreground">
              Create your HAMMAH account and start the relationship.
            </p>
          </Reveal>
          <Reveal delay={0.25} y={12}>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90">
                Become a Hamatee
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
