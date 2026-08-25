"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Search, ArrowRight, Package, Check } from "lucide-react";

type TrackState = "lookup" | "result" | "error";

const TIMELINE_STEPS = [
  { id: 1, label: "Request Received", status: "completed" },
  { id: 2, label: "Contacted", status: "completed" },
  { id: 3, label: "Confirmed", status: "completed" },
  { id: 4, label: "In Preparation", status: "current" },
  { id: 5, label: "Ready", status: "upcoming" },
  { id: 6, label: "Out for Delivery", status: "upcoming" },
  { id: 7, label: "Delivered", status: "upcoming" },
] as const;

export default function TrackPage() {
  const shouldReduceMotion = useReducedMotion();

  const [orderRef, setOrderRef] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [state, setState] = useState<TrackState>("lookup");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orderRef.trim() && !trackingCode.trim()) return;
    setIsLoading(true);
    // Frontend demonstration — no real order lookup
    setTimeout(() => {
      setIsLoading(false);
      if (orderRef && trackingCode) {
        setState("result");
      } else {
        setState("error");
      }
    }, 1000);
  };

  return (
    <div className="min-h-[100svh]">
      <AnimatePresence mode="wait">
        {/* ═══ LOOKUP STATE ═══ */}
        {state === "lookup" && (
          <motion.div
            key="lookup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl px-6 py-20 sm:px-10 md:py-28 lg:py-36"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
            >
              Order Tracking
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              Track your order.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Use the reference and tracking information provided after your
              order request.
            </motion.p>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="mt-12 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Order Reference */}
                <div>
                  <label
                    htmlFor="track-ref"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Order Reference
                  </label>
                  <input
                    id="track-ref"
                    type="text"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    required
                    placeholder="HAM-XXXX-XXX"
                    className="h-14 w-full rounded-md border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Tracking Code */}
                <div>
                  <label
                    htmlFor="track-code"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Tracking Code
                  </label>
                  <input
                    id="track-code"
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    required
                    placeholder="Enter tracking code"
                    className="h-14 w-full rounded-md border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="flex h-14 items-center gap-2 rounded-md bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
                whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Track Order
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Help text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 border-t border-border pt-8"
            >
              <p className="text-sm text-muted-foreground">
                Can&apos;t find your tracking details? Contact Hammah and
                we&apos;ll help you locate your order.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ ERROR STATE ═══ */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-3xl px-6 py-20 sm:px-10 md:py-28"
          >
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm font-medium text-red-800 dark:text-red-200" role="alert">
                Please enter both an order reference and tracking code to look up
                your order.
              </p>
            </div>
            <button
              onClick={() => {
                setState("lookup");
                setOrderRef("");
                setTrackingCode("");
              }}
              className="mt-6 text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* ═══ RESULT STATE ═══ */}
        {state === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-4xl px-6 py-16 sm:px-10 md:py-24"
          >
            {/* Order summary header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Order Tracking
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h1 className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl">
                    Order HAM-EXAMPLE-001
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Design 01 — Collection 001
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Status cards */}
            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Current Status
                </p>
                <p className="mt-2 text-xl font-medium text-foreground">
                  In Preparation
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-lg border border-border bg-surface p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Payment Status
                </p>
                <p className="mt-2 text-xl font-medium text-foreground">
                  Not Required Yet
                </p>
              </motion.div>
            </div>

            {/* Latest update */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 rounded-lg border border-border bg-surface p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Latest Update
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                Your order is currently being prepared. Hammah will contact you
                when the next step is ready.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Frontend demonstration only. This is not a real order.
              </p>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12"
            >
              <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Order Journey
              </h2>

              {/* Desktop horizontal timeline */}
              <div className="hidden md:block">
                <div className="relative flex items-start justify-between">
                  {/* Connecting line */}
                  <div className="absolute left-0 right-0 top-5 h-px bg-border" />
                  <motion.div
                    className="absolute left-0 top-5 h-px bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "42.8%" }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  />

                  {TIMELINE_STEPS.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: shouldReduceMotion ? 0 : 0.5 + i * 0.08,
                      }}
                      className="relative flex flex-col items-center text-center"
                      style={{ width: `${100 / TIMELINE_STEPS.length}%` }}
                    >
                      {/* Node */}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          step.status === "completed"
                            ? "border-accent bg-accent text-accent-foreground"
                            : step.status === "current"
                              ? "border-accent bg-background text-accent"
                              : "border-border bg-surface text-muted-foreground"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-semibold">
                            {step.id}
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <p
                        className={`mt-3 text-xs font-medium ${
                          step.status === "current"
                            ? "text-accent font-semibold"
                            : step.status === "completed"
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>

                      {/* Current pulse */}
                      {step.status === "current" && (
                        <motion.div
                          className="absolute -top-0.5 h-12 w-12 rounded-full border-2 border-accent/30"
                          animate={
                            shouldReduceMotion
                              ? {}
                              : {
                                  scale: [1, 1.5],
                                  opacity: [0.5, 0],
                                }
                          }
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mobile vertical timeline */}
              <div className="space-y-0 md:hidden">
                {TIMELINE_STEPS.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: shouldReduceMotion ? 0 : 0.4 + i * 0.06,
                    }}
                    className="flex gap-4"
                  >
                    {/* Node + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                          step.status === "completed"
                            ? "border-accent bg-accent text-accent-foreground"
                            : step.status === "current"
                              ? "border-accent bg-background text-accent"
                              : "border-border bg-surface text-muted-foreground"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-semibold">
                            {step.id}
                          </span>
                        )}
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={`w-px flex-1 ${
                            step.status === "completed"
                              ? "bg-accent"
                              : "bg-border"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-8 pt-2">
                      <p
                        className={`text-sm font-medium ${
                          step.status === "current"
                            ? "text-accent font-semibold"
                            : step.status === "completed"
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.status === "current" && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Current stage
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="mt-12 flex flex-wrap gap-4"
            >
              <button
                onClick={() => {
                  setState("lookup");
                  setOrderRef("");
                  setTrackingCode("");
                }}
                className="flex h-12 items-center gap-2 rounded-md btn-engraved-secondary px-6 text-sm font-medium"
              >
                Track Another Order
              </button>
            </motion.div>

            {/* Membership CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-16 border-t border-border pt-12"
            >
              <div className="max-w-lg">
                <h2 className="font-serif italic text-2xl tracking-tight text-foreground sm:text-3xl">
                  Want all your orders in one place?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Join the Hammah Legacy to keep future Hammah orders connected
                  to your account.
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Join the Legacy
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
