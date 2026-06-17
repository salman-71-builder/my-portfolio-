import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

export const ADMIN_COOKIE = "ic_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Falls back to a dev default; ALWAYS set ADMIN_PASSWORD in production. */
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

/** Stable session token derived from the password (password never stored in the cookie). */
export function makeAdminToken(): string {
  return crypto
    .createHmac("sha256", adminPassword())
    .update("import-china-admin")
    .digest("hex");
}

export function verifyPassword(password: string): boolean {
  const a = Buffer.from(String(password));
  const b = Buffer.from(adminPassword());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Whether the current request carries a valid admin session cookie. */
export function isAdmin(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = makeAdminToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  try {
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
