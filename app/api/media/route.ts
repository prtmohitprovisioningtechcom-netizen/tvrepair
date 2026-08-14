import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { createMedia, listMedia } from "@/server/repositories/content.repository";
import { AppError } from "@/lib/utils/errors";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_SIZE = 8 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    return jsonOk(await listMedia(params));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AppError("File is required", 400);
    if (!ALLOWED.has(file.type)) throw new AppError("Unsupported file type", 400);
    if (file.size > MAX_SIZE) throw new AppError("File exceeds 8MB limit", 400);

    const now = new Date();
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    const filename = `${randomUUID()}.${EXT[file.type]}`;
    const relative = path.join("uploads", folder, filename).replace(/\\/g, "/");
    const destDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(destDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(destDir, filename), buffer);

    const alt = String(form.get("alt_text") || "");
    const title = String(form.get("title") || file.name);
    const id = await createMedia({
      filename,
      original_name: file.name,
      url: `/${relative}`,
      path: relative,
      mime_type: file.type,
      size: file.size,
      width: null,
      height: null,
      alt_text: alt || null,
      title: title || null,
    });

    return jsonOk({ id, url: `/${relative}` }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
