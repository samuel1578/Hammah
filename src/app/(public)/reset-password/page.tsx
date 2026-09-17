"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PageState = "form" | "loading" | "success" | "error" | "expired";

export default function ResetPasswordPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pageState, setPageState] = useState<PageState>("form");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setPageState("expired");
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setPageState("loading");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setPageState("error");
        setErrorMessage(
          "Failed to update password. Your reset link may have expired. Please request a new one.",
        );
        return;
      }

      setPageState("success");
    } catch {
      setPageState("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  if (pageState === "expired") {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center"
        >
          <h1 className="font-serif italic text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
            Link expired
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            This password reset link is no longer valid. Please request a new
            one.
          </p>
          <div className="mt-10">
            <Link
              href="/forgot-password"
              className="inline-flex h-14 items-center gap-2 rounded-md bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Request new link
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (pageState === "success") {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10"
          >
            <Check className="h-10 w-10 text-accent" />
          </motion.div>
          <h1 className="font-serif italic text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
            Password updated.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Your password has been changed successfully. You can now sign in
            with your new password.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10"
          >
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex h-14 items-center gap-2 rounded-md bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
        >
          Password Reset
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl"
        >
          New password.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.35 }}
          className="mt-5 text-lg leading-relaxed text-muted-foreground"
        >
          Enter your new password below.
        </motion.p>

        {pageState === "error" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            {errorMessage}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.4 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
          noValidate
        >
          <div>
            <label
              htmlFor="reset-password"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                className="h-14 w-full rounded-md border border-border bg-surface px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="reset-confirm"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="reset-confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="Re-enter your password"
                className="h-14 w-full rounded-md border border-border bg-surface px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={pageState === "loading" || !password || !confirmPassword}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
            whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
          >
            {pageState === "loading" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
            ) : (
              <>
                Update Password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.6 }}
          className="mt-10 border-t border-border pt-8"
        >
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
