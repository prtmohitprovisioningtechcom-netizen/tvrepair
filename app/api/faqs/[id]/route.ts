import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { faqSchema } from "@/lib/validations";
import { deleteFaq, saveFaq } from "@/server/repositories/content.repository";
import { revalidateSite } from "@/lib/utils/revalidate";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = faqSchema.parse(await request.json());
    await saveFaq({ ...body, id: Number(id) });
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
    await deleteFaq(Number(id));
    revalidateSite();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
