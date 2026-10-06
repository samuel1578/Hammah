/**
 * Shared validation/normalisation for Admin notification recipients.
 * Used by the Admin CRUD API only (never client-side enforcement alone —
 * the API runs behind `requireAdmin()` and the table has admin-only RLS).
 */

export const MAX_RECIPIENT_LABEL_LENGTH = 100;
export const MAX_RECIPIENT_EMAIL_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeRecipientEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidRecipientEmail(email: string): boolean {
  return (
    email.length > 0 &&
    email.length <= MAX_RECIPIENT_EMAIL_LENGTH &&
    EMAIL_PATTERN.test(email)
  );
}

export function normalizeRecipientLabel(
  label: unknown,
): string | null {
  if (typeof label !== "string") return null;
  const trimmed = label.trim();
  return trimmed.length > 0
    ? trimmed.slice(0, MAX_RECIPIENT_LABEL_LENGTH)
    : null;
}
