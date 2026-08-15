import { AppError } from "@/lib/utils/errors";

function env(name: string) {
  const value = process.env[name];
  if (value == null) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

/** JWT signing key. Keep this Edge-safe (no next/headers). */
export function authSecretKey(): Uint8Array {
  const secret = env("AUTH_SECRET");
  if (secret.length >= 16) {
    return new TextEncoder().encode(secret);
  }

  const derived = [env("DB_PASSWORD"), env("DB_USER"), env("DB_NAME"), "tvrepair-auth"]
    .filter(Boolean)
    .join("|");
  if (derived.length >= 16) {
    console.warn(
      "[auth] AUTH_SECRET is missing or shorter than 16 characters. Using a derived fallback. Set AUTH_SECRET in Vercel → Settings → Environment Variables.",
    );
    return new TextEncoder().encode(derived.padEnd(32, "x"));
  }

  throw new AppError(
    "AUTH_SECRET is missing. In Vercel: Settings → Environment Variables → add AUTH_SECRET (32+ random characters), then Redeploy.",
    500,
  );
}

export function authSecretOrNull(): Uint8Array | null {
  try {
    return authSecretKey();
  } catch {
    return null;
  }
}
