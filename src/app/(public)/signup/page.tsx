"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { getMediaById } from "@/data/media-manifest";

type Step = 1 | 2;
type SignupSuccess = "complete" | "google-profile" | null;
type FieldErrors = Record<string, string>;

export default function SignupPage() {
  const shouldReduceMotion = useReducedMotion();
  const media2 = getMediaById("signup-step-02");
  const activeMedia = media2;

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 fields
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<SignupSuccess>(null);
  const [isLoading, setIsLoading] = useState(false);

  const goToStep = (target: Step) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    setErrors({});
  };

  const validateStep1 = (): boolean => {
    const e: FieldErrors = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address";
    if (!phone.trim()) e.phone = "Phone / WhatsApp is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: FieldErrors = {};
    if (!password) e.password = "Password is required";
    if (!agreeTerms) e.terms = "You must agree to the Terms & Conditions";
    if (!agreePrivacy) e.privacy = "You must acknowledge the Privacy Policy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    if (validateStep1()) goToStep(2);
  };

  const handleStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsLoading(true);
    // Frontend demonstration — no real signup
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("complete");
    }, 1000);
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("google-profile");
    }, 800);
  };

  // Google profile completion state
  if (success === "google-profile") {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center"
        >
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Check className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-serif italic text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
            One last thing.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Where can Hammah reach you?
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSuccess("complete");
            }}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="google-phone"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Phone / WhatsApp
              </label>
              <input
                id="google-phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+233 XX XXX XXXX"
                className="h-14 w-full rounded-md border border-border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Complete Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Frontend demonstration only. Live account creation will be connected
            in the Appwrite authentication phase.
          </p>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success === "complete") {
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
          <h1 className="font-serif italic text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Welcome to the Hammah Legacy.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Your Hamatee account has been created.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Frontend demonstration only. Live account creation will be connected
            in the Appwrite authentication phase.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10"
          >
            <Link
              href="/legacy"
              className="inline-flex h-14 items-center gap-2 rounded-md bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Enter the Legacy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Step variants for directional transitions
  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div className="flex min-h-[100svh] flex-col lg:flex-row">
      {/* LEFT — Editorial media + progress */}
      <div className="relative hidden w-full bg-[#111110] lg:block lg:w-[55%]">
        {activeMedia && (
          <motion.img
            key={step}
            src={activeMedia.currentSrc}
            alt="SL by Hammah — Collection 001 editorial"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/90" />

        {/* Progress on media panel */}
        <div className="absolute bottom-12 left-12 z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <span
              className={`text-sm font-semibold tracking-widest ${
                step === 1 ? "text-white" : "text-white/40"
              }`}
            >
              01
            </span>
            <div className="h-px w-16 bg-white/20">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: step === 2 ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span
              className={`text-sm font-semibold tracking-widest ${
                step === 2 ? "text-white" : "text-white/40"
              }`}
            >
              02
            </span>
          </motion.div>
        </div>

        {/* Brand */}
        <div className="absolute top-12 left-12 z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            SL by Hammah
          </p>
        </div>
      </div>

      {/* RIGHT — Signup form */}
      <div className="flex w-full flex-col justify-center px-6 py-16 sm:px-10 md:px-16 lg:w-[45%] lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile progress */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span
              className={`text-xs font-semibold tracking-widest ${
                step === 1
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              STEP 01
            </span>
            <div className="h-px flex-1 bg-border">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: step === 2 ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span
              className={`text-xs font-semibold tracking-widest ${
                step === 2
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              STEP 02
            </span>
          </div>

          {/* Intro */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
          >
            Join the Hammah Legacy
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif italic text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[3.2rem]"
          >
            Become a Hamatee.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-base text-muted-foreground"
          >
            Create your Hammah account in two short steps.
          </motion.p>

          {/* Steps */}
          <div className="relative mt-10 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.form
                  key="step1"
                  custom={direction}
                  variants={shouldReduceMotion ? undefined : stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                  onSubmit={handleStep1Submit}
                  className="space-y-5"
                  noValidate
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Step 1 of 2
                  </p>
                  <h2 className="text-xl font-medium text-foreground">
                    Start with you.
                  </h2>

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="signup-first"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      First Name
                    </label>
                    <input
                      id="signup-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      required
                      className={`h-14 w-full rounded-md border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.firstName ? "border-red-400" : "border-border"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="signup-last"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Last Name
                    </label>
                    <input
                      id="signup-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      required
                      className={`h-14 w-full rounded-md border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.lastName ? "border-red-400" : "border-border"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="signup-email"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      placeholder="your@email.com"
                      className={`h-14 w-full rounded-md border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.email ? "border-red-400" : "border-border"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="signup-phone"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Phone / WhatsApp
                    </label>
                    <input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      required
                      placeholder="+233 XX XXX XXXX"
                      className={`h-14 w-full rounded-md border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.phone ? "border-red-400" : "border-border"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-md btn-engraved-secondary text-base font-medium"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  custom={direction}
                  variants={shouldReduceMotion ? undefined : stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                  onSubmit={handleStep2Submit}
                  className="space-y-5"
                  noValidate
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Step 2 of 2
                  </p>
                  <h2 className="text-xl font-medium text-foreground">
                    Create your account.
                  </h2>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        placeholder="Create a password"
                        className={`h-14 w-full rounded-md border bg-surface px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
                          errors.password ? "border-red-400" : "border-border"
                        }`}
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
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Terms checkbox */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-border accent-accent"
                      />
                      <span className="text-sm text-foreground">
                        I agree to the{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-accent">
                          Terms &amp; Conditions
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Privacy checkbox */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-border accent-accent"
                      />
                      <span className="text-sm text-foreground">
                        I acknowledge the{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-accent">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.privacy && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.privacy}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
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
                        Join the Legacy
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="flex h-12 w-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Login link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 border-t border-border pt-8"
          >
            <p className="text-sm text-muted-foreground">
              Already a Hamatee?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
