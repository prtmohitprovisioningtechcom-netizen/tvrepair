import { NextRequest } from "next/server";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/auth/api";
import { hashPassword } from "@/lib/auth/password";
import {
  consumePasswordReset,
  createPasswordReset,
  getUserByEmail,
  updateUserPassword,
} from "@/server/repositories/content.repository";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.token && body.password) {
      const parsed = resetPasswordSchema.parse(body);
      rateLimit(`reset:${clientIp(request)}`, 8);
      const userId = await consumePasswordReset(parsed.token);
      if (!userId) {
        return jsonOk({
          error: "Reset link is invalid or expired",
        }, 400);
      }
      await updateUserPassword(userId, await hashPassword(parsed.password));
      return jsonOk({ ok: true });
    }

    const parsed = forgotPasswordSchema.parse(body);
    rateLimit(`forgot:${clientIp(request)}:${parsed.email}`, 5);
    const user = await getUserByEmail(parsed.email);
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await createPasswordReset(user.id, token, expires);
      console.info(`[password-reset] token for ${user.email}: ${token}`);
    }
    return jsonOk({
      ok: true,
      message: "If that account exists, a reset token was generated. Check server logs in development.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
