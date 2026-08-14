import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireRole } from "@/lib/auth/api";
import { userSchema } from "@/lib/validations";
import { execute } from "@/lib/db/query";
import { saveUser } from "@/server/repositories/content.repository";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireRole(["admin"]);
    const { id } = await ctx.params;
    const body = userSchema.parse(await request.json());
    await saveUser({ ...body, id: Number(id) });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = await ctx.params;
    if (session.id === Number(id)) {
      return jsonOk({ error: "You cannot delete your own account" }, 400);
    }
    await execute("DELETE FROM users WHERE id = ?", [Number(id)]);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
