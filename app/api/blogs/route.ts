import { NextRequest } from "next/server";
import { handleApiError, jsonOk, parseSearchParams, requireAdmin } from "@/lib/auth/api";
import { blogSchema } from "@/lib/validations";
import { listBlogs, saveBlog } from "@/server/repositories/blogs.repository";
import { revalidateSite } from "@/lib/utils/revalidate";
import { slugify } from "@/lib/utils/cn";
import { sanitizeHtml } from "@/lib/utils/sanitize";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = parseSearchParams(request.url);
    return jsonOk(await listBlogs(params));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = blogSchema.parse(await request.json());
    const blog = await saveBlog({
      ...body,
      slug: slugify(body.slug || body.title),
      content: body.content ? sanitizeHtml(body.content) : body.content,
      author_id: body.author_id || session.id,
    });
    revalidateSite(["/blog", `/blog/${blog.slug}`]);
    return jsonOk(blog, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
