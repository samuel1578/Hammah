"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { BrandLogo } from "@/components/brand/brand-logo";

/* ─────────────────────────────────────────────
   IMAGE SELECTION — Pixieset Collection 001
   
   Change these URLs to swap images.
   Primary:   u(26) — strong model/campaign shot
   Detail:    u(12) — editorial portrait
   Texture:   u(35) — detail/fabric close-up
   ───────────────────────────────────────────── */

const IMAGES = {
  primary:
    "https://images.pixieset.com/638827911/7452b956a03655074e712733eec40d35-large.jpg",
  detail:
    "https://images.pixieset.com/638827911/e29bfc2bcd95d9f7650669d872e85183-large.jpg",
  texture:
    "https://images.pixieset.com/638827911/6d8c2deaaf52f96324d9e7f7786a315d-large.jpg",
} as const;

/* ─────────────────────────────────────────────
   SCROLL MAPPER
   Input: array of [progress%, opacity, translateY]
   Output: { opacity: MotionValue, y: MotionValue }
   ───────────────────────────────────────────── */

function scrollMap(
  progress: ReturnType<typeof useScroll>["scrollYProgress"],
  track: [number, number, number][],
) {
  return {
    opacity: useTransform(progress, track.map((t) => t[0]), track.map((t) => t[1])),
    y: useTransform(progress, track.map((t) => t[0]), track.map((t) => t[2])),
  };
}

/* ─────────────────────────────────────────────
   DESKTOP ANIMATIONS
   ───────────────────────────────────────────── */

function useDesktopAnimations(progress: ReturnType<typeof useScroll>["scrollYProgress"]) {
  // Primary: enters → dominates → recedes left in act 3
  const primary = scrollMap(progress, [
    [0.00, 0, 60],     // hidden below
    [0.10, 0.4, 30],   // emerging
    [0.22, 1, 0],      // fully in, center-right
    [0.38, 1, 0],      // dominant
    [0.52, 1, 0],      // holds
    [0.62, 1, 0],      // begins shift
    [0.72, 0.8, 0],    // receded, left
    [0.85, 0.75, 0],   // holds left
    [1.00, 0.75, 0],   // final
  ]);

  // Detail: enters left in act 2 → moves center in act 3 → holds
  const detail = scrollMap(progress, [
    [0.00, 0, 40],
    [0.26, 0, 25],     // hidden
    [0.34, 0.5, 10],   // entering
    [0.42, 1, 0],      // fully in, left
    [0.54, 1, 0],      // dominant
    [0.66, 1, 0],      // moves center
    [0.78, 0.9, 0],    // holds
    [1.00, 0.9, 0],    // final
  ]);

  // Texture: enters act 3, holds act 4
  const texture = scrollMap(progress, [
    [0.00, 0, 50],
    [0.50, 0, 30],
    [0.58, 0.4, 15],
    [0.66, 0.8, 0],
    [0.74, 1, 0],      // fully in
    [0.88, 1, 0],
    [1.00, 1, 0],
  ]);

  // Brand: center → fades act 2
  const brand = scrollMap(progress, [
    [0.00, 0, 0],
    [0.06, 0.8, 0],
    [0.14, 1, 0],      // fully visible
    [0.26, 1, 0],
    [0.36, 0, 0],      // fades
    [1.00, 0, 0],
  ]);

  // Form label: appears act 2, fades act 4
  const formLabel = scrollMap(progress, [
    [0.00, 0, 12],
    [0.30, 0, 8],
    [0.38, 1, 0],      // appears
    [0.54, 1, 0],
    [0.66, 0.6, 0],
    [0.74, 0, 0],      // fades
    [1.00, 0, 0],
  ]);

  // Collection + CTA: appears act 4
  const collection = scrollMap(progress, [
    [0.00, 0, 16],
    [0.72, 0, 12],
    [0.80, 1, 0],      // appears
    [0.92, 1, 0],
    [1.00, 1, 0],
  ]);

  return { primary, detail, texture, brand, formLabel, collection };
}

/* ─────────────────────────────────────────────
   MOBILE ANIMATIONS
   Dedicated vertical choreography.
   ───────────────────────────────────────────── */

