import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { execute } from "@/lib/db/query";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    const body = await request.json();
    
    await execute(
      "UPDATE gallery_images SET caption = ?, sort_order = ?, is_visible = ? WHERE id = ?",
      [body.caption || null, body.sort_order || 0, body.is_visible !== undefined ? body.is_visible : 1, id]
    );
    
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const id = Number((await params).id);
    
    await execute("DELETE FROM gallery_images WHERE id = ?", [id]);
    
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
