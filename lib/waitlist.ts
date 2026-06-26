const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export async function addToWaitlist(email: string): Promise<{ ok: true }> {
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    throw new Error("Invalid email address");
  }

  // Stub: swap with Supabase, Resend Audiences, or Mailchimp later.
  console.log("[waitlist] new signup:", normalized);

  return { ok: true };
}