function useMobileAnimations(progress: ReturnType<typeof useScroll>["scrollYProgress"]) {
  // Primary: fills viewport → exits upward
  const primary = scrollMap(progress, [
    [0.00, 0, 40],
    [0.08, 0.6, 20],
    [0.18, 1, 0],      // fully in
    [0.32, 1, 0],      // holds
    [0.46, 1, 0],
    [0.58, 0.7, -20],  // shifting up
    [0.68, 0, -40],    // exited
    [1.00, 0, -40],
  ]);

  // Detail: enters mid → dominant → holds
  const detail = scrollMap(progress, [
    [0.00, 0, 30],
    [0.30, 0, 20],
    [0.38, 0.5, 8],
    [0.46, 1, 0],      // fully in
    [0.58, 1, 0],      // dominant
    [0.72, 1, 0],
    [0.85, 0.9, 0],
    [1.00, 0.9, 0],
  ]);

  // Texture: enters late → holds
  const texture = scrollMap(progress, [
    [0.00, 0, 35],
    [0.54, 0, 22],
    [0.62, 0.5, 10],
    [0.70, 1, 0],
    [0.82, 1, 0],
    [0.94, 1, 0],
    [1.00, 1, 0],
  ]);

  // Brand: center → fades
  const brand = scrollMap(progress, [
    [0.00, 0, 0],
    [0.05, 0.7, 0],
    [0.12, 1, 0],
    [0.24, 1, 0],
    [0.34, 0, 0],
    [1.00, 0, 0],
  ]);

  // Form label: appears act 2, fades act 3
  const formLabel = scrollMap(progress, [
    [0.00, 0, 10],
    [0.28, 0, 6],
    [0.36, 1, 0],
    [0.46, 1, 0],
    [0.56, 0, 0],
    [1.00, 0, 0],
  ]);

  // Collection + CTA: appears act 4
  const collection = scrollMap(progress, [
    [0.00, 0, 14],
    [0.74, 0, 10],
    [0.82, 1, 0],
    [0.94, 1, 0],
    [1.00, 1, 0],
  ]);

  return { primary, detail, texture, brand, formLabel, collection };
}

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

export function HomeScrollytellingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const d = useDesktopAnimations(scrollYProgress);
  const m = useMobileAnimations(scrollYProgress);

  if (shouldReduceMotion) {
    return (
      <section className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#111110]">
        <StaticHero />
      </section>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[300svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#111110]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111110] via-[#1a1918] to-[#111110]" />

        {/* ═══════════════════════════════════════
           DESKTOP (md+) — 4 editorial acts
           ═══════════════════════════════════════ */}

        {/* Primary — dominant right, recedes left in act 3 */}
        <motion.div
          style={{ opacity: d.primary.opacity, y: d.primary.y }}
          className="absolute top-[8%] right-[4%] h-[82%] w-[46%] overflow-hidden max-md:hidden"
        >
          <img
            src={IMAGES.primary}
            alt="SL by Hammah — Collection 001 campaign"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Detail — enters left in act 2, moves center in act 3 */}
        <motion.div
          style={{ opacity: d.detail.opacity, y: d.detail.y }}
          className="absolute top-[18%] left-[4%] h-[56%] w-[34%] overflow-hidden max-md:hidden"
        >
          <img
            src={IMAGES.detail}
            alt="SL by Hammah — editorial portrait"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Texture — enters act 3, bottom-left */}
        <motion.div
          style={{ opacity: d.texture.opacity, y: d.texture.y }}
          className="absolute bottom-[6%] left-[6%] h-[30%] w-[24%] overflow-hidden max-md:hidden"
        >
          <img
            src={IMAGES.texture}
            alt="SL by Hammah — fabric detail"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Brand — centered act 1, fades */}
        <motion.div
          style={{ opacity: d.brand.opacity, y: d.brand.y }}
          className="absolute inset-0 flex items-center justify-center max-md:hidden"
        >
          <BrandLogo
            variant="secondary"
            forceTheme="dark"
            className="h-[90px] lg:h-[110px] w-auto"
          />
        </motion.div>

        {/* Form label — act 2 */}
        <motion.div
          style={{ opacity: d.formLabel.opacity, y: d.formLabel.y }}
          className="absolute top-[8%] left-[5%] max-md:hidden"
        >
          <p
            className="type-eyebrow tracking-[0.3em]"
            style={{ color: "rgba(247,245,241,0.6)" }}
          >
            FORM / 001
          </p>
        </motion.div>

        {/* Collection label — act 4 */}
        <motion.div
          style={{ opacity: d.collection.opacity, y: d.collection.y }}
          className="absolute top-[8%] right-[5%] text-right max-md:hidden"
        >
          <p
            className="type-eyebrow tracking-[0.2em]"
            style={{ color: "rgba(247,245,241,0.5)" }}
          >
            Collection 001
          </p>
        </motion.div>

        {/* CTA — act 4 */}
        <motion.div
          style={{ opacity: d.collection.opacity, y: d.collection.y }}
          className="absolute bottom-10 right-[5%] max-md:hidden"
        >
          <Link
            href="/collections/collection-001"
            className="btn-engraved-primary type-cta inline-flex h-12 items-center rounded-md px-7"
          >
            <span className="relative z-10">Shop Collection 001</span>
          </Link>
        </motion.div>

        {/* ═══════════════════════════════════════
           MOBILE (below md) — vertical choreography
           ═══════════════════════════════════════ */}

        {/* Primary — fills, then exits upward */}
        <motion.div
          style={{ opacity: m.primary.opacity, y: m.primary.y }}
          className="absolute inset-x-0 top-[10%] h-[60%] overflow-hidden md:hidden"
        >
          <img
            src={IMAGES.primary}
            alt="SL by Hammah — Collection 001 campaign"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Detail — enters mid, takes prominence */}
        <motion.div
          style={{ opacity: m.detail.opacity, y: m.detail.y }}
          className="absolute inset-x-[5%] top-[18%] h-[52%] overflow-hidden md:hidden"
        >
          <img
            src={IMAGES.detail}
            alt="SL by Hammah — editorial portrait"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Texture — enters act 3, bottom */}
        <motion.div
          style={{ opacity: m.texture.opacity, y: m.texture.y }}
          className="absolute inset-x-[5%] bottom-[12%] h-[28%] overflow-hidden md:hidden"
        >
          <img
            src={IMAGES.texture}
            alt="SL by Hammah — fabric detail"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Brand — centered act 1 */}
        <motion.div
          style={{ opacity: m.brand.opacity, y: m.brand.y }}
          className="absolute inset-0 flex items-center justify-center md:hidden"
        >
          <BrandLogo
            variant="secondary"
            forceTheme="dark"
            className="h-[55px] w-auto"
          />
        </motion.div>

        {/* Form label — act 2 */}
        <motion.div
          style={{ opacity: m.formLabel.opacity, y: m.formLabel.y }}
          className="absolute top-[6%] left-5 md:hidden"
        >
          <p
            className="type-eyebrow tracking-[0.25em]"
            style={{ color: "rgba(247,245,241,0.6)" }}
          >
            FORM / 001
          </p>
        </motion.div>

        {/* Collection label — act 4 */}
        <motion.div
          style={{ opacity: m.collection.opacity, y: m.collection.y }}
          className="absolute top-[6%] right-5 text-right md:hidden"
        >
          <p
            className="type-eyebrow tracking-[0.18em]"
            style={{ color: "rgba(247,245,241,0.5)" }}
          >
            Collection 001
          </p>
        </motion.div>

        {/* CTA — act 4 */}
        <motion.div
          style={{ opacity: m.collection.opacity, y: m.collection.y }}
          className="absolute bottom-6 inset-x-0 flex justify-center md:hidden"
        >
          <Link
            href="/collections/collection-001"
            className="btn-engraved-primary type-cta inline-flex h-11 items-center rounded-md px-6"
          >
            <span className="relative z-10">Shop Collection 001</span>
          </Link>
        </motion.div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            boxShadow: "inset 0 0 150px 60px rgba(17,17,16,0.35)",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STATIC HERO — reduced motion
   Shows the Act 4 final composition.
   ───────────────────────────────────────────── */

