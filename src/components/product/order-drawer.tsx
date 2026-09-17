"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Copy, Check } from "lucide-react";
import type { Product } from "@/types/products";
import { createClient } from "@/lib/supabase/client";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  isWhatsAppConfigured,
} from "@/lib/orders/whatsapp";

/* ═══════════════════════════════════════════════════
   ORDER DRAWER

   Two UX states:
   — Guest: full identity + delivery form
   — Authenticated Hamatee: compact identity summary
     + delivery form. Birthday hidden. Optional
     "Use different contact details" override.
   ═══════════════════════════════════════════════════ */

interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  size: string | null;
  quantity: number;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

interface AuthProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

function displayName(p: AuthProfile): string {
  const full = `${p.firstName} ${p.lastName}`.trim();
  return full || "";
}

function displayEmail(p: AuthProfile): string {
  return p.email || "";
}

function displayPhone(p: AuthProfile): string {
  return p.phone || "";
}

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

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

  /* ── Auth state ── */
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [useDifferentContact, setUseDifferentContact] = useState(false);

  /* ── Identity fields ── */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  /* ── Delivery fields ── */
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [gps, setGps] = useState("");
  const [notes, setNotes] = useState("");

  const isAuth = authProfile !== null;

  /* ── Derived validation rules ── */
  // Guest: birthday requires email
  const guestBirthdayRequiresEmail = !isAuth && !!dateOfBirth;
  // Auth: no birthday field, so no email requirement from birthday
  const emailIsRequired = guestBirthdayRequiresEmail;

  // Auth with missing required identity data
  const authMissingPhone = isAuth && !useDifferentContact && !displayPhone(authProfile!);
  const authMissingName = isAuth && !useDifferentContact && !displayName(authProfile!);

  const closeRef = useRef<HTMLButtonElement>(null);
  const whatsappRef = useRef<HTMLAnchorElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const prevOpen = useRef(open);

  /* ── Body scroll lock + idempotency key ── */
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

  /* ── Escape key ── */
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  /* ── Focus success WhatsApp link ── */
  useEffect(() => {
    if (submitState === "success" && whatsappRef.current) {
      whatsappRef.current.focus();
    }
  }, [submitState]);

  /* ── Fetch auth + profile when drawer opens ── */
  useEffect(() => {
    if (!open) {
      setAuthLoading(true);
      return;
    }

    let cancelled = false;

    async function fetchAuthProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (cancelled || !user) {
          if (!cancelled) setAuthLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, phone")
          .eq("id", user.id)
          .single();

        if (cancelled) return;

        const authEmail = user.email ?? "";

        setAuthProfile({
          firstName: profile?.first_name ?? "",
          lastName: profile?.last_name ?? "",
          phone: profile?.phone ?? "",
          email: authEmail,
        });

        // Pre-fill identity fields from profile
        setName(
          `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim(),
        );
        setPhone(profile?.phone ?? "");
        setEmail(authEmail);
      } catch {
        // Auth fetch failed — treat as guest
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    fetchAuthProfile();
    return () => { cancelled = true; };
  }, [open]);

  /* ── Reset form ── */
  const resetForm = useCallback(() => {
    setName("");
    setPhone("");
    setEmail("");
    setDateOfBirth("");
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
    setUseDifferentContact(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    setAuthProfile(null);
    setAuthLoading(true);
    onClose();
  }, [resetForm, onClose]);

  const handleNewOrder = useCallback(() => {
    resetForm();
  }, [resetForm]);

  /* ── Copy order reference ── */
  const handleCopyReference = useCallback(async () => {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  /* ── Determine which identity fields to use for submission ── */
  function getSubmitIdentity() {
    if (isAuth && !useDifferentContact) {
      // Use profile data directly
      return {
        customer_name: displayName(authProfile!),
        customer_phone: displayPhone(authProfile!),
        customer_email: displayEmail(authProfile!) || null,
      };
    }
    // Guest or override: use form values
    return {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: email.trim() || null,
    };
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (submitState === "submitting") return;

    // Defence-in-depth: block if product has variants but no size selected
    if (product.variants.length > 0 && !size) {
      setErrorMessage("Please select a size first.");
      setSubmitState("error");
      return;
    }

    const identity = getSubmitIdentity();

    // Validate identity
    if (!identity.customer_name) {
      setErrorMessage("Please enter your name.");
      setSubmitState("error");
      return;
    }
    if (!identity.customer_phone) {
      setErrorMessage("Please enter your phone number.");
      setSubmitState("error");
      return;
    }

    // Validate delivery
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

    // Guest: conditional email validation
    if (!isAuth && dateOfBirth && !email.trim()) {
      setErrorMessage("Email is required when birthday is provided.");
      setSubmitState("error");
      return;
    }

    // Guest: validate DOB is not future
    if (!isAuth && dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        setErrorMessage("Please enter a valid birthday.");
        setSubmitState("error");
        return;
      }
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
          customer_name: identity.customer_name,
          customer_phone: identity.customer_phone,
          customer_email: identity.customer_email,
          delivery_region: region.trim(),
          delivery_city: city.trim(),
          delivery_area: area.trim() || null,
          delivery_landmark: landmark.trim() || null,
          delivery_gps: gps.trim() || null,
          delivery_notes: notes.trim() || null,
          idempotency_key: idempotencyKey,
          date_of_birth: isAuth ? null : (dateOfBirth || null),
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

  /* ── WhatsApp message uses profile name or form name ── */
  const whatsappName = isAuth && !useDifferentContact
    ? displayName(authProfile!) || "Customer"
    : name.trim() || "Customer";

  const whatsappPhone = isAuth && !useDifferentContact
    ? displayPhone(authProfile!) || ""
    : phone.trim();

  const whatsappEmail = isAuth && !useDifferentContact
    ? displayEmail(authProfile!) || null
    : email.trim() || null;

  const whatsappMessage =
    orderNumber
      ? buildWhatsAppMessage({
          orderNumber,
          productName: product.name,
          productSlug: product.slug,
          size,
          quantity,
          customerName: whatsappName,
          customerPhone: whatsappPhone,
          customerEmail: whatsappEmail,
          deliveryRegion: region.trim(),
          deliveryCity: city.trim(),
          deliveryArea: area.trim() || null,
          deliveryLandmark: landmark.trim() || null,
          deliveryGps: gps.trim() || null,
          deliveryNotes: notes.trim() || null,
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
                /* ═══════════════════════════════
                   SUCCESS STATE
                   ═══════════════════════════════ */
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
                  {/* ── Product summary ── */}
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

                  {/* ── Error message ── */}
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

                  {/* ═══════════════════════════════
                      AUTHENTICATED IDENTITY SUMMARY
                      ═══════════════════════════════ */}
                  {isAuth && !authLoading && (
                    <AuthenticatedIdentity
                      profile={authProfile!}
                      useDifferentContact={useDifferentContact}
                      onToggleDifferentContact={() =>
                        setUseDifferentContact((v) => !v)
                      }
                    />
                  )}

                  {/* ═══════════════════════════════
                      IDENTITY FIELDS
                      ═══════════════════════════════ */}
                  {!isAuth && (
                    /* Guest: full identity form */
                    <>
                      <p className="mb-4 text-xs text-muted-foreground" aria-hidden="true">
                        * Required
                      </p>
                      <GuestIdentityFields
                        name={name}
                        onNameChange={setName}
                        phone={phone}
                        onPhoneChange={setPhone}
                        email={email}
                        onEmailChange={setEmail}
                        emailRequired={emailIsRequired}
                        dateOfBirth={dateOfBirth}
                        onDateOfBirthChange={setDateOfBirth}
                      />
                    </>
                  )}

                  {isAuth && useDifferentContact && (
                    /* Authenticated override: editable identity fields */
                    <OverrideIdentityFields
                      name={name}
                      onNameChange={setName}
                      phone={phone}
                      onPhoneChange={setPhone}
                      email={email}
                      onEmailChange={setEmail}
                    />
                  )}

                  {isAuth && !useDifferentContact && (authMissingPhone || authMissingName) && (
                    /* Auth with missing required data: show only what's missing */
                    <MissingIdentityFields
                      missingName={authMissingName}
                      missingPhone={authMissingPhone}
                      name={name}
                      onNameChange={setName}
                      phone={phone}
                      onPhoneChange={setPhone}
                    />
                  )}

                  {/* ═══════════════════════════════
                      DELIVERY FIELDS
                      ═══════════════════════════════ */}
                  <DeliveryFields
                    region={region}
                    onRegionChange={setRegion}
                    city={city}
                    onCityChange={setCity}
                    area={area}
                    onAreaChange={setArea}
                    landmark={landmark}
                    onLandmarkChange={setLandmark}
                    gps={gps}
                    onGpsChange={setGps}
                    notes={notes}
                    onNotesChange={setNotes}
                  />

                  {/* ── Submit ── */}
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

/* ═══════════════════════════════════════════════════
   AUTHENTICATED IDENTITY SUMMARY
   Compact display for logged-in Hamatees.
   ═══════════════════════════════════════════════════ */

function AuthenticatedIdentity({
  profile,
  useDifferentContact,
  onToggleDifferentContact,
}: {
  profile: AuthProfile;
  useDifferentContact: boolean;
  onToggleDifferentContact: () => void;
}) {
  const name = displayName(profile);
  const email = displayEmail(profile);
  const phone = displayPhone(profile);

  return (
    <div className="mb-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {useDifferentContact ? "Contact details for this order" : "Ordering as"}
      </p>

      {!useDifferentContact ? (
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="space-y-0.5">
            {name && (
              <p className="text-sm font-medium text-foreground">{name}</p>
            )}
            {email && (
              <p className="text-xs text-muted-foreground">{email}</p>
            )}
            {phone && (
              <p className="text-xs text-muted-foreground">{phone}</p>
            )}
            <p className="mt-1 inline-block rounded bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
              Hamatee
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleDifferentContact}
            className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Use different contact details
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-2">
          <p className="text-xs text-muted-foreground">
            {name || "No name"} · {phone || "No phone"}
          </p>
          <button
            type="button"
            onClick={onToggleDifferentContact}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Use my details
          </button>
        </div>
      )}

      {/* Profile management link */}
      {!useDifferentContact && (
        <a
          href="/account/profile"
          className="mt-2 inline-block text-[11px] text-muted-foreground/70 hover:text-muted-foreground"
        >
          Manage profile
        </a>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GUEST IDENTITY FIELDS
   Full identity form for unauthenticated users.
   ═══════════════════════════════════════════════════ */

function GuestIdentityFields({
  name,
  onNameChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  emailRequired,
  dateOfBirth,
  onDateOfBirthChange,
}: {
  name: string;
  onNameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  emailRequired: boolean;
  dateOfBirth: string;
  onDateOfBirthChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="order-name"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Name <span className="text-muted-foreground font-normal">*</span>
        </label>
        <input
          id="order-name"
          type="text"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label
          htmlFor="order-phone"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Phone / WhatsApp <span className="text-muted-foreground font-normal">*</span>
        </label>
        <input
          id="order-phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
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
            {emailRequired ? "* — required for Hamatee" : "— optional"}
          </span>
        </label>
        <input
          id="order-email"
          type="email"
          required={emailRequired}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="order-dob"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Birthday{" "}
          <span className="text-muted-foreground font-normal">
            — optional
          </span>
        </label>
        <input
          id="order-dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => onDateOfBirthChange(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Add your birthday to join Hamatee. If you add it, we&apos;ll also need your email so you can activate your account.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   OVERRIDE IDENTITY FIELDS
   Editable fields when "Use different contact details"
   is active. Changes affect order only, not profile.
   ═══════════════════════════════════════════════════ */

function OverrideIdentityFields({
  name,
  onNameChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
}: {
  name: string;
  onNameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
}) {
  return (
    <div className="mb-6 space-y-4">
      <div>
        <label
          htmlFor="order-name-override"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Name <span className="text-muted-foreground font-normal">*</span>
        </label>
        <input
          id="order-name-override"
          type="text"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label
          htmlFor="order-phone-override"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Phone / WhatsApp <span className="text-muted-foreground font-normal">*</span>
        </label>
        <input
          id="order-phone-override"
          type="tel"
          required
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="+233 ..."
        />
      </div>
      <div>
        <label
          htmlFor="order-email-override"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Email <span className="text-muted-foreground font-normal">— optional</span>
        </label>
        <input
          id="order-email-override"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="you@example.com"
        />
      </div>
      <p className="text-[11px] text-muted-foreground/70">
        These details apply only to this order. Your profile remains unchanged.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MISSING IDENTITY FIELDS
   Shown when authenticated user has incomplete
   profile data (missing name or phone).
   ═══════════════════════════════════════════════════ */

function MissingIdentityFields({
  missingName,
  missingPhone,
  name,
  onNameChange,
  phone,
  onPhoneChange,
}: {
  missingName: boolean;
  missingPhone: boolean;
  name: string;
  onNameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
}) {
  return (
    <div className="mb-6 space-y-4">
      {missingName && (
        <div>
          <label
            htmlFor="order-name-missing"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Name <span className="text-muted-foreground font-normal">*</span>
          </label>
          <input
            id="order-name-missing"
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Your full name"
          />
        </div>
      )}
      {missingPhone && (
        <div>
          <label
            htmlFor="order-phone-missing"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Phone / WhatsApp <span className="text-muted-foreground font-normal">*</span>
          </label>
          <input
            id="order-phone-missing"
            type="tel"
            required
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="+233 ..."
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DELIVERY FIELDS
   Order-specific. Same for guest and authenticated.
   ═══════════════════════════════════════════════════ */

function DeliveryFields({
  region,
  onRegionChange,
  city,
  onCityChange,
  area,
  onAreaChange,
  landmark,
  onLandmarkChange,
  gps,
  onGpsChange,
  notes,
  onNotesChange,
}: {
  region: string;
  onRegionChange: (v: string) => void;
  city: string;
  onCityChange: (v: string) => void;
  area: string;
  onAreaChange: (v: string) => void;
  landmark: string;
  onLandmarkChange: (v: string) => void;
  gps: string;
  onGpsChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Delivery
      </p>
      <div>
        <label
          htmlFor="order-region"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Region <span className="text-muted-foreground font-normal">*</span>
        </label>
        <input
          id="order-region"
          type="text"
          required
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="e.g. Greater Accra"
        />
      </div>
      <div>
        <label
          htmlFor="order-city"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          City / Town <span className="text-muted-foreground font-normal">*</span>
        </label>
        <input
          id="order-city"
          type="text"
          required
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
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
          onChange={(e) => onAreaChange(e.target.value)}
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
          onChange={(e) => onLandmarkChange(e.target.value)}
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
          onChange={(e) => onGpsChange(e.target.value)}
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
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
    </div>
  );
}
