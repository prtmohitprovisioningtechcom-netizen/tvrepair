import { execute, insertId, parseJson, query, queryOne } from "@/lib/db/query";
import { pagination } from "@/lib/utils/cn";
import type { PaginatedResult } from "@/types";
import type { SeoMetadata } from "@/models";
import type { SeoEntityType } from "@/types";

export async function getSeo(
  entityType: SeoEntityType,
  entityId: number,
): Promise<SeoMetadata | null> {
  const row = await queryOne<SeoMetadata>(
    `SELECT s.*, og.url AS og_image_url, tw.url AS twitter_image_url
     FROM seo_metadata s
     LEFT JOIN media og ON og.id = s.og_image_id
     LEFT JOIN media tw ON tw.id = s.twitter_image_id
     WHERE s.entity_type = ? AND s.entity_id = ?`,
    [entityType, entityId],
  );
  return row;
}

export async function upsertSeo(
  entityType: SeoEntityType,
  entityId: number,
  data: Record<string, unknown>,
): Promise<number> {
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM seo_metadata WHERE entity_type = ? AND entity_id = ?",
    [entityType, entityId],
  );

  const robotsIndex = data.robots_index;
  const robotsFollow = data.robots_follow;
  const payload = {
    seo_title: (data.seo_title as string | null) ?? null,
    meta_description: (data.meta_description as string | null) ?? null,
    focus_keyword: (data.focus_keyword as string | null) ?? null,
    canonical_url: (data.canonical_url as string | null) ?? null,
    robots_index: robotsIndex === false || robotsIndex === 0 ? 0 : 1,
    robots_follow: robotsFollow === false || robotsFollow === 0 ? 0 : 1,
    og_title: (data.og_title as string | null) ?? null,
    og_description: (data.og_description as string | null) ?? null,
    og_image_id: (data.og_image_id as number | null) ?? null,
    twitter_title: (data.twitter_title as string | null) ?? null,
    twitter_description: (data.twitter_description as string | null) ?? null,
    twitter_image_id: (data.twitter_image_id as number | null) ?? null,
    schema_type: (data.schema_type as string | null) ?? null,
  };

  if (existing) {
    await execute(
      `UPDATE seo_metadata SET
        seo_title=?, meta_description=?, focus_keyword=?, canonical_url=?,
        robots_index=?, robots_follow=?, og_title=?, og_description=?, og_image_id=?,
        twitter_title=?, twitter_description=?, twitter_image_id=?, schema_type=?
       WHERE id=?`,
      [
        payload.seo_title,
        payload.meta_description,
        payload.focus_keyword,
        payload.canonical_url,
        payload.robots_index,
        payload.robots_follow,
        payload.og_title,
        payload.og_description,
        payload.og_image_id,
        payload.twitter_title,
        payload.twitter_description,
        payload.twitter_image_id,
        payload.schema_type,
        existing.id,
      ],
    );
    return existing.id;
  }

  return insertId(
    `INSERT INTO seo_metadata (
      entity_type, entity_id, seo_title, meta_description, focus_keyword, canonical_url,
      robots_index, robots_follow, og_title, og_description, og_image_id,
      twitter_title, twitter_description, twitter_image_id, schema_type
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      entityType,
      entityId,
      payload.seo_title,
      payload.meta_description,
      payload.focus_keyword,
      payload.canonical_url,
      payload.robots_index,
      payload.robots_follow,
      payload.og_title,
      payload.og_description,
      payload.og_image_id,
      payload.twitter_title,
      payload.twitter_description,
      payload.twitter_image_id,
      payload.schema_type,
    ],
  );
}

export async function listSeo(page = 1, pageSize = 20, q = "") {
  const { offset, pageSize: size } = pagination(page, pageSize);
  const like = `%${q}%`;
  const where = q
    ? "WHERE seo_title LIKE ? OR focus_keyword LIKE ? OR entity_type LIKE ?"
    : "";
  const params = q ? [like, like, like] : [];
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM seo_metadata ${where}`,
    params,
  );
  const data = await query<SeoMetadata>(
    `SELECT s.*, og.url AS og_image_url FROM seo_metadata s
     LEFT JOIN media og ON og.id = s.og_image_id
     ${where} ORDER BY s.updated_at DESC LIMIT ? OFFSET ?`,
    [...params, size, offset],
  );
  return {
    data,
    total: totalRow?.count || 0,
    page,
    pageSize: size,
    totalPages: Math.ceil((totalRow?.count || 0) / size),
  } satisfies PaginatedResult<SeoMetadata>;
}

export { parseJson };
