"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/** Milliseconds each image stays visible before auto-advancing. */
const AUTO_ADVANCE_MS = 2500;

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  /** Once the user picks a thumbnail, auto-flow stops for good. */
  const [userEngaged, setUserEngaged] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const allImages = images;
  const currentImage = allImages[activeIndex];

  /* Auto-flow: play the queue from first to last on landing, then stop. */
  useEffect(() => {
    if (shouldReduceMotion) return;
    if (lightboxOpen) return;
    if (userEngaged) return;
    if (allImages.length < 2) return;
    if (activeIndex >= allImages.length - 1) return;
    const id = setTimeout(() => {
      setActiveIndex((prev) => Math.min(prev + 1, allImages.length - 1));
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [activeIndex, shouldReduceMotion, lightboxOpen, userEngaged, allImages.length]);

  const openLightbox = useCallback(
    (index: number) => {
      setLightboxIndex(index);
      setLightboxOpen(true);
    },
    [],
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.classList.add("menu-open");
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("menu-open");
    };
  }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

  return (
    <>
      {/* Main gallery */}
      <div className="space-y-3">
        {/* Primary image */}
        <motion.div
          key={activeIndex}
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-surface"
          onClick={() => openLightbox(activeIndex)}
        >
          <img
            src={currentImage}
            alt={`${alt} — photo ${activeIndex + 1} of ${allImages.length}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 right-3 rounded-md bg-surface/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
            {activeIndex + 1} / {allImages.length}
          </div>
        </motion.div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setUserEngaged(true);
                setActiveIndex(i);
              }}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded transition-all ${
                i === activeIndex
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur"
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen image viewer"
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-elevated"
              aria-label="Close viewer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-elevated"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[85vh] max-w-[90vw]"
            >
              <img
                src={allImages[lightboxIndex]}
                alt={`${alt} — photo ${lightboxIndex + 1} of ${allImages.length}`}
                className="max-h-[85vh] max-w-[90vw] object-contain"
              />
            </motion.div>

            {/* Next */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-elevated"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-surface/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
