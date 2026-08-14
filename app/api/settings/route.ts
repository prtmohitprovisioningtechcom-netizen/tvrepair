import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { settingsSchema } from "@/lib/validations";
import { getSettingsMap, upsertSettings } from "@/server/repositories/settings.repository";
import { revalidateSite } from "@/lib/utils/revalidate";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await getSettingsMap());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = settingsSchema.parse(await request.json());
    await upsertSettings(body);
    revalidateSite();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
