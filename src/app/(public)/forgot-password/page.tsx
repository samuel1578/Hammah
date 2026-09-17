"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type PageState = "form" | "loading" | "sent" | "error";

export default function ForgotPasswordPage() {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [pageState, setPageState] = useState<PageState>("form");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setPageState("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setPageState("error");
        setErrorMessage(
          "Something went wrong sending the reset email. Please try again.",
        );
        return;
      }

      setPageState("sent");
    } catch {
      setPageState("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  if (pageState === "sent") {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-serif italic text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
            Check your email.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>, we
            &apos;ve sent a link to reset your password.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or try again.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col gap-3"
          >
            <button
              type="button"
              onClick={() => {
                setPageState("form");
                setEmail("");
              }}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Try another email
            </button>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to sign in
            </Link>
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
          Forgot your password?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.35 }}
          className="mt-5 text-lg leading-relaxed text-muted-foreground"
        >
          Enter your email and we&apos;ll send you a link to reset your
          password.
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
              htmlFor="forgot-email"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="your@email.com"
              className="h-14 w-full rounded-md border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <motion.button
            type="submit"
            disabled={pageState === "loading" || !email.trim()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
            whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
          >
            {pageState === "loading" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
            ) : (
              <>
                Send Reset Link
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
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
