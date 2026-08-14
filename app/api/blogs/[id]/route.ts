import { NextRequest } from "next/server";
import { handleApiError, jsonOk, requireAdmin } from "@/lib/auth/api";
import { blogSchema } from "@/lib/validations";
import { deleteBlog, getBlogById, saveBlog } from "@/server/repositories/blogs.repository";
import { getSeo } from "@/server/repositories/seo.repository";
import { revalidateSite } from "@/lib/utils/revalidate";
import { slugify } from "@/lib/utils/cn";
import { sanitizeHtml } from "@/lib/utils/sanitize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const blog = await getBlogById(Number(id));
    const seo = await getSeo("blog", blog.id);
    return jsonOk({ ...blog, seo });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = blogSchema.parse(await request.json());
    const blog = await saveBlog({
      ...body,
      id: Number(id),
      slug: slugify(body.slug || body.title),
      content: body.content ? sanitizeHtml(body.content) : body.content,
    });
    revalidateSite(["/blog", `/blog/${blog.slug}`]);
    return jsonOk(blog);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await deleteBlog(Number(id));
    revalidateSite(["/blog"]);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
