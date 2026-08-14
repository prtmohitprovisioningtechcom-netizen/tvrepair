import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin, requireRole } from "@/lib/auth/api";
import { userSchema } from "@/lib/validations";
import { listUsers, saveUser } from "@/server/repositories/content.repository";

export async function GET() {
  try {
    await requireRole(["admin"]);
    return jsonOk(await listUsers());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const body = userSchema.parse(await request.json());
    const id = await saveUser(body);
    return jsonOk({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
