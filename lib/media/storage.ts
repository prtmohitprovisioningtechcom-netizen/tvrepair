import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { execute, query, queryOne } from "@/lib/db/query";

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
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return null;
}

function normalizeUploadPath(value: string) {
  return value.replace(/^\/+/, "").replace(/\\/g, "/");
}

export async function getMediaFile(requestPath: string) {
  const relative = normalizeUploadPath(requestPath);
  const row = await queryOne<{ mime_type: string; file_data: unknown; path: string }>(
    `SELECT path, mime_type, file_data FROM media WHERE path = ? OR url = ? LIMIT 1`,
    [relative, `/${relative}`],
  );
  const fromDb = toBuffer(row?.file_data);
  if (fromDb && row) {
    return { mimeType: row.mime_type, data: fromDb };
  }

  const diskPath = path.resolve(process.cwd(), "public", relative);
  const root = path.resolve(process.cwd(), "public", "uploads");
  if (!diskPath.startsWith(root)) return null;
  try {
    const data = await readFile(diskPath);
    return { mimeType: row?.mime_type || guessMime(diskPath), data };
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
