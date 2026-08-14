import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { categorySchema } from "@/lib/validations";
import { deleteCategory, saveCategory } from "@/server/repositories/blogs.repository";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = categorySchema.parse(await request.json());
    await saveCategory({ ...body, id: Number(id) });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteCategory(Number(id));
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
