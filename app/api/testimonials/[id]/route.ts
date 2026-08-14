import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { testimonialSchema } from "@/lib/validations";
import { deleteTestimonial, saveTestimonial } from "@/server/repositories/content.repository";
import { revalidateSite } from "@/lib/utils/revalidate";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = testimonialSchema.parse(await request.json());
    await saveTestimonial({ ...body, id: Number(id) });
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
    await deleteTestimonial(Number(id));
    revalidateSite();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
