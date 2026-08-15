import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { execute, query, queryTextOne } from "@/lib/db/query";

let ensureColumn: Promise<void> | null = null;

export async function ensureMediaFileDataColumn() {
  if (!ensureColumn) {
    ensureColumn = (async () => {
      const rows = await query<{ Field: string }>("SHOW COLUMNS FROM media LIKE 'file_data'");
      if (!rows.length) {
        await execute("ALTER TABLE media ADD COLUMN file_data LONGBLOB NULL");
      }
    })().catch((error) => {
      ensureColumn = null;
      throw error;
    });
  }
  return ensureColumn;
}

export async function tryWritePublicUpload(relativePath: string, buffer: Buffer) {
  if (process.env.VERCEL) return;
  try {
    const dest = path.join(process.cwd(), "public", relativePath);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buffer);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") return;
    console.error("[media] disk write skipped", error);
  }
}

export async function tryDeletePublicUpload(relativePath: string) {
  try {
    await unlink(path.join(process.cwd(), "public", relativePath));
  } catch {
    // file may already be gone, or the host filesystem is read-only
  }
}

function toBuffer(value: unknown): Buffer | null {
  if (value == null) return null;
  if (Buffer.isBuffer(value)) return Buffer.from(value);
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === "string" && value.length) return Buffer.from(value, "latin1");
  if (Array.isArray(value)) return Buffer.from(value);
  if (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return Buffer.from((value as { data: number[] }).data);
  }
  return null;
}

function normalizeUploadPath(value: string) {
  return value.replace(/^\/+/, "").replace(/\\/g, "/");
}

export function copyImageBytes(data: Buffer) {
  const bytes = new Uint8Array(data.length);
  bytes.set(data);
  return bytes;
}

function segmentsOf(value: string[] | string | undefined) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split("/").filter(Boolean);
}

export async function mediaFileResponse(rawPath: string[] | string | undefined) {
  const segments = segmentsOf(rawPath);
  if (!segments.length || segments.some((part) => part === ".." || part.includes("\0"))) {
    return new Response("Not found", { status: 404 });
  }

  const file = await getMediaFile(`uploads/${segments.join("/")}`);
  if (!file?.data?.length) {
    return new Response("Not found", { status: 404 });
  }

  const body = copyImageBytes(file.data);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function getMediaFile(requestPath: string) {
  const relative = normalizeUploadPath(requestPath);
  const filename = relative.split("/").pop() || relative;

  try {
    const row = await queryTextOne<{ mime_type: string; file_data: unknown; path: string }>(
      `SELECT path, mime_type, file_data FROM media
       WHERE path = ? OR url = ? OR filename = ?
       LIMIT 1`,
      [relative, `/${relative}`, filename],
    );
    const fromDb = toBuffer(row?.file_data);
    if (fromDb?.length && row) {
      return { mimeType: row.mime_type || guessMime(relative), data: fromDb };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/file_data|Unknown column/i.test(message)) {
      throw error;
    }
    console.error("[media] file_data column missing or unreadable", message);
  }

  const diskPath = path.resolve(process.cwd(), "public", relative);
  const root = path.resolve(process.cwd(), "public", "uploads");
  if (!diskPath.startsWith(root)) return null;
  try {
    const data = await readFile(diskPath);
    return { mimeType: guessMime(diskPath), data };
  } catch {
    return null;
  }
}

function guessMime(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}
