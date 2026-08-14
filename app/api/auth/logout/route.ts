import { handleApiError, jsonOk } from "@/lib/auth/api";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
