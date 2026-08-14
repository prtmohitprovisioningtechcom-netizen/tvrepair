import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { categorySchema } from "@/lib/validations";
import { listCategories, saveCategory } from "@/server/repositories/blogs.repository";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await listCategories());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = categorySchema.parse(await request.json());
    const id = await saveCategory(body);
    return jsonOk({ id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
