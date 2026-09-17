"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { COLLECTION_001_PIXIESET } from "@/data/pixieset-collection-001";

/* ─────────────────────────────────────────────
   IMAGE HELPERS
   Uses the full 160-image Collection 001 pool.
   Deterministic initial pair avoids hydration
   mismatch; random pair selected after mount.
   ───────────────────────────────────────────── */

const DEFAULT_INITIAL: [number, number] = [6, 7];
const DEFAULT_INTERVAL = 1500;

function pickRandom(exclude: number[]): number {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * COLLECTION_001_PIXIESET.length);
  } while (exclude.includes(COLLECTION_001_PIXIESET[idx].number));
  return COLLECTION_001_PIXIESET[idx].number;
}

function getUrl(num: number): string {
  return COLLECTION_001_PIXIESET.find((img) => img.number === num)?.url ?? "";
}

/* ─────────────────────────────────────────────
   HOOK — useRotatingImagePair

   Manages two image slots from the Collection
   001 pool. One slot changes at a time.
   Pauses when section is outside viewport.
   Preloads replacement before swapping.
   ───────────────────────────────────────────── */

export function useRotatingImagePair(
  initialA: number = DEFAULT_INITIAL[0],
  initialB: number = DEFAULT_INITIAL[1],
  interval: number = DEFAULT_INTERVAL,
) {
  const [slotA, setSlotA] = useState(initialA);
  const [slotB, setSlotB] = useState(initialB);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const slotARef = useRef(initialA);
  const slotBRef = useRef(initialB);
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
    const a = pickRandom([initialB]);
    const b = pickRandom([initialB, a]);
    slotARef.current = a;
    slotBRef.current = b;
    const id = requestAnimationFrame(() => {
      setSlotA(a);
      setSlotB(b);
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial values stable
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
      intervalRef.current = setInterval(rotate, interval);
    }, interval);
  }, [rotate, interval]);

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

  return {
    slotAUrl: getUrl(slotA),
    slotBUrl: getUrl(slotB),
    mounted,
    sectionRef,
    shouldReduceMotion,
  };
}

/* ─────────────────────────────────────────────
   COMPONENT — RotatingImagePair

   Simple two-column rotating image layout.
   For custom layouts (parallax, asymmetric
   grids), use the useRotatingImagePair hook
   directly.
   ───────────────────────────────────────────── */

interface RotatingImagePairProps {
  initialA?: number;
  initialB?: number;
  altA: string;
  altB: string;
  /** Outer wrapper className (grid, gap, etc.) */
  className?: string;
  /** className for slot A wrapper */
  slotAClassName?: string;
  /** className for slot B wrapper */
  slotBClassName?: string;
  /** className for the inner aspect container */
  aspectClassName?: string;
  interval?: number;
}

export function RotatingImagePair({
  initialA = DEFAULT_INITIAL[0],
  initialB = DEFAULT_INITIAL[1],
  altA,
  altB,
  className = "",
  slotAClassName = "",
  slotBClassName = "",
  aspectClassName = "aspect-[3/4]",
  interval = DEFAULT_INTERVAL,
}: RotatingImagePairProps) {
  const { slotAUrl, slotBUrl, shouldReduceMotion, sectionRef } =
    useRotatingImagePair(initialA, initialB, interval);

  return (
    <div ref={sectionRef} className={className}>
      <div className={slotAClassName}>
        <div className={`${aspectClassName} relative`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={slotAUrl}
              src={slotAUrl}
              alt={altA}
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
      <div className={slotBClassName}>
        <div className={`${aspectClassName} relative`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={slotBUrl}
              src={slotBUrl}
              alt={altB}
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
    </div>
  );
}
