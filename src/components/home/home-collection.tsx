"use client";

import Link from "next/link";
import { getMediaBySection } from "@/data/media-manifest";
import type { Product } from "@/types/products";
import { Reveal } from "@/components/motion/reveal";
import { MediaReveal } from "@/components/motion/media-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { GlitchText } from "@/components/editorial/glitch-text";
import { Container } from "@/components/ui/container";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface HomeCollection001Props {
  products: Product[];
}

export function HomeCollection001({ products }: HomeCollection001Props) {
  const media = getMediaBySection("collection-001");
  const hasProducts = products.length > 0;

  return (
    <section className="py-16 md:py-36" aria-labelledby="collection-001-heading">
      <Container>
        {/* Header — stronger hierarchy */}
        <div className="mb-10 md:mb-20">
          <Reveal delay={0} y={8}>
            <GlitchText
              as="p"
              className="type-eyebrow mb-4 text-muted-foreground"
            >
              Collection 001
            </GlitchText>
          </Reveal>
          <TextReveal
            as="h2"
            id="collection-001-heading"
            className="type-headline text-foreground"
          >
            The first release.
          </TextReveal>
          <Reveal delay={0.15} y={14}>
            <p className="type-editorial-statement mt-6 max-w-xl text-foreground">
              Eight African-print trouser designs make up the
              opening collection from SL by Hammah.
            </p>
          </Reveal>
        </div>

        {hasProducts ? (
          /* Infinite horizontal marquee — all current designs, mobile + desktop */
          <div className="marquee overflow-hidden">
            <div className="marquee-track flex w-max">
              {[...products, ...products].map((product, i) => {
                const duplicate = i >= products.length;
                return (
                  <Link
                    key={`${product.id}-${i}`}
                    href={`/product/${product.slug}`}
                    className="group mr-4 w-[64vw] shrink-0 sm:w-[300px] md:mr-5 md:w-[340px]"
                    aria-hidden={duplicate ? true : undefined}
                    tabIndex={duplicate ? -1 : undefined}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.media.primary}
                        alt={`${product.name} — Collection 001`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-3 text-center font-ribeye text-[15px] leading-snug text-foreground">
                      {product.name}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Fallback: editorial asymmetric grid (desktop) */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-5">
              {media[0] && (
                <MediaReveal
                  delay={0}
                  className="md:col-span-7 relative overflow-hidden"
                >
                  <div className="aspect-[4/5]">
                    <img
                      src={media[0].currentSrc}
                      alt={media[0].intent}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      loading="eager"
                    />
                  </div>
                </MediaReveal>
              )}

              <div className="md:col-span-5 flex flex-col gap-5">
                {media.slice(1, 4).map((slot, i) => (
                  <MediaReveal
                    key={slot.id}
                    delay={(i + 1) * 0.1}
                    className="relative overflow-hidden"
                  >
                    <div className={`${i === 0 ? "aspect-[16/10]" : "aspect-[4/3]"} ${i === 2 ? "hidden md:block" : ""}`}>
                      <img
                        src={slot.currentSrc}
                        alt={slot.intent}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                  </MediaReveal>
                ))}
              </div>
            </div>

            {/* Fallback: mobile Swiper with peek effect */}
            <div className="md:hidden">
              <Swiper
                modules={[Pagination]}
                slidesPerView={1.15}
                spaceBetween={12}
                pagination={{ clickable: true }}
                className="collection-swiper"
              >
                {media.map((slot, i) => (
                  <SwiperSlide key={slot.id}>
                    <MediaReveal delay={i * 0.08}>
                      <div className={`relative overflow-hidden ${i === 0 ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
                        <img
                          src={slot.currentSrc}
                          alt={slot.intent}
                          className="h-full w-full object-cover"
                          loading={i === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    </MediaReveal>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}

        {/* CTA — stronger */}
        <Reveal delay={0.3} y={14}>
          <div className="mt-8 md:mt-12">
            <Link
              href="/collections/collection-001"
              className="type-cta inline-flex h-12 items-center rounded-md btn-engraved-primary px-7"
            >
              View Collection 001
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
