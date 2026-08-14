import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { leadSchema } from "@/lib/validations";
import { createLead, listLeads } from "@/server/repositories/content.repository";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    return jsonOk(await listLeads(params));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    rateLimit(`lead:${clientIp(request)}`, 6, 10 * 60 * 1000);
    const body = leadSchema.parse(await request.json());
    const id = await createLead({
      ...body,
      email: body.email || null,
    });
    return jsonOk({ id, ok: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
