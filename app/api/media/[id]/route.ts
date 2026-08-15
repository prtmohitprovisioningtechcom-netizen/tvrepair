import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { mediaMetaSchema } from "@/lib/validations";
import { deleteMedia, updateMedia } from "@/server/repositories/content.repository";
import { tryDeletePublicUpload } from "@/lib/media/storage";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = mediaMetaSchema.parse(await request.json());
    await updateMedia(Number(id), body);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const media = await deleteMedia(Number(id));
    await tryDeletePublicUpload(media.path);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
