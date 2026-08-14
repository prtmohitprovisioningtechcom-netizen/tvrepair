import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { testimonialSchema } from "@/lib/validations";
import { listTestimonials, saveTestimonial } from "@/server/repositories/content.repository";
import { revalidateSite } from "@/lib/utils/revalidate";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    return jsonOk(await listTestimonials(params));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = testimonialSchema.parse(await request.json());
    const id = await saveTestimonial(body);
    revalidateSite();
    return jsonOk({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
