"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Loader2 } from "lucide-react";

interface SizeGuideRow {
  size_label: string;
  measurements: Record<string, string>;
}

interface SizeGuideData {
  name: string;
  unit: string;
  description: string | null;
  size_guide_rows: SizeGuideRow[];
}

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
  sizeGuideId: string;
}

export function SizeGuideModal({ open, onClose, sizeGuideId }: SizeGuideModalProps) {
  const [guide, setGuide] = useState<SizeGuideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const fetchGuide = useCallback(async () => {
    if (!open || !sizeGuideId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/size-guides/${sizeGuideId}`);
      if (!res.ok) throw new Error("Failed to load size guide");
      const data = await res.json();
      setGuide(data);
    } catch {
      setError("Could not load size guide.");
    } finally {
      setLoading(false);
    }
  }, [open, sizeGuideId]);

  useEffect(() => {
    fetchGuide();
  }, [fetchGuide]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("menu-open");
      setTimeout(() => closeRef.current?.focus(), 50);
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const measurementKeys =
    guide?.size_guide_rows[0]
      ? Object.keys(guide.size_guide_rows[0].measurements)
      : [];

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
            className="fixed inset-0 z-[100] bg-overlay"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog — desktop: centered modal, mobile: bottom sheet */}
          <motion.div
            ref={dialogRef}
            initial={shouldReduceMotion ? {} : { y: "100%" }}
            animate={{ y: "0%" }}
            exit={shouldReduceMotion ? {} : { y: "100%" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="fixed inset-x-0 bottom-0 z-[101] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background shadow-xl sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <h2 className="font-serif italic text-lg text-foreground">
                {guide?.name ?? "Size Guide"}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                aria-label="Close size guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {error && (
                <p className="py-8 text-center text-sm text-muted-foreground">{error}</p>
              )}

              {guide && !loading && (
                <div className="space-y-4">
                  {guide.description && (
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Measurements in {guide.unit}
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Size
                          </th>
                          {measurementKeys.map((key) => (
                            <th
                              key={key}
                              className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {guide.size_guide_rows
                          .sort((a, b) => {
                            const labels = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];
                            const ai = labels.indexOf(a.size_label.toLowerCase());
                            const bi = labels.indexOf(b.size_label.toLowerCase());
                            if (ai !== -1 && bi !== -1) return ai - bi;
                            if (ai !== -1) return -1;
                            if (bi !== -1) return 1;
                            return a.size_label.localeCompare(b.size_label);
                          })
                          .map((row) => (
                            <tr key={row.size_label} className="border-b border-border/50">
                              <td className="py-2.5 pr-4 font-medium text-foreground">
                                {row.size_label}
                              </td>
                              {measurementKeys.map((key) => (
                                <td
                                  key={key}
                                  className="py-2.5 px-3 text-muted-foreground"
                                >
                                  {row.measurements[key] ?? "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
