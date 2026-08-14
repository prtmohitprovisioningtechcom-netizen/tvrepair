import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { faqSchema } from "@/lib/validations";
import { listFaqs, saveFaq } from "@/server/repositories/content.repository";
import { revalidateSite } from "@/lib/utils/revalidate";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    return jsonOk(await listFaqs(params));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = faqSchema.parse(await request.json());
    const id = await saveFaq(body);
    revalidateSite();
    return jsonOk({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
