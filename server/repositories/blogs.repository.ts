import { execute, query, queryOne, transaction } from "@/lib/db/query";
import { pagination, slugify } from "@/lib/utils/cn";
import { NotFoundError } from "@/lib/utils/errors";
import type { Blog, BlogCategory, BlogTag } from "@/models";
import type { PaginatedResult } from "@/types";
import { upsertSeo } from "@/server/repositories/seo.repository";

export async function listCategories() {
  return query<BlogCategory>("SELECT * FROM blog_categories ORDER BY name ASC");
}

export async function saveCategory(input: {
  id?: number;
  name: string;
  slug: string;
  description?: string | null;
}) {
  if (input.id) {
    await execute(
      "UPDATE blog_categories SET name=?, slug=?, description=? WHERE id=?",
      [input.name, input.slug, input.description ?? null, input.id],
    );
    return input.id;
  }
  return (
    await execute(
      "INSERT INTO blog_categories (name, slug, description) VALUES (?,?,?)",
      [input.name, input.slug, input.description ?? null],
    )
  ).insertId;
}

export async function deleteCategory(id: number) {
  await execute("DELETE FROM blog_categories WHERE id = ?", [id]);
}

export async function listBlogs(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  category?: string;
  publishedOnly?: boolean;
}) {
  const { page, pageSize, offset } = pagination(opts.page, opts.pageSize);
  const filters: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    filters.push("(b.title LIKE ? OR b.slug LIKE ? OR b.excerpt LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.status) {
    filters.push("b.status = ?");
    params.push(opts.status);
  }
  if (opts.publishedOnly) {
    filters.push("b.status = 'published' AND (b.published_at IS NULL OR b.published_at <= NOW())");
  }
  if (opts.category) {
    filters.push("c.slug = ?");
    params.push(opts.category);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM blogs b LEFT JOIN blog_categories c ON c.id = b.category_id ${where}`,
    params,
  );
  const data = await query<Blog>(
    `SELECT b.*, m.url AS image_url, u.name AS author_name, c.name AS category_name
     FROM blogs b
     LEFT JOIN media m ON m.id = b.featured_image_id
     LEFT JOIN users u ON u.id = b.author_id
     LEFT JOIN blog_categories c ON c.id = b.category_id
     ${where}
     ORDER BY COALESCE(b.published_at, b.created_at) DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );
  return {
    data,
    total: totalRow?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalRow?.count || 0) / pageSize),
  } satisfies PaginatedResult<Blog>;
}

async function attachTags(blog: Blog): Promise<Blog> {
  const tags = await query<BlogTag>(
    `SELECT t.* FROM blog_tags t
     JOIN blog_tag_map m ON m.tag_id = t.id
     WHERE m.blog_id = ?`,
    [blog.id],
  );
  return { ...blog, tags };
}

export async function getBlogById(id: number) {
  const row = await queryOne<Blog>(
    `SELECT b.*, m.url AS image_url, u.name AS author_name, c.name AS category_name
     FROM blogs b
     LEFT JOIN media m ON m.id = b.featured_image_id
     LEFT JOIN users u ON u.id = b.author_id
     LEFT JOIN blog_categories c ON c.id = b.category_id
     WHERE b.id = ?`,
    [id],
  );
  if (!row) throw new NotFoundError("Blog not found");
  return attachTags(row);
}

export async function getBlogBySlug(slug: string) {
  const row = await queryOne<Blog>(
    `SELECT b.*, m.url AS image_url, u.name AS author_name, c.name AS category_name
     FROM blogs b
     LEFT JOIN media m ON m.id = b.featured_image_id
     LEFT JOIN users u ON u.id = b.author_id
     LEFT JOIN blog_categories c ON c.id = b.category_id
     WHERE b.slug = ? AND b.status = 'published' AND (b.published_at IS NULL OR b.published_at <= NOW())`,
    [slug],
  );
  if (!row) return null;
  return attachTags(row);
}

async function ensureTag(name: string) {
  const slug = slugify(name);
  const existing = await queryOne<BlogTag>("SELECT * FROM blog_tags WHERE slug = ?", [slug]);
  if (existing) return existing.id;
  return (
    await execute("INSERT INTO blog_tags (name, slug) VALUES (?,?)", [name, slug])
  ).insertId;
}

export async function saveBlog(input: {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image_id?: number | null;
  author_id?: number | null;
  category_id?: number | null;
  status?: "draft" | "published" | "scheduled";
  published_at?: string | null;
  scheduled_at?: string | null;
  tags?: string[];
  seo?: Record<string, unknown>;
}) {
  const id = await transaction(async (tx) => {
    let blogId = input.id;
    const status = input.status || "draft";
    const publishedAt =
      input.published_at || (status === "published" ? new Date().toISOString().slice(0, 19).replace("T", " ") : null);
    const values = [
      input.title,
      input.slug,
      input.excerpt ?? null,
      input.content ?? null,
      input.featured_image_id ?? null,
      input.author_id ?? null,
      input.category_id ?? null,
      status,
      publishedAt,
      input.scheduled_at ?? null,
    ];
    if (blogId) {
      await tx.execute(
        `UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, featured_image_id=?, author_id=?, category_id=?, status=?, published_at=?, scheduled_at=? WHERE id=?`,
        [...values, blogId],
      );
    } else {
      blogId = (
        await tx.execute(
          `INSERT INTO blogs (title, slug, excerpt, content, featured_image_id, author_id, category_id, status, published_at, scheduled_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          values,
        )
      ).insertId;
    }
    return blogId!;
  });

  if (input.tags) {
    await execute("DELETE FROM blog_tag_map WHERE blog_id = ?", [id]);
    for (const tag of input.tags) {
      const tagId = await ensureTag(tag);
      await execute("INSERT IGNORE INTO blog_tag_map (blog_id, tag_id) VALUES (?,?)", [id, tagId]);
    }
  }
  if (input.seo) await upsertSeo("blog", id, input.seo);
  return getBlogById(id);
}

export async function deleteBlog(id: number) {
  await execute("DELETE FROM blogs WHERE id = ?", [id]);
}

export async function relatedBlogs(excludeId: number, categoryId?: number | null, limit = 3) {
  return query<Blog>(
    `SELECT b.*, m.url AS image_url FROM blogs b
     LEFT JOIN media m ON m.id = b.featured_image_id
     WHERE b.id <> ? AND b.status = 'published'
     ORDER BY CASE WHEN b.category_id = ? THEN 0 ELSE 1 END, b.published_at DESC
     LIMIT ?`,
    [excludeId, categoryId || 0, limit],
  );
}
