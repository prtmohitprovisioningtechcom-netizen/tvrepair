import { mediaFileResponse } from "@/lib/media/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] | string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { path } = await ctx.params;
    return await mediaFileResponse(path);
  } catch (error) {
    console.error("[uploads]", error);
    return new Response("Image unavailable", { status: 404 });
  }
}
