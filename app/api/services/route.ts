import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { serviceSchema } from "@/lib/validations";
import { listServices, saveService } from "@/server/repositories/services.repository";
import { revalidateSite } from "@/lib/utils/revalidate";
import { slugify } from "@/lib/utils/cn";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    return jsonOk(await listServices(params));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = serviceSchema.parse(await request.json());
    const service = await saveService({ ...body, slug: slugify(body.slug || body.name) });
    revalidateSite(["/tv-repair", `/tv-repair/${service.slug}`, "/services"]);
    return jsonOk(service, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
