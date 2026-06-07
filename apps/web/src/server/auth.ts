import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-insecure-secret",
);
const COOKIE = "kp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type Role = "customer" | "supplier" | "admin";

export interface SessionPayload {
  userId: string;
  role: Role;
}

export async function signToken(p: SessionPayload): Promise<string> {
  return new SignJWT({ role: p.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return { userId: String(payload.sub), role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}

/** Read the current session from the cookie (server components / actions). */
export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Resolve a session from an API request: Bearer token first, then cookie. */
export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return verifyToken(auth.slice(7));
  return getSession();
}

// --- password hashing (scrypt; no native deps) ---

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
