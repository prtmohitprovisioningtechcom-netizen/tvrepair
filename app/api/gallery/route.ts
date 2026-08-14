import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { query, execute } from "@/lib/db/query";

export async function GET(request: NextRequest) {
  try {
    const images = await query(`
      SELECT g.*, m.url as image_url, m.alt_text 
      FROM gallery_images g
      JOIN media m ON g.media_id = m.id
      ORDER BY g.sort_order ASC, g.id DESC
    `);
    return jsonOk(images);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (!body.media_id) {
      throw new Error("media_id is required");
    }
    
    const result = await execute(
      "INSERT INTO gallery_images (media_id, caption, sort_order, is_visible) VALUES (?, ?, ?, ?)",
      [body.media_id, body.caption || null, body.sort_order || 0, body.is_visible !== undefined ? body.is_visible : 1]
    );
    
    return jsonOk({ id: (result as any).insertId }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
