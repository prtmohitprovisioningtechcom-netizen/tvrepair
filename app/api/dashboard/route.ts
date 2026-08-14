import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { getDashboardStats } from "@/server/repositories/content.repository";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await getDashboardStats());
  } catch (error) {
    return handleApiError(error);
  }
}
