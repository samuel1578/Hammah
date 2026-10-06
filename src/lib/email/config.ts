/**
 * HAMMAH — Brevo configuration (server-only)
 *
 * Single source of truth for Brevo credentials and template IDs.
 * No other module in the application should read `process.env.BREVO_*`
 * directly — import these accessors instead.
 *
 * Validation is lazy (read at send time) so that merely importing this
 * module never crashes an unrelated build or route that is not sending
 * email. Missing configuration fails clearly when a send is attempted.
 *
 * NEVER expose these values to the browser. There is deliberately no
 * `NEXT_PUBLIC_` variant of any Brevo variable.
 */
import { assertServerRuntime } from "./guard";

export class BrevoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrevoConfigError";
  }
}

/**
 * Template-key → environment-variable name map.
 *
 * This is the low-level env layer. The human-readable template registry
 * lives in `./templates.ts` so that the key names here and there cannot
 * drift independently.
 */
export const BREVO_TEMPLATE_ENV_VARS = {
  order_new_admin: "BREVO_TEMPLATE_ID_ORDER_ADMIN",
  order_received_customer: "BREVO_TEMPLATE_ID_ORDER_CUSTOMER",
  hamatee_welcome: "BREVO_TEMPLATE_ID_HAMATEE_WELCOME",
  birthday: "BREVO_TEMPLATE_ID_BIRTHDAY",
} as const;

export type BrevoTemplateKey = keyof typeof BREVO_TEMPLATE_ENV_VARS;

export interface BrevoSender {
  /** Verified Brevo sender address, e.g. hello@hammah.store. */
  email: string;
  /** Display name shown in mail clients, e.g. "SL by HAMMAH". */
  name: string;
}

export interface BrevoConfig {
  apiKey: string;
  sender: BrevoSender;
  templateIds: Record<BrevoTemplateKey, number>;
}

function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new BrevoConfigError(
      `Missing required Brevo environment variable: ${name}.`,
    );
  }
  return value;
}

/** Resolve one template ID from its environment variable, or throw. */
export function getBrevoTemplateId(key: BrevoTemplateKey): number {
  assertServerRuntime();
  const envName = BREVO_TEMPLATE_ENV_VARS[key];
  const raw = requireEnv(envName);
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BrevoConfigError(
      `Brevo environment variable ${envName} must be a positive integer template ID.`,
    );
  }
  return parsed;
}

/** Resolve the API key, or throw. */
export function getBrevoApiKey(): string {
  assertServerRuntime();
  return requireEnv("BREVO_API_KEY");
}

/** Resolve the configured sender identity, or throw. */
export function getBrevoSender(): BrevoSender {
  assertServerRuntime();
  return {
    email: requireEnv("BREVO_SENDER_EMAIL"),
    name: requireEnv("BREVO_SENDER_NAME"),
  };
}

/**
 * Central configuration object. Resolves every Brevo value at once.
 * Prefer the granular accessors in send paths so that a missing birthday
 * template ID cannot block an order email; use this for validation and
 * diagnostics.
 */
export function getBrevoConfig(): BrevoConfig {
  assertServerRuntime();
  return {
    apiKey: getBrevoApiKey(),
    sender: getBrevoSender(),
    templateIds: {
      order_new_admin: getBrevoTemplateId("order_new_admin"),
      order_received_customer: getBrevoTemplateId("order_received_customer"),
      hamatee_welcome: getBrevoTemplateId("hamatee_welcome"),
      birthday: getBrevoTemplateId("birthday"),
    },
  };
}

/**
 * Non-throwing configuration probe. Returns the list of missing/invalid
 * configuration names, or an empty array when Brevo is fully configured.
 * Never reads values into logs.
 */
export function getBrevoConfigProblems(): string[] {
  const problems: string[] = [];
  if (!readEnv("BREVO_API_KEY")) problems.push("BREVO_API_KEY");
  if (!readEnv("BREVO_SENDER_EMAIL")) problems.push("BREVO_SENDER_EMAIL");
  if (!readEnv("BREVO_SENDER_NAME")) problems.push("BREVO_SENDER_NAME");
  for (const key of Object.keys(BREVO_TEMPLATE_ENV_VARS) as BrevoTemplateKey[]) {
    const envName = BREVO_TEMPLATE_ENV_VARS[key];
    try {
      getBrevoTemplateId(key);
    } catch {
      problems.push(envName);
    }
  }
  return problems;
}

/** True when every Brevo environment variable needed to send is present. */
export function isBrevoConfigured(): boolean {
  return getBrevoConfigProblems().length === 0;
}
