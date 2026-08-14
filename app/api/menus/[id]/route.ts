import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { menuSchema } from "@/lib/validations";
import { deleteMenu, saveMenu } from "@/server/repositories/content.repository";
import { revalidateSite } from "@/lib/utils/revalidate";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = menuSchema.parse(await request.json());
    await saveMenu({ ...body, id: Number(id) });
    revalidateSite();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteMenu(Number(id));
    revalidateSite();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
