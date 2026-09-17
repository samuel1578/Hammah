"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { getMediaById } from "@/data/media-manifest";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | 2;
type PageState = "form" | "loading" | "verify-email" | "error";
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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [pageState, setPageState] = useState<PageState>("form");
  const [globalError, setGlobalError] = useState("");

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
    if (!dateOfBirth.trim()) e.dateOfBirth = "Your birthday is required";
    else {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) e.dateOfBirth = "Please enter a valid date";
      else if (dob > new Date()) e.dateOfBirth = "Birthday cannot be in the future";
    }
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!agreeTerms) e.terms = "You must agree to the Terms & Conditions";
    if (!agreePrivacy) e.privacy = "You must acknowledge the Privacy Policy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    if (validateStep1()) goToStep(2);
  };

  const handleStep2Submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setPageState("loading");
    setGlobalError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
            date_of_birth: dateOfBirth.trim() || null,
          },
        },
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already")) {
          setGlobalError("An account with this email already exists. Please sign in instead.");
        } else if (msg.includes("valid email")) {
          setGlobalError("Please enter a valid email address.");
        } else if (msg.includes("password")) {
          setGlobalError("Password does not meet requirements. Please use at least 8 characters.");
        } else {
          setGlobalError("Something went wrong creating your account. Please try again.");
        }
        setPageState("error");
        return;
      }

      setPageState("verify-email");
    } catch {
      setGlobalError("Network error. Please check your connection and try again.");
      setPageState("error");
    }
  };

  // Email verification state
  if (pageState === "verify-email") {
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
          <h1 className="font-serif italic text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Check your email.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Click the link in your email to verify your account and complete
            signup.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col gap-3"
          >
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-accent px-8 text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Go to Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder.
            </p>
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
            Join HAMMAH
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

          {/* Global error */}
          {pageState === "error" && globalError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              role="alert"
            >
              {globalError}
            </motion.div>
          )}

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

                  {/* Birthday */}
                  <div>
                    <label
                      htmlFor="signup-dob"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Birthday
                    </label>
                    <input
                      id="signup-dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      autoComplete="bday"
                      required
                      className={`h-14 w-full rounded-md border bg-surface px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
                        errors.dateOfBirth ? "border-red-400" : "border-border"
                      }`}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your birthday matters to us. HAMMAH wants every Hamatee to
                      feel remembered when their day comes around.
                    </p>
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

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
                        placeholder="At least 8 characters"
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
                    disabled={pageState === "loading"}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-accent text-base font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
                    whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
                  >
                    {pageState === "loading" ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                    ) : (
                      <>
                        Become a Hamatee
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
