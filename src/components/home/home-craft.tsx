"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { COLLECTION_001_PIXIESET } from "@/data/pixieset-collection-001";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand/brand-logo";

/* ─────────────────────────────────────────────
   IMAGE SELECTION
   Uses the full 160-image Collection 001 pool.
   Deterministic initial pair avoids hydration
   mismatch; random pair selected after mount.
   ───────────────────────────────────────────── */

const INITIAL_PAIR: [number, number] = [6, 7];
const ROTATION_INTERVAL = 1500;

function pickRandom(exclude: number[]): number {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * COLLECTION_001_PIXIESET.length);
  } while (
    exclude.includes(COLLECTION_001_PIXIESET[idx].number)
  );
  return COLLECTION_001_PIXIESET[idx].number;
}

function getUrl(num: number): string {
  return COLLECTION_001_PIXIESET.find((img) => img.number === num)?.url ?? "";
}

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

export function HomeDetailCraft() {
  const [slotA, setSlotA] = useState(INITIAL_PAIR[0]);
  const [slotB, setSlotB] = useState(INITIAL_PAIR[1]);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const slotARef = useRef(INITIAL_PAIR[0]);
  const slotBRef = useRef(INITIAL_PAIR[1]);
  const nextSlotRef = useRef<0 | 1>(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const inViewRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Keep refs in sync ── */
  useEffect(() => { slotARef.current = slotA; }, [slotA]);
  useEffect(() => { slotBRef.current = slotB; }, [slotB]);

  /* ── Randomise after mount (client-only) ── */
  useEffect(() => {
    const a = pickRandom([INITIAL_PAIR[1]]);
    const b = pickRandom([INITIAL_PAIR[0], a]);
    slotARef.current = a;
    slotBRef.current = b;
    // Defer state updates to avoid setState-in-effect lint error
    const id = requestAnimationFrame(() => {
      setSlotA(a);
      setSlotB(b);
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ── Rotate one slot at a time ── */
  const rotate = useCallback(() => {
    const target = nextSlotRef.current;
    nextSlotRef.current = target === 0 ? 1 : 0;
    if (target === 0) {
      const other = slotBRef.current;
      setSlotA((current) => pickRandom([other, current]));
    } else {
      const other = slotARef.current;
      setSlotB((current) => pickRandom([other, current]));
    }
  }, []);

  /* ── Timer management ── */
  const startTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      rotate();
      intervalRef.current = setInterval(rotate, ROTATION_INTERVAL);
    }, ROTATION_INTERVAL);
  }, [rotate]);

  const stopTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /* ── IntersectionObserver — pause when not visible ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || shouldReduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inViewRef.current) {
          inViewRef.current = true;
          startTimers();
        } else if (!entry.isIntersecting && inViewRef.current) {
          inViewRef.current = false;
          stopTimers();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      stopTimers();
    };
  }, [startTimers, stopTimers, shouldReduceMotion]);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => stopTimers(), [stopTimers]);

  /* ── Preload incoming images ── */
  useEffect(() => {
    if (!mounted) return;
    [slotA, slotB].forEach((num) => {
      const img = new Image();
      img.src = getUrl(num);
    });
  }, [mounted, slotA, slotB]);

  const imgA = getUrl(slotA);
  const imgB = getUrl(slotB);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-36"
      aria-labelledby="detail-craft-heading"
    >
      <Container>
        {/* Eyebrow */}
        <Reveal delay={0} y={8}>
          <p className="type-eyebrow mb-5 text-muted-foreground">In the Details</p>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-20 md:items-center">
          {/* Image zone — asymmetric editorial composition on desktop */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-5 gap-4">
              {/* Large primary detail image */}
              <MediaSlot
                src={imgA}
                alt="SL by Hammah — detail photography"
                colSpan="col-span-3"
                shouldReduceMotion={shouldReduceMotion}
              />

              {/* Secondary detail — offset right on desktop */}
              <MediaSlot
                src={imgB}
                alt="SL by Hammah — construction detail"
                colSpan="col-span-2"
                offset
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>
          </div>

          {/* Copy zone — larger, more editorial */}
          <div className="flex flex-col justify-center md:col-span-5">
            <TextReveal
              as="h2"
              id="detail-craft-heading"
              className="type-headline text-foreground"
            >
              Look closer.
            </TextReveal>

            {/* Secondary logo — editorial brand signature above statement */}
            <Reveal delay={0.15} y={12}>
              <div className="mt-6">
                <BrandLogo
                  variant="secondary"
                  className="h-[42px] sm:h-[50px] md:h-[58px] lg:h-[68px] w-auto"
                />
              </div>
            </Reveal>

            <Reveal delay={0.2} y={16}>
              <p className="type-editorial-statement mt-4 max-w-md text-foreground">
                Print, proportion, construction and finish become clearer at
                close range.
              </p>
            </Reveal>

            <Reveal delay={0.3} y={16}>
              <p className="type-body mt-4 max-w-md text-muted-foreground/70">
                The details are part of the piece. Nothing needs to shout.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MEDIA SLOT — animated image with crossfade
   ───────────────────────────────────────────── */

function MediaSlot({
  src,
  alt,
  colSpan,
  offset,
  shouldReduceMotion,
}: {
  src: string;
  alt: string;
  colSpan: string;
  offset?: boolean;
  shouldReduceMotion: boolean;
}) {
  return (
    <div
      className={`${colSpan} relative ${offset ? "mt-6 md:mt-12" : ""} overflow-hidden`}
    >
      <div className="aspect-[3/4] relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={src}
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.05 : 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            loading="lazy"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
