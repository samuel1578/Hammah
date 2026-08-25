"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface StickyMobileCTAProps {
  productName: string;
  onOrderClick: () => void;
}

export function StickyMobileCTA({
  productName,
  onOrderClick,
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? {} : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1 truncate text-sm font-medium text-foreground">
              {productName}
            </span>
            <button
              type="button"
              onClick={onOrderClick}
              className="flex-shrink-0 h-10 rounded-md btn-engraved-primary px-4 text-sm font-medium"
            >
              Order This Piece
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
