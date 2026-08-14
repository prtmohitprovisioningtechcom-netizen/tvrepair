import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { pageSchema } from "@/lib/validations";
import { deletePage, getPageById, savePage } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { revalidateSite } from "@/lib/utils/revalidate";
import { slugify } from "@/lib/utils/cn";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const page = await getPageById(Number(id));
    const seo = await getSeo(page.is_homepage ? "homepage" : "page", page.id);
    return jsonOk({ ...page, seo });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = pageSchema.parse(await request.json());
    const page = await savePage({
      ...body,
      id: Number(id),
      slug: slugify(body.slug || body.title),
    });
    revalidateSite([`/${page.slug}`]);
    return jsonOk(page);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deletePage(Number(id));
    revalidateSite();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