function StaticHero() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#111110] via-[#1a1918] to-[#111110]" />

      {/* Desktop */}
      <div className="hidden md:block absolute inset-0">
        <div className="absolute top-[8%] right-[4%] h-[82%] w-[46%] overflow-hidden opacity-75">
          <img src={IMAGES.primary} alt="SL by Hammah — campaign" className="h-full w-full object-cover" loading="eager" />
        </div>
        <div className="absolute top-[18%] left-[4%] h-[56%] w-[34%] overflow-hidden opacity-85">
          <img src={IMAGES.detail} alt="SL by Hammah — portrait" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="absolute bottom-[6%] left-[6%] h-[30%] w-[24%] overflow-hidden opacity-80">
          <img src={IMAGES.texture} alt="SL by Hammah — detail" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="absolute top-[8%] left-[5%]">
          <p className="type-eyebrow tracking-[0.3em]" style={{ color: "rgba(247,245,241,0.6)" }}>FORM / 001</p>
        </div>
        <div className="absolute top-[8%] right-[5%] text-right">
          <p className="type-eyebrow tracking-[0.2em]" style={{ color: "rgba(247,245,241,0.5)" }}>Collection 001</p>
        </div>
        <div className="absolute bottom-10 right-[5%]">
          <Link href="/collections/collection-001" className="btn-engraved-primary type-cta inline-flex h-12 items-center rounded-md px-7">
            <span className="relative z-10">Shop Collection 001</span>
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden absolute inset-0">
        <div className="absolute inset-x-[5%] top-[18%] h-[52%] overflow-hidden opacity-85">
          <img src={IMAGES.detail} alt="SL by Hammah — portrait" className="h-full w-full object-cover" loading="eager" />
        </div>
        <div className="absolute inset-x-[5%] bottom-[12%] h-[28%] overflow-hidden opacity-80">
          <img src={IMAGES.texture} alt="SL by Hammah — detail" className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="absolute top-[6%] left-5">
          <p className="type-eyebrow tracking-[0.25em]" style={{ color: "rgba(247,245,241,0.6)" }}>FORM / 001</p>
        </div>
        <div className="absolute top-[6%] right-5 text-right">
          <p className="type-eyebrow tracking-[0.18em]" style={{ color: "rgba(247,245,241,0.5)" }}>Collection 001</p>
        </div>
        <div className="absolute bottom-6 inset-x-0 flex justify-center">
          <Link href="/collections/collection-001" className="btn-engraved-primary type-cta inline-flex h-11 items-center rounded-md px-6">
            <span className="relative z-10">Shop Collection 001</span>
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-20" style={{ boxShadow: "inset 0 0 150px 60px rgba(17,17,16,0.35)" }} />
    </div>
  );
}
