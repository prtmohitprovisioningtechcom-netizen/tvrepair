import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { pageSchema } from "@/lib/validations";
import { deletePage, getPageById, listPages, savePage } from "@/server/repositories/pages.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { revalidateSite } from "@/lib/utils/revalidate";
import { slugify } from "@/lib/utils/cn";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    const result = await listPages(params);
    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = pageSchema.parse(await request.json());
    const page = await savePage({
      ...body,
      slug: slugify(body.slug || body.title),
    });
    revalidateSite([`/${page.slug}`]);
    return jsonOk(page, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
