"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Copy, Check } from "lucide-react";
import type { Product } from "@/types/products";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  isWhatsAppConfigured,
} from "@/lib/orders/whatsapp";

interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  size: string | null;
  quantity: number;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export function OrderDrawer({
  open,
  onClose,
  product,
  size,
  quantity,
}: OrderDrawerProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [gps, setGps] = useState("");
  const [notes, setNotes] = useState("");

  const closeRef = useRef<HTMLButtonElement>(null);
  const whatsappRef = useRef<HTMLAnchorElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      document.body.classList.add("menu-open");
      closeRef.current?.focus();
      if (!idempotencyKey) {
        setIdempotencyKey(crypto.randomUUID());
      }
    } else if (!open) {
      document.body.classList.remove("menu-open");
    }
    prevOpen.current = open;
    return () => document.body.classList.remove("menu-open");
  }, [open, idempotencyKey]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    if (submitState === "success" && whatsappRef.current) {
      whatsappRef.current.focus();
    }
  }, [submitState]);

  const resetForm = useCallback(() => {
    setName("");
    setPhone("");
    setEmail("");
    setRegion("");
    setCity("");
    setArea("");
    setLandmark("");
    setGps("");
    setNotes("");
    setSubmitState("idle");
    setOrderNumber(null);
    setErrorMessage(null);
    setIdempotencyKey(null);
    setCopied(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleNewOrder = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const handleCopyReference = useCallback(async () => {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const el = document.createElement("textarea");
      el.value = orderNumber;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [orderNumber]);

  const handleSubmit = async () => {
    if (submitState === "submitting") return;

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      setSubmitState("error");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      setSubmitState("error");
      return;
    }
    if (!region.trim()) {
      setErrorMessage("Please enter your delivery region.");
      setSubmitState("error");
      return;
    }
    if (!city.trim()) {
      setErrorMessage("Please enter your city or town.");
      setSubmitState("error");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.dbId,
          variant_value: size,
          quantity,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || null,
          delivery_region: region.trim(),
          delivery_city: city.trim(),
          delivery_area: area.trim() || null,
          delivery_landmark: landmark.trim() || null,
          delivery_gps: gps.trim() || null,
          delivery_notes: notes.trim() || null,
          idempotency_key: idempotencyKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to place order. Please try again.");
        setSubmitState("error");
        return;
      }

      setOrderNumber(data.order_number);
      setSubmitState("success");
      setCopied(false);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitState("error");
    }
  };

  const whatsappMessage =
    orderNumber
      ? buildWhatsAppMessage({
          orderNumber,
          productName: product.name,
          productSlug: product.slug,
          size,
          quantity,
          customerName: name.trim() || "Customer",
          deliveryRegion: region.trim(),
          deliveryCity: city.trim(),
          deliveryGps: gps.trim() || null,
        })
      : "";

  const whatsappUrl = whatsappMessage ? buildWhatsAppUrl(whatsappMessage) : "#";

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
            onClick={handleClose}
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
                {submitState === "success"
                  ? "Order Request Received"
                  : "Order This Piece"}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-6">
              {submitState === "success" ? (
                /* Success state */
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <span className="text-2xl text-accent">&#10003;</span>
                  </div>

                  <h3 className="font-serif italic text-xl text-foreground">
                    ORDER REQUEST RECEIVED
                  </h3>

                  {orderNumber && (
                    <p className="mt-4 font-mono text-2xl font-medium tracking-wider text-foreground">
                      {orderNumber}
                    </p>
                  )}

                  <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                    Your request has been saved. Continue the conversation with
                    HAMMAH on WhatsApp.
                  </p>

                  <div className="mt-8 flex w-full flex-col gap-3">
                    {isWhatsAppConfigured() && (
                      <a
                        ref={whatsappRef}
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 items-center justify-center rounded-md btn-engraved-primary px-6 text-sm font-medium"
                      >
                        Continue on WhatsApp
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyReference}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-accent" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy order reference
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-6 text-xs text-muted-foreground">
                    Hammah will contact you to confirm the next steps, including
                    payment and delivery.
                  </p>

                  <button
                    type="button"
                    onClick={handleNewOrder}
                    className="mt-4 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Place another order
                  </button>
                </div>
              ) : (
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

                  {/* Error message */}
                  {submitState === "error" && errorMessage && (
                    <div
                      className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950"
                      role="alert"
                    >
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Form fields */}
                  <p className="mb-4 text-xs text-muted-foreground" aria-hidden="true">
                    * Required
                  </p>
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
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        required
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
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
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-area"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Area{" "}
                        <span className="text-muted-foreground font-normal">
                          — optional
                        </span>
                      </label>
                      <input
                        id="order-area"
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-landmark"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Landmark{" "}
                        <span className="text-muted-foreground font-normal">
                          — optional
                        </span>
                      </label>
                      <input
                        id="order-landmark"
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-gps"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        GhanaPost GPS / Digital Address{" "}
                        <span className="text-muted-foreground font-normal">
                          — optional
                        </span>
                      </label>
                      <input
                        id="order-gps"
                        type="text"
                        value={gps}
                        onChange={(e) => setGps(e.target.value)}
                        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="order-notes"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Delivery Notes{" "}
                        <span className="text-muted-foreground font-normal">
                          — optional
                        </span>
                      </label>
                      <textarea
                        id="order-notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitState === "submitting"}
                      className="w-full h-12 rounded-md btn-engraved-primary font-medium text-sm disabled:opacity-60"
                    >
                      {submitState === "submitting" ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                          Placing order...
                        </span>
                      ) : (
                        "Place Order Request"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
