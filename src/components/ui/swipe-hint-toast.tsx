"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MoveHorizontal, X } from "lucide-react";

const SESSION_KEY = "hammah-collection-swipe-hint";

interface SwipeHintToastProps {
  triggerId: string;
  delay?: number;
  duration?: number;
}

export function SwipeHintToast({
  triggerId,
  delay = 800,
  duration = 4500,
}: SwipeHintToastProps) {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownRef = useRef(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  useEffect(() => {
    // Already shown this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

    const el = document.getElementById(triggerId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasShownRef.current) {
          hasShownRef.current = true;
          showTimeoutRef.current = setTimeout(() => {
            setVisible(true);
            dismissTimeoutRef.current = setTimeout(dismiss, duration);
          }, delay);
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    };
  }, [triggerId, delay, duration, dismiss]);

  // Reduced motion: show instantly without animation, skip motion wrapper
  if (shouldReduceMotion) {
    if (!visible) return null;
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-auto md:hidden mb-[calc(20px+env(safe-area-inset-bottom))]"
      >
        <div
          className="mx-4 max-w-[calc(100vw-32px)] rounded-lg px-4 py-3"
          style={{
            background: "rgba(17,17,16,0.90)",
            border: "1px solid rgba(247,245,241,0.16)",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(247,245,241,0.06)",
          }}
        >
          <div className="flex items-start gap-3">
            <MoveHorizontal
              className="mt-0.5 shrink-0"
              size={16}
              strokeWidth={1.8}
              style={{ color: "#79583A" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "#F7F5F1" }}>
                Swipe to see more.
              </p>
              <p
                className="mt-0.5 text-xs leading-relaxed"
                style={{ color: "rgba(247,245,241,0.62)" }}
              >
                Swipe a piece left or right to explore more views without
                leaving the collection.
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss swipe hint"
              className="shrink-0 mt-0.5 p-1 -mr-1 rounded transition-colors"
              style={{ color: "rgba(247,245,241,0.45)" }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none md:hidden">
      <AnimatePresence>
        {visible && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              duration: 0.26,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="pointer-events-auto mx-4 mb-[calc(20px+env(safe-area-inset-bottom))] max-w-[calc(100vw-32px)] rounded-lg px-4 py-3 backdrop-blur-md"
            style={{
              background: "rgba(17,17,16,0.90)",
              border: "1px solid rgba(247,245,241,0.16)",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(247,245,241,0.06)",
            }}
          >
            <div className="flex items-start gap-3">
              <MoveHorizontal
                className="mt-0.5 shrink-0"
                size={16}
                strokeWidth={1.8}
                style={{ color: "#79583A" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "#F7F5F1" }}>
                  Swipe to see more.
                </p>
                <p
                  className="mt-0.5 text-xs leading-relaxed"
                  style={{ color: "rgba(247,245,241,0.62)" }}
                >
                  Swipe a piece left or right to explore more views without
                  leaving the collection.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss swipe hint"
                className="shrink-0 mt-0.5 p-1 -mr-1 rounded transition-colors"
                style={{ color: "rgba(247,245,241,0.45)" }}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
