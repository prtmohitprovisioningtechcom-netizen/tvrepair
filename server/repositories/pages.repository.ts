import { execute, parseJson, query, queryOne, transaction } from "@/lib/db/query";
import { pagination } from "@/lib/utils/cn";
import { NotFoundError } from "@/lib/utils/errors";
import type { Page, PageSection, PageWithSections } from "@/models";
import type { PaginatedResult, SectionContent, SectionSettings, SectionType } from "@/types";
import { getSeo, upsertSeo } from "@/server/repositories/seo.repository";

const PAGE_SELECT = `SELECT p.*, m.url AS featured_image_url
  FROM pages p
  LEFT JOIN media m ON m.id = p.featured_image_id`;

function mapSection(row: PageSection): PageSection {
  return {
    ...row,
    content: parseJson<SectionContent>(row.content, {}),
    settings: parseJson<SectionSettings | null>(row.settings, null),
  };
}

export async function listPages(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
}) {
  const { page, pageSize, offset } = pagination(opts.page, opts.pageSize);
  const filters: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    filters.push("(p.title LIKE ? OR p.slug LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.status) {
    filters.push("p.status = ?");
    params.push(opts.status);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM pages p ${where}`,
    params,
  );
  const data = await query<Page>(
    `SELECT p.*, m.url AS featured_image_url FROM pages p
     LEFT JOIN media m ON m.id = p.featured_image_id
     ${where}
     ORDER BY p.is_homepage DESC, p.updated_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );
  return {
    data,
    total: totalRow?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalRow?.count || 0) / pageSize),
  } satisfies PaginatedResult<Page>;
}

export async function getPageById(id: number): Promise<PageWithSections> {
  const page = await queryOne<Page>(`${PAGE_SELECT} WHERE p.id = ?`, [id]);
  if (!page) throw new NotFoundError("Page not found");
  const sections = await query<PageSection>(
    "SELECT * FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC, id ASC",
    [id],
  );
  return { ...page, sections: sections.map(mapSection) };
}

export async function getPublishedPageBySlug(slug: string): Promise<PageWithSections | null> {
  const page = await queryOne<Page>(
    `${PAGE_SELECT} WHERE p.slug = ? AND p.status = 'published'`,
    [slug],
  );
  if (!page) return null;
  const sections = await query<PageSection>(
    "SELECT * FROM page_sections WHERE page_id = ? AND is_visible = 1 ORDER BY sort_order ASC, id ASC",
    [page.id],
  );
  return { ...page, sections: sections.map(mapSection) };
}

export async function getHomepage(): Promise<PageWithSections | null> {
  const page = await queryOne<Page>(
    `${PAGE_SELECT} WHERE p.is_homepage = 1 AND p.status = 'published' LIMIT 1`,
  );
  if (!page) return null;
  const sections = await query<PageSection>(
    "SELECT * FROM page_sections WHERE page_id = ? AND is_visible = 1 ORDER BY sort_order ASC, id ASC",
    [page.id],
  );
  return { ...page, sections: sections.map(mapSection) };
}

export async function savePage(input: {
  id?: number;
  title: string;
  slug: string;
  template?: string;
  status?: "draft" | "published";
  is_homepage?: boolean;
  featured_image_id?: number | null;
  excerpt?: string | null;
  sections?: Array<{
    id?: number;
    type: string;
    title?: string | null;
    content?: SectionContent;
    settings?: SectionSettings | null;
    sort_order?: number;
    is_visible?: boolean;
  }>;
  seo?: Record<string, unknown>;
}) {
  const id = await transaction(async (tx) => {
    if (input.is_homepage) {
      await tx.execute("UPDATE pages SET is_homepage = 0");
    }

    let pageId = input.id;
    const status = input.status || "draft";
    const publishedAt = status === "published" ? new Date() : null;

    if (pageId) {
      await tx.execute(
        `UPDATE pages SET title=?, slug=?, template=?, status=?, is_homepage=?, featured_image_id=?, excerpt=?, published_at=COALESCE(published_at, ?)
         WHERE id=?`,
        [
          input.title,
          input.slug,
          input.template || "default",
          status,
          input.is_homepage ? 1 : 0,
          input.featured_image_id ?? null,
          input.excerpt ?? null,
          publishedAt,
          pageId,
        ],
      );
    } else {
      pageId = (
        await tx.execute(
          `INSERT INTO pages (title, slug, template, status, is_homepage, featured_image_id, excerpt, published_at)
           VALUES (?,?,?,?,?,?,?,?)`,
          [
            input.title,
            input.slug,
            input.template || "default",
            status,
            input.is_homepage ? 1 : 0,
            input.featured_image_id ?? null,
            input.excerpt ?? null,
            publishedAt,
          ],
        )
      ).insertId;
    }

    if (input.sections) {
      const keepIds: number[] = [];
      for (const [index, section] of input.sections.entries()) {
        const content = JSON.stringify(section.content || {});
        const settings = JSON.stringify(section.settings || {});
        if (section.id) {
          await tx.execute(
            `UPDATE page_sections SET type=?, title=?, content=?, settings=?, sort_order=?, is_visible=? WHERE id=? AND page_id=?`,
            [
              section.type,
              section.title ?? null,
              content,
              settings,
              section.sort_order ?? index,
              section.is_visible === false ? 0 : 1,
              section.id,
              pageId,
            ],
          );
          keepIds.push(section.id);
        } else {
          const result = await tx.execute(
            `INSERT INTO page_sections (page_id, type, title, content, settings, sort_order, is_visible)
             VALUES (?,?,?,?,?,?,?)`,
            [
              pageId,
              section.type,
              section.title ?? null,
              content,
              settings,
              section.sort_order ?? index,
              section.is_visible === false ? 0 : 1,
            ],
          );
          keepIds.push(result.insertId);
        }
      }
      if (keepIds.length) {
        await tx.execute(
          `DELETE FROM page_sections WHERE page_id = ? AND id NOT IN (${keepIds.map(() => "?").join(",")})`,
          [pageId, ...keepIds],
        );
      } else {
        await tx.execute("DELETE FROM page_sections WHERE page_id = ?", [pageId]);
      }
    }

    return pageId!;
  });

  if (input.seo) {
    await upsertSeo(input.is_homepage ? "homepage" : "page", id, input.seo);
  }

  return getPageById(id);
}

export async function deletePage(id: number) {
  const page = await queryOne<Page>("SELECT * FROM pages WHERE id = ?", [id]);
  if (!page) throw new NotFoundError("Page not found");
  await execute("DELETE FROM pages WHERE id = ?", [id]);
}

export async function getPageSeo(page: Page) {
  const type = page.is_homepage ? "homepage" : "page";
  return getSeo(type as "homepage" | "page", page.id);
}

export type { SectionType };
