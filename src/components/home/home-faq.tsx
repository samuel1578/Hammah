"use client";

import { useState, useCallback, useId } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";

interface FaqItem {
  question: string;
  answer: string;
  cta?: { label: string; href: string };
}

const faqItems: FaqItem[] = [
  {
    question: "How do I order a Hammah piece?",
    answer:
      "Choose the piece you want, select the available options and submit an order request. Hammah will then continue the conversation with you directly to confirm the order, payment and delivery details.",
  },
  {
    question: "Can I order without creating an account?",
    answer:
      "Yes. You can place an order request as a guest. Creating a Hamatee account simply gives you a place to keep future orders, saved pieces and member privileges together.",
  },
  {
    question: "How do payments work?",
    answer:
      "Payment is arranged after your order request is confirmed. Depending on the order, payment may be made before delivery or arranged for delivery. The exact next step is confirmed directly with you.",
  },
  {
    question: "Do you deliver outside Accra?",
    answer:
      "Yes. Hammah currently serves customers in Accra and across Ghana. Delivery cost and timing are confirmed after the order request based on the destination and fulfilment arrangement.",
  },
  {
    question: "How do I know which size to choose?",
    answer:
      "Use the Size Guide as a starting point when selecting your piece. Final Hammah measurements are still being prepared, so any additional sizing guidance can be confirmed with you during the order process.",
    cta: { label: "View Size Guide", href: "/size-guide" },
  },
  {
    question: "What is the Hammah Legacy?",
    answer:
      "The Hammah Legacy is the member experience for Hamatees. It brings your orders, saved pieces, member privileges and relationship with Hammah into one place.",
    cta: { label: "Discover the Legacy", href: "/legacy" },
  },
  {
    question: "Are kaftans and footwear available now?",
    answer:
      "Not yet. Collection 001 begins with African-print trousers. Kaftans and African-made footwear are part of the wider Hammah product world and will be introduced in future releases.",
  },
  {
    question: "Can I save a piece and come back to it?",
    answer:
      "Yes. Saved Pieces is designed to keep the Hammah pieces you want to return to. Persistent account-based saving will become available through the Hamatee experience.",
  },
];

export function HomeFaq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const baseId = useId();
  const shouldReduceMotion = useReducedMotion();

  const handleHover = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const handleToggle = useCallback(
    (index: number) => {
      setActiveIndex((prev) => (prev === index ? null : index));
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle(index);
      }
    },
    [handleToggle],
  );

  return (
    <section
      className="py-24 md:py-36"
      aria-labelledby="faq-heading"
    >
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-20">
          {/* Left — editorial title block */}
          <div className="md:col-span-4">
            <Reveal delay={0} y={8}>
              <p className="type-eyebrow mb-4 text-muted-foreground">FAQ</p>
            </Reveal>
            <TextReveal
              as="h2"
              id="faq-heading"
              className="type-headline text-foreground"
            >
              Questions,
              <br />
              answered.
            </TextReveal>
            <Reveal delay={0.15} y={12}>
              <p className="type-body mt-6 max-w-xs text-muted-foreground">
                A few things worth knowing before you choose a piece.
              </p>
            </Reveal>
          </div>

          {/* Right — question list */}
          <div
            className="md:col-span-8"
            onMouseLeave={handleLeave}
          >
            {faqItems.map((item, i) => {
              const isActive = activeIndex === i;
              const questionId = `${baseId}-q-${i}`;
              const answerId = `${baseId}-a-${i}`;

              return (
                <div
                  key={i}
                  className={`border-t transition-colors duration-200 ${
                    isActive
                      ? "border-accent/40"
                      : "border-border"
                  }`}
                >
                  {/* Question trigger */}
                  <button
                    type="button"
                    onClick={() => handleToggle(i)}
                    onMouseEnter={() => handleHover(i)}
                    onFocus={() => handleHover(i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    id={questionId}
                    aria-expanded={isActive}
                    aria-controls={answerId}
                    className={`flex w-full items-baseline gap-4 py-5 text-left transition-all duration-200 md:py-6 ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {/* Number */}
                    <span
                      className={`flex-shrink-0 font-sans text-xs font-semibold tracking-[0.12em] transition-colors duration-200 ${
                        isActive ? "text-accent" : "text-muted-foreground/50"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Question text */}
                    <span
                      className={`flex-1 font-serif text-lg italic leading-snug tracking-tight transition-all duration-200 md:text-xl ${
                        isActive
                          ? "text-foreground"
                          : ""
                      }`}
                    >
                      {item.question}
                    </span>

                    {/* Plus / Minus */}
                    <motion.span
                      animate={{ rotate: isActive ? 45 : 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.2,
                      }}
                      className={`flex-shrink-0 text-lg font-light transition-colors duration-200 ${
                        isActive ? "text-accent" : "text-muted-foreground/40"
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </motion.span>
                  </button>

                  {/* Answer */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        id={answerId}
                        role="region"
                        aria-labelledby={questionId}
                        initial={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        animate={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { height: "auto", opacity: 1 }
                        }
                        exit={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { height: 0, opacity: 0 }
                        }
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.3,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pl-10 pr-8 md:pb-8">
                          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                            {item.answer}
                          </p>
                          {item.cta && (
                            <Link
                              href={item.cta.href}
                              className="type-cta mt-4 inline-flex items-center gap-2 text-accent transition-colors hover:text-accent/80"
                            >
                              {item.cta.label}
                              <span aria-hidden="true">→</span>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {/* Bottom border */}
            <div className="border-t border-border" />
          </div>
        </div>
      </Container>
    </section>
  );
}
