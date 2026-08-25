"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { COLLECTION_001_PIXIESET } from "@/data/pixieset-collection-001";

interface RotatingDetailImagesProps {
  /** Initial pair of image URLs [left, right] */
  initialPair: [string, string];
  /** Alt text for the two slots */
  alts: [string, string];
  /** ms before first rotation (default 2000) */
  initialDelay?: number;
  /** ms between rotations (default 5000) */
  interval?: number;
  className?: string;
}

function pickPair(prev: [string, string]): [string, string] {
  const pool = COLLECTION_001_PIXIESET;
  const a = Math.floor(Math.random() * pool.length);
  let b = Math.floor(Math.random() * (pool.length - 1));
  if (b >= a) b += 1;

  // Avoid immediately repeating either previous image
  if (pool[a].url === prev[0] || pool[a].url === prev[1]) {
    const alt = (a + 1) % pool.length;
    return [pool[alt].url, pool[b].url];
  }
  if (pool[b].url === prev[0] || pool[b].url === prev[1]) {
    const alt = (b + 1) % pool.length;
    return [pool[a].url, pool[alt].url];
  }

  return [pool[a].url, pool[b].url];
}

export function RotatingDetailImages({
  initialPair,
  alts,
  initialDelay = 2000,
  interval = 5000,
  className = "",
}: RotatingDetailImagesProps) {
  const [current, setCurrent] = useState<[string, string]>(initialPair);
  const shouldReduceMotion = useReducedMotion();
  const inViewRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRef = useRef<[string, string]>(initialPair);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const rotate = useCallback(() => {
    const next = pickPair(prevRef.current);

    // Preload next pair while crossfade is happening
    next.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    setTimeout(() => {
      setCurrent(next);
      prevRef.current = next;
    }, shouldReduceMotion ? 50 : 600);
  }, [shouldReduceMotion]);

  const startTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      rotate();
      intervalRef.current = setInterval(rotate, interval);
    }, initialDelay);
  }, [rotate, initialDelay, interval]);

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

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

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
  }, [startTimers, stopTimers]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopTimers();
  }, [stopTimers]);

  return (
    <div ref={sectionRef} className={`grid grid-cols-2 gap-3 ${className}`}>
      {[0, 1].map((i) => (
        <div key={i} className={`${i === 0 ? "aspect-[3/4]" : "aspect-[2/3]"} relative ${i === 1 ? "mt-8" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={current[i]}
              src={current[i]}
              alt={alts[i]}
              className="absolute inset-0 h-full w-full object-contain"
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
      ))}
    </div>
  );
}
