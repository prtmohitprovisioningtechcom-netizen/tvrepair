import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { menuSchema } from "@/lib/validations";
import { listMenus, saveMenu } from "@/server/repositories/content.repository";
import { revalidateSite } from "@/lib/utils/revalidate";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listMenus());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = menuSchema.parse(await request.json());
    const id = await saveMenu(body);
    revalidateSite();
    return jsonOk({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
