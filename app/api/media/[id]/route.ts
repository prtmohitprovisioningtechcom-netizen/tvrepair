import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { mediaMetaSchema } from "@/lib/validations";
import { deleteMedia, updateMedia } from "@/server/repositories/content.repository";

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
    try {
      await unlink(path.join(process.cwd(), "public", media.path));
    } catch {
      // file may already be gone
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
