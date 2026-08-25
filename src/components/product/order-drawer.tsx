"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { Product } from "@/types/products";

interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  size: string | null;
  quantity: number;
}

export function OrderDrawer({
  open,
  onClose,
  product,
  size,
  quantity,
}: OrderDrawerProps) {
  const [submitted, setSubmitted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      document.body.classList.add("menu-open");
      closeRef.current?.focus();
    } else if (!open) {
      document.body.classList.remove("menu-open");
    }
    prevOpen.current = open;
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[90] bg-overlay"
            onClick={() => { setSubmitted(false); onClose(); }}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.35,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-md flex-col overflow-y-auto bg-background shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Order this piece"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-serif italic text-lg text-foreground">
                {submitted ? "Order Confirmed" : "Order This Piece"}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => { setSubmitted(false); onClose(); }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-6">
              {!submitted ? (
                <>
                  {/* Intro */}
                  <p className="mb-6 text-sm text-muted-foreground">
                    Confirm the piece and tell Hammah where to reach you.
                  </p>

                  {/* Order summary */}
                  <div className="mb-6 rounded-md border border-border bg-surface p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden bg-muted">
                        <img
                          src={product.media.primary}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Collection 001
                        </p>
                        {size && (
                          <p className="text-xs text-muted-foreground">
                            Size: {size}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Qty: {quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Price on request
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields — frontend only */}
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="order-name"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="order-name"
                        type="text"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-phone"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Phone / WhatsApp
                      </label>
                      <input
                        id="order-phone"
                        type="tel"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+233 ..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-email"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Email{" "}
                        <span className="text-muted-foreground font-normal">
                          — optional
                        </span>
                      </label>
                      <input
                        id="order-email"
                        type="email"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-region"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Region
                      </label>
                      <input
                        id="order-region"
                        type="text"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="e.g. Greater Accra"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-city"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        City / Town
                      </label>
                      <input
                        id="order-city"
                        type="text"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-area"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Area
                      </label>
                      <input
                        id="order-area"
                        type="text"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-landmark"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Landmark
                      </label>
                      <input
                        id="order-landmark"
                        type="text"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-gps"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        GhanaPost GPS / Digital Address
                      </label>
                      <input
                        id="order-gps"
                        type="text"
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-notes"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Delivery Notes
                      </label>
                      <textarea
                        id="order-notes"
                        rows={3}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setSubmitted(true)}
                      className="w-full h-12 rounded-md btn-engraved-primary font-medium text-sm"
                    >
                      Place Order Request
                    </button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      This is a frontend demonstration only.
                    </p>
                  </div>
                </>
              ) : (
                /* Success state */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <span className="text-2xl text-accent">✓</span>
                  </div>
                  <h3 className="font-serif italic text-2xl text-foreground">
                    Your order request is in.
                  </h3>
                  <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                    This is currently a frontend demonstration. Live order
                    processing will be connected in a later backend sprint.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSubmitted(false); onClose(); }}
                    className="mt-8 h-10 rounded-md btn-engraved-secondary px-6 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
