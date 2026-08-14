import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";
import { UnauthorizedError } from "@/lib/utils/errors";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/constants";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set and at least 16 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionUser> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.id || !payload.email || !payload.role) {
      throw new UnauthorizedError();
    }
    return {
      id: Number(payload.id),
      name: String(payload.name || ""),
      email: String(payload.email),
      role: payload.role as SessionUser["role"],
    };
  } catch {
    throw new UnauthorizedError("Invalid or expired session");
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionFromCookies();
  if (!session) throw new UnauthorizedError();
  return session;
}

export { SESSION_COOKIE };
