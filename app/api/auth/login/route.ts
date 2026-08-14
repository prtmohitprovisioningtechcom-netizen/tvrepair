import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/auth/api";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, signSession } from "@/lib/auth/session";
import { getUserByEmail, touchLogin } from "@/server/repositories/content.repository";
import { AppError } from "@/lib/utils/errors";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());
    rateLimit(`login:${clientIp(request)}:${body.email}`, 8, 15 * 60 * 1000);
    const user = await getUserByEmail(body.email);
    if (!user || user.status !== "active") {
      throw new AppError("Invalid email or password", 401);
    }
    const ok = await verifyPassword(body.password, user.password_hash);
    if (!ok) throw new AppError("Invalid email or password", 401);
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = await signSession(session);
    await setSessionCookie(token);
    await touchLogin(user.id);
    return jsonOk({ user: session });
  } catch (error) {
    return handleApiError(error);
  }
}
