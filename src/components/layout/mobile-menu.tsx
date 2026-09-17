"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  primaryNavigation,
  categoryNavigation,
  utilityNavigation,
} from "@/data/navigation";
import type { User } from "@supabase/supabase-js";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  displayName: string;
  onLogout: () => void;
}

const themes = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export function MobileMenu({
  open,
  onClose,
  user,
  displayName,
  onLogout,
}: MobileMenuProps) {
  const { theme, setTheme } = useTheme();
  const closeRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (open && closeRef.current) {
      closeRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-50 bg-overlay"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="fixed inset-y-0 left-0 z-50 flex w-full flex-col overflow-y-auto bg-background sm:w-[420px]"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <BrandLogo variant="secondary" className="h-7 w-auto" />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-6 py-8" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {primaryNavigation.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.35,
                      delay: shouldReduceMotion ? 0 : 0.1 + i * 0.06,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="group flex items-baseline gap-4 py-3 text-2xl font-medium text-foreground transition-colors hover:text-accent"
                    >
                      <span className="text-sm font-normal text-muted-foreground/60">
                        0{i + 1}
                      </span>
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.3,
                    delay: shouldReduceMotion ? 0 : 0.35,
                  }}
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"
                >
                  The Hammah World
                </motion.p>
                <ul className="space-y-1">
                  {categoryNavigation.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.35,
                        delay: shouldReduceMotion ? 0 : 0.4 + i * 0.06,
                        ease: [0.33, 1, 0.68, 1],
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="group flex items-baseline justify-between py-2.5 text-base text-foreground transition-colors hover:text-accent"
                      >
                        <span>{link.label}</span>
                        <span className="text-xs text-muted-foreground/60">
                          {link.href.includes("collection-001")
                            ? "Available now"
                            : "Coming soon"}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Utility links */}
              <div className="mt-8 border-t border-border pt-6">
                <ul className="space-y-1">
                  {utilityNavigation.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.3,
                        delay: shouldReduceMotion ? 0 : 0.55 + i * 0.05,
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="block py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Auth section */}
              <div className="mt-6 border-t border-border pt-6">
                {user ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <p className="mb-3 text-sm font-medium text-foreground">
                      {displayName || "Hamatee"}
                    </p>
                    <div className="space-y-1">
                      <Link
                        href="/account"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account/saved"
                        onClick={onClose}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                      >
                        Saved Pieces
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="flex gap-3"
                  >
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={onClose}
                      className="flex h-10 items-center rounded-md btn-engraved-secondary px-5 text-sm font-medium"
                    >
                      Join the Legacy
                    </Link>
                  </motion.div>
                )}
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                  Follow
                </p>
                <div className="flex gap-4">
                  <span className="text-sm text-muted-foreground">Instagram</span>
                  <span className="text-sm text-muted-foreground">WhatsApp</span>
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Appearance
                </p>
                <div className="flex gap-1">
                  {themes.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        theme === value
                          ? "bg-accent text-accent-foreground"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
