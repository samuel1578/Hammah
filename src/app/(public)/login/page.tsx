"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { getMediaById } from "@/data/media-manifest";

type LoginError = "invalid" | "generic" | "unverified" | null;

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();
  const media = getMediaById("login-editorial");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<LoginError>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Frontend demonstration — no real auth
    setTimeout(() => {
      setIsLoading(false);
      if (!email || !password) {
        setError("invalid");
      } else {
        // Simulate different states for demo
        setError("generic");
      }
    }, 800);
  };

  return (
    <div className="flex min-h-[100svh] flex-col lg:flex-row">
      {/* LEFT — Editorial media */}
      <div className="relative hidden w-full lg:block lg:w-[55%]">
        {media && (
          <div className="absolute inset-0 bg-[#111110]">
            <motion.img
              src={media.currentSrc}
              alt="SL by Hammah — Collection 001 editorial"
              initial={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/90" />
          </div>
        )}
        {/* Brand overlay */}
        <div className="absolute bottom-12 left-12 z-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70"
          >
            SL by Hammah
          </motion.p>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div className="flex w-full flex-col justify-center px-6 py-16 sm:px-10 md:px-16 lg:w-[45%] lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
          >
            The Hammah Legacy
          </motion.p>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
          >
            <h1 className="font-serif italic text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-[3.5rem]">
              Welcome back.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.35 }}
            className="mt-5 text-lg leading-relaxed text-muted-foreground"
          >
            Sign in to return to your Hammah account.
          </motion.p>

          {/* Error messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key={error}
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 overflow-hidden rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                role="alert"
                aria-live="polite"
              >
                {error === "invalid" &&
                  "We couldn\u2019t sign you in with those details. Check your email and password and try again."}
                {error === "generic" &&
                  "Something went wrong while signing you in. Try again."}
                {error === "unverified" &&
                  "Your account is active, but your email still needs to be verified before you can place member orders."}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.4 }}
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            noValidate
          >
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                autoComplete="email"
                required
                placeholder="your@email.com"
                className="h-14 w-full rounded-md border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary CTA */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
              whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
            >
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>

            {/* Google */}
            <button
              type="button"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-md btn-engraved-secondary text-base font-medium"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </motion.form>

          {/* New member prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.6 }}
            className="mt-10 border-t border-border pt-8"
          >
            <p className="text-sm text-muted-foreground">
              Not a Hamatee yet?{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Join the Legacy
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mobile editorial image */}
      <div className="relative h-48 w-full sm:h-64 lg:hidden">
        {media && (
          <img
            src={media.currentSrc}
            alt="SL by Hammah — Collection 001 editorial"
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>
    </div>
  );
}
