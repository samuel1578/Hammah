/**
 * HAMMAH — Email server guard
 *
 * Brevo is a server-only capability. The `src/lib/email/*` modules must
 * never be imported from a client component or any code that runs in the
 * browser. There is no `server-only` package installed in this project,
 * so this lightweight runtime guard enforces the same contract: any call
 * that reaches an email module while executing in a browser context throws
 * immediately instead of silently leaking configuration.
 *
 * This is a defence-in-depth check only. Import discipline (never importing
 * `@/lib/email/*` from a `"use client"` module) remains the primary rule,
 * and no Brevo secret is ever exposed through a `NEXT_PUBLIC_` variable.
 */
export function assertServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "HAMMAH email modules are server-only and must not be imported from client code.",
    );
  }
}
