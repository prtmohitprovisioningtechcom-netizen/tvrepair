import { NextResponse } from "next/server";
import { getMediaFile } from "@/lib/media/storage";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { path: segments } = await ctx.params;
  if (!segments?.length || segments.some((part) => part === ".." || part.includes("\0"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await getMediaFile(`uploads/${segments.join("/")}`);
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
