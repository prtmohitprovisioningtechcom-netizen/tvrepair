import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { serviceSchema } from "@/lib/validations";
import { deleteService, getServiceById, saveService } from "@/server/repositories/services.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { revalidateSite } from "@/lib/utils/revalidate";
import { slugify } from "@/lib/utils/cn";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const service = await getServiceById(Number(id));
    const seo = await getSeo("service", service.id);
    return jsonOk({ ...service, seo });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = serviceSchema.parse(await request.json());
    const service = await saveService({
      ...body,
      id: Number(id),
      slug: slugify(body.slug || body.name),
    });
    revalidateSite(["/tv-repair", `/tv-repair/${service.slug}`, "/services"]);
    return jsonOk(service);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteService(Number(id));
    revalidateSite(["/tv-repair", "/services"]);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
