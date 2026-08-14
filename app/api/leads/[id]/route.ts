import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { leadUpdateSchema } from "@/lib/validations";
import { deleteLead, getLeadById, updateLead } from "@/server/repositories/content.repository";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    return jsonOk(await getLeadById(Number(id)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = leadUpdateSchema.parse(await request.json());
    return jsonOk(await updateLead(Number(id), body));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteLead(Number(id));
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
