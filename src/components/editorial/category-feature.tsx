"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import type { MediaSlot } from "@/data/media-manifest";

interface CategoryFeatureProps {
  name: string;
  status: string;
  href: string;
  media?: MediaSlot;
  dominant?: boolean;
}

export function CategoryFeature({
  name,
  status,
  href,
  media,
  dominant = false,
}: CategoryFeatureProps) {
  return (
    <Link href={href} className="group relative overflow-hidden block">
      <MediaReveal className={`relative ${dominant ? "aspect-[4/5] md:aspect-[3/4]" : "aspect-[4/5]"}`}>
        {media ? (
          <img
            src={media.currentSrc}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
            {name}
          </div>
        )}
      </MediaReveal>

      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 p-6 md:p-8">
        <Reveal delay={0.1}>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
            {status}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <h3 className="mt-1 font-serif italic text-2xl text-foreground sm:text-3xl">
            {name}
          </h3>
        </Reveal>
        <Reveal delay={0.2}>
          <span className="mt-3 inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
            Explore
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Reveal>
      </div>
    </Link>
  );
}
