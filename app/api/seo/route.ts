import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { seoSchema } from "@/lib/validations";
import { listSeo, upsertSeo } from "@/server/repositories/seo.repository";
import { revalidateSite } from "@/lib/utils/revalidate";
import type { SeoEntityType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    return jsonOk(await listSeo(params.page, params.pageSize, params.q));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = seoSchema.parse(body);
    const entityType = body.entity_type as SeoEntityType;
    const entityId = Number(body.entity_id || 0);
    const id = await upsertSeo(entityType, entityId, parsed as Record<string, unknown>);
    revalidateSite();
    return jsonOk({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
