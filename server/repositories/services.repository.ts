import { execute, parseJson, query, queryOne, transaction } from "@/lib/db/query";
import { pagination } from "@/lib/utils/cn";
import { NotFoundError } from "@/lib/utils/errors";
import type { Service, ServiceFaq, ServiceWithRelations } from "@/models";
import type { PaginatedResult } from "@/types";
import { upsertSeo } from "@/server/repositories/seo.repository";

function mapService(row: Service): Service {
  return {
    ...row,
    benefits: parseJson<string[] | null>(row.benefits, []),
    symptoms: parseJson<string[] | null>(row.symptoms, []),
  };
}

export async function listServices(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  featured?: boolean;
  all?: boolean;
}) {
  const { page, pageSize, offset } = pagination(opts.page, opts.pageSize);
  const filters: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    filters.push("(s.name LIKE ? OR s.slug LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.status) {
    filters.push("s.status = ?");
    params.push(opts.status);
  }
  if (opts.featured) filters.push("s.is_featured = 1");
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM services s ${where}`,
    params,
  );
  const limitSql = opts.all ? "" : "LIMIT ? OFFSET ?";
  const limitParams = opts.all ? [] : [pageSize, offset];
  const data = await query<Service>(
    `SELECT s.*, m.url AS image_url FROM services s
     LEFT JOIN media m ON m.id = s.image_id
     ${where} ORDER BY s.sort_order ASC, s.name ASC ${limitSql}`,
    [...params, ...limitParams],
  );
  return {
    data: data.map(mapService),
    total: totalRow?.count || 0,
    page,
    pageSize: opts.all ? data.length : pageSize,
    totalPages: opts.all ? 1 : Math.ceil((totalRow?.count || 0) / pageSize),
  } satisfies PaginatedResult<Service>;
}

export async function getPublishedServices() {
  const { data } = await listServices({ status: "published", all: true, pageSize: 100 });
  return data;
}

export async function getServiceById(id: number): Promise<ServiceWithRelations> {
  const row = await queryOne<Service>(
    `SELECT s.*, m.url AS image_url FROM services s LEFT JOIN media m ON m.id = s.image_id WHERE s.id = ?`,
    [id],
  );
  if (!row) throw new NotFoundError("Service not found");
  const faqs = await query<ServiceFaq>(
    "SELECT * FROM service_faqs WHERE service_id = ? ORDER BY sort_order ASC, id ASC",
    [id],
  );
  return { ...mapService(row), faqs };
}

export async function getServiceBySlug(slug: string, publishedOnly = true) {
  const sql = publishedOnly
    ? `SELECT s.*, m.url AS image_url FROM services s LEFT JOIN media m ON m.id = s.image_id WHERE s.slug = ? AND s.status = 'published'`
    : `SELECT s.*, m.url AS image_url FROM services s LEFT JOIN media m ON m.id = s.image_id WHERE s.slug = ?`;
  const row = await queryOne<Service>(sql, [slug]);
  if (!row) return null;
  const faqs = await query<ServiceFaq>(
    "SELECT * FROM service_faqs WHERE service_id = ? ORDER BY sort_order ASC, id ASC",
    [row.id],
  );
  return { ...mapService(row), faqs };
}

export async function saveService(input: {
  id?: number;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  image_id?: number | null;
  icon?: string | null;
  benefits?: string[] | null;
  symptoms?: string[] | null;
  is_featured?: boolean;
  status?: "draft" | "published";
  sort_order?: number;
  faqs?: Array<{ id?: number; question: string; answer: string; sort_order?: number }>;
  seo?: Record<string, unknown>;
}) {
  const id = await transaction(async (tx) => {
    let serviceId = input.id;
    const values = [
      input.name,
      input.slug,
      input.short_description ?? null,
      input.description ?? null,
      input.image_id ?? null,
      input.icon ?? null,
      JSON.stringify(input.benefits || []),
      JSON.stringify(input.symptoms || []),
      input.is_featured ? 1 : 0,
      input.status || "draft",
      input.sort_order ?? 0,
    ];
    if (serviceId) {
      await tx.execute(
        `UPDATE services SET name=?, slug=?, short_description=?, description=?, image_id=?, icon=?, benefits=?, symptoms=?, is_featured=?, status=?, sort_order=? WHERE id=?`,
        [...values, serviceId],
      );
    } else {
      serviceId = (
        await tx.execute(
          `INSERT INTO services (name, slug, short_description, description, image_id, icon, benefits, symptoms, is_featured, status, sort_order)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          values,
        )
      ).insertId;
    }

    if (input.faqs) {
      const keep: number[] = [];
      for (const [index, faq] of input.faqs.entries()) {
        if (faq.id) {
          await tx.execute(
            "UPDATE service_faqs SET question=?, answer=?, sort_order=? WHERE id=? AND service_id=?",
            [faq.question, faq.answer, faq.sort_order ?? index, faq.id, serviceId],
          );
          keep.push(faq.id);
        } else {
          const result = await tx.execute(
            "INSERT INTO service_faqs (service_id, question, answer, sort_order) VALUES (?,?,?,?)",
            [serviceId, faq.question, faq.answer, faq.sort_order ?? index],
          );
          keep.push(result.insertId);
        }
      }
      if (keep.length) {
        await tx.execute(
          `DELETE FROM service_faqs WHERE service_id = ? AND id NOT IN (${keep.map(() => "?").join(",")})`,
          [serviceId, ...keep],
        );
      } else {
        await tx.execute("DELETE FROM service_faqs WHERE service_id = ?", [serviceId]);
      }
    }
    return serviceId!;
  });

  if (input.seo) await upsertSeo("service", id, input.seo);
  return getServiceById(id);
}

export async function deleteService(id: number) {
  await execute("DELETE FROM services WHERE id = ?", [id]);
}
