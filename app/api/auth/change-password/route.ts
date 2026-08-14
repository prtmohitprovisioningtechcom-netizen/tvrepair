import { NextRequest } from "next/server";
import { changePasswordSchema } from "@/lib/validations";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getUserById, updateUserPassword } from "@/server/repositories/content.repository";
import { AppError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = changePasswordSchema.parse(await request.json());
    const user = await getUserById(session.id);
    if (!user) throw new AppError("User not found", 404);
    const ok = await verifyPassword(body.currentPassword, user.password_hash);
    if (!ok) throw new AppError("Current password is incorrect", 400);
    await updateUserPassword(user.id, await hashPassword(body.newPassword));
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
