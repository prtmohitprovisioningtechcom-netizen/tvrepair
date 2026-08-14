import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";

export async function GET() {
  try {
    const user = await requireAdmin();
    return jsonOk({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
