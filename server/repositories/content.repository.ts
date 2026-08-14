import { execute, query, queryOne } from "@/lib/db/query";
import { pagination } from "@/lib/utils/cn";
import { NotFoundError } from "@/lib/utils/errors";
import type { Faq, Testimonial, Lead, Media, Menu, MenuItem, User } from "@/models";
import type { PaginatedResult } from "@/types";
import { hashPassword } from "@/lib/auth/password";

export async function listFaqs(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  pageId?: number | null;
  category?: string;
  all?: boolean;
}) {
  const { page, pageSize, offset } = pagination(opts.page, opts.pageSize);
  const filters: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    filters.push("(question LIKE ? OR answer LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.status) {
    filters.push("status = ?");
    params.push(opts.status);
  }
  if (opts.pageId) {
    filters.push("page_id = ?");
    params.push(opts.pageId);
  }
  if (opts.category) {
    filters.push("category = ?");
    params.push(opts.category);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM faqs ${where}`,
    params,
  );
  const limitSql = opts.all ? "" : "LIMIT ? OFFSET ?";
  const limitParams = opts.all ? [] : [pageSize, offset];
  const data = await query<Faq>(
    `SELECT * FROM faqs ${where} ORDER BY sort_order ASC, id ASC ${limitSql}`,
    [...params, ...limitParams],
  );
  return {
    data,
    total: totalRow?.count || 0,
    page,
    pageSize: opts.all ? data.length : pageSize,
    totalPages: opts.all ? 1 : Math.ceil((totalRow?.count || 0) / pageSize),
  } satisfies PaginatedResult<Faq>;
}

export async function getActiveFaqs(category?: string, pageId?: number) {
  const filters = ["status = 'active'"];
  const params: unknown[] = [];
  if (category) {
    filters.push("category = ?");
    params.push(category);
  }
  if (pageId) {
    filters.push("(page_id IS NULL OR page_id = ?)");
    params.push(pageId);
  }
  return query<Faq>(
    `SELECT * FROM faqs WHERE ${filters.join(" AND ")} ORDER BY sort_order ASC`,
    params,
  );
}

export async function saveFaq(input: Partial<Faq> & { question: string; answer: string }) {
  if (input.id) {
    await execute(
      "UPDATE faqs SET question=?, answer=?, page_id=?, category=?, sort_order=?, status=? WHERE id=?",
      [
        input.question,
        input.answer,
        input.page_id ?? null,
        input.category ?? null,
        input.sort_order ?? 0,
        input.status || "active",
        input.id,
      ],
    );
    return input.id;
  }
  return (
    await execute(
      "INSERT INTO faqs (question, answer, page_id, category, sort_order, status) VALUES (?,?,?,?,?,?)",
      [
        input.question,
        input.answer,
        input.page_id ?? null,
        input.category ?? null,
        input.sort_order ?? 0,
        input.status || "active",
      ],
    )
  ).insertId;
}

export async function deleteFaq(id: number) {
  await execute("DELETE FROM faqs WHERE id = ?", [id]);
}

export async function listTestimonials(opts: {
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
    filters.push("(customer_name LIKE ? OR review LIKE ? OR location LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.status) {
    filters.push("t.status = ?");
    params.push(opts.status);
  }
  if (opts.featured) filters.push("t.is_featured = 1");
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM testimonials t ${where}`,
    params,
  );
  const limitSql = opts.all ? "" : "LIMIT ? OFFSET ?";
  const limitParams = opts.all ? [] : [pageSize, offset];
  const data = await query<Testimonial>(
    `SELECT t.*, m.url AS image_url FROM testimonials t
     LEFT JOIN media m ON m.id = t.image_id
     ${where} ORDER BY t.is_featured DESC, t.review_date DESC, t.id DESC ${limitSql}`,
    [...params, ...limitParams],
  );
  return {
    data,
    total: totalRow?.count || 0,
    page,
    pageSize: opts.all ? data.length : pageSize,
    totalPages: opts.all ? 1 : Math.ceil((totalRow?.count || 0) / pageSize),
  } satisfies PaginatedResult<Testimonial>;
}

export async function saveTestimonial(input: {
  id?: number;
  customer_name: string;
  rating: number;
  review: string;
  location?: string | null;
  image_id?: number | null;
  review_date?: string | null;
  is_featured?: boolean;
  status?: "active" | "inactive";
}) {
  const values = [
    input.customer_name,
    input.rating,
    input.review,
    input.location ?? null,
    input.image_id ?? null,
    input.review_date ?? null,
    input.is_featured ? 1 : 0,
    input.status || "active",
  ];
  if (input.id) {
    await execute(
      "UPDATE testimonials SET customer_name=?, rating=?, review=?, location=?, image_id=?, review_date=?, is_featured=?, status=? WHERE id=?",
      [...values, input.id],
    );
    return input.id;
  }
  return (
    await execute(
      "INSERT INTO testimonials (customer_name, rating, review, location, image_id, review_date, is_featured, status) VALUES (?,?,?,?,?,?,?,?)",
      values,
    )
  ).insertId;
}

export async function deleteTestimonial(id: number) {
  await execute("DELETE FROM testimonials WHERE id = ?", [id]);
}

export async function listLeads(opts: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
}) {
  const { page, pageSize, offset } = pagination(opts.page, opts.pageSize);
  const filters: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    filters.push("(customer_name LIKE ? OR phone LIKE ? OR email LIKE ? OR city LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`, `%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.status) {
    filters.push("status = ?");
    params.push(opts.status);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM leads ${where}`,
    params,
  );
  const data = await query<Lead>(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );
  return {
    data,
    total: totalRow?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalRow?.count || 0) / pageSize),
  } satisfies PaginatedResult<Lead>;
}

export async function getLeadById(id: number) {
  const row = await queryOne<Lead>("SELECT * FROM leads WHERE id = ?", [id]);
  if (!row) throw new NotFoundError("Lead not found");
  return row;
}

export async function createLead(input: {
  customer_name: string;
  phone: string;
  email?: string | null;
  tv_brand?: string | null;
  tv_type?: string | null;
  tv_size?: string | null;
  problem?: string | null;
  address?: string | null;
  city?: string | null;
  pincode?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  source?: string | null;
}) {
  return (
    await execute(
      `INSERT INTO leads (customer_name, phone, email, tv_brand, tv_type, tv_size, problem, address, city, pincode, preferred_date, preferred_time, message, source)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        input.customer_name,
        input.phone,
        input.email || null,
        input.tv_brand ?? null,
        input.tv_type ?? null,
        input.tv_size ?? null,
        input.problem ?? null,
        input.address ?? null,
        input.city ?? null,
        input.pincode ?? null,
        input.preferred_date || null,
        input.preferred_time ?? null,
        input.message ?? null,
        input.source || "website",
      ],
    )
  ).insertId;
}

export async function updateLead(
  id: number,
  input: { status?: Lead["status"]; assigned_technician?: string | null; notes?: string | null },
) {
  await execute(
    "UPDATE leads SET status=COALESCE(?, status), assigned_technician=?, notes=? WHERE id=?",
    [input.status ?? null, input.assigned_technician ?? null, input.notes ?? null, id],
  );
  return getLeadById(id);
}

export async function deleteLead(id: number) {
  await execute("DELETE FROM leads WHERE id = ?", [id]);
}

export async function listMedia(opts: { page?: number; pageSize?: number; q?: string }) {
  const { page, pageSize, offset } = pagination(opts.page, opts.pageSize);
  const filters: string[] = [];
  const params: unknown[] = [];
  if (opts.q) {
    filters.push("(original_name LIKE ? OR alt_text LIKE ? OR title LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`, `%${opts.q}%`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const totalRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) AS count FROM media ${where}`,
    params,
  );
  const data = await query<Media>(
    `SELECT * FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );
  return {
    data,
    total: totalRow?.count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalRow?.count || 0) / pageSize),
  } satisfies PaginatedResult<Media>;
}

export async function createMedia(input: Omit<Media, "id" | "created_at">) {
  return (
    await execute(
      `INSERT INTO media (filename, original_name, url, path, mime_type, size, width, height, alt_text, title)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        input.filename,
        input.original_name,
        input.url,
        input.path,
        input.mime_type,
        input.size,
        input.width,
        input.height,
        input.alt_text,
        input.title,
      ],
    )
  ).insertId;
}

export async function updateMedia(id: number, input: { alt_text?: string | null; title?: string | null }) {
  await execute("UPDATE media SET alt_text=?, title=? WHERE id=?", [
    input.alt_text ?? null,
    input.title ?? null,
    id,
  ]);
}

export async function getMediaById(id: number) {
  return queryOne<Media>("SELECT * FROM media WHERE id = ?", [id]);
}

export async function deleteMedia(id: number) {
  const row = await getMediaById(id);
  if (!row) throw new NotFoundError("Media not found");
  await execute("DELETE FROM media WHERE id = ?", [id]);
  return row;
}

export async function listMenus() {
  const menus = await query<Menu>("SELECT * FROM menus ORDER BY id ASC");
  const items = await query<MenuItem>("SELECT * FROM menu_items ORDER BY sort_order ASC, id ASC");
  return menus.map((menu) => ({
    ...menu,
    items: nestItems(items.filter((item) => item.menu_id === menu.id)),
  }));
}

export async function getMenuByLocation(location: string) {
  const menu = await queryOne<Menu>("SELECT * FROM menus WHERE location = ?", [location]);
  if (!menu) return null;
  const items = await query<MenuItem>(
    "SELECT * FROM menu_items WHERE menu_id = ? AND is_enabled = 1 ORDER BY sort_order ASC, id ASC",
    [menu.id],
  );
  return { ...menu, items: nestItems(items) };
}

function nestItems(items: MenuItem[]): MenuItem[] {
  const map = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];
  for (const item of items) map.set(item.id, { ...item, children: [] });
  for (const item of map.values()) {
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children!.push(item);
    } else {
      roots.push(item);
    }
  }
  return roots;
}

export async function saveMenu(input: {
  id?: number;
  name: string;
  location: string;
  items?: Array<{
    id?: number;
    parent_id?: number | null;
    label: string;
    url: string;
    target?: string;
    sort_order?: number;
    is_enabled?: boolean;
  }>;
}) {
  let menuId = input.id;
  if (menuId) {
    await execute("UPDATE menus SET name=?, location=? WHERE id=?", [
      input.name,
      input.location,
      menuId,
    ]);
  } else {
    menuId = (
      await execute("INSERT INTO menus (name, location) VALUES (?,?)", [
        input.name,
        input.location,
      ])
    ).insertId;
  }

  if (input.items) {
    await execute("DELETE FROM menu_items WHERE menu_id = ?", [menuId]);
    const idMap = new Map<number, number>();
    for (const [index, item] of input.items.entries()) {
      const parent =
        item.parent_id && idMap.has(item.parent_id) ? idMap.get(item.parent_id) : item.parent_id;
      const newId = (
        await execute(
          `INSERT INTO menu_items (menu_id, parent_id, label, url, target, sort_order, is_enabled)
           VALUES (?,?,?,?,?,?,?)`,
          [
            menuId,
            parent ?? null,
            item.label,
            item.url,
            item.target || "_self",
            item.sort_order ?? index,
            item.is_enabled === false ? 0 : 1,
          ],
        )
      ).insertId;
      if (item.id) idMap.set(item.id, newId);
    }
  }
  return menuId;
}

export async function deleteMenu(id: number) {
  await execute("DELETE FROM menus WHERE id = ?", [id]);
}

export async function getUserByEmail(email: string) {
  return queryOne<User>("SELECT * FROM users WHERE email = ?", [email]);
}

export async function getUserById(id: number) {
  return queryOne<User>("SELECT * FROM users WHERE id = ?", [id]);
}

export async function listUsers() {
  return query<Omit<User, "password_hash">>(
    "SELECT id, name, email, role, status, last_login_at, created_at, updated_at FROM users ORDER BY created_at DESC",
  );
}

export async function saveUser(input: {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role?: User["role"];
  status?: User["status"];
}) {
  if (input.id) {
    if (input.password) {
      const hash = await hashPassword(input.password);
      await execute(
        "UPDATE users SET name=?, email=?, password_hash=?, role=?, status=? WHERE id=?",
        [input.name, input.email, hash, input.role || "editor", input.status || "active", input.id],
      );
    } else {
      await execute("UPDATE users SET name=?, email=?, role=?, status=? WHERE id=?", [
        input.name,
        input.email,
        input.role || "editor",
        input.status || "active",
        input.id,
      ]);
    }
    return input.id;
  }
  const hash = await hashPassword(input.password || crypto.randomUUID());
  return (
    await execute(
      "INSERT INTO users (name, email, password_hash, role, status) VALUES (?,?,?,?,?)",
      [input.name, input.email, hash, input.role || "editor", input.status || "active"],
    )
  ).insertId;
}

export async function updateUserPassword(id: number, hash: string) {
  await execute("UPDATE users SET password_hash=? WHERE id=?", [hash, id]);
}

export async function touchLogin(id: number) {
  await execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [id]);
}

export async function createPasswordReset(userId: number, token: string, expiresAt: Date) {
  await execute("DELETE FROM password_resets WHERE user_id = ?", [userId]);
  await execute("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)", [
    userId,
    token,
    expiresAt.toISOString().slice(0, 19).replace("T", " "),
  ]);
}

export async function consumePasswordReset(token: string) {
  const row = await queryOne<{ user_id: number; expires_at: string }>(
    "SELECT user_id, expires_at FROM password_resets WHERE token = ?",
    [token],
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  await execute("DELETE FROM password_resets WHERE token = ?", [token]);
  return row.user_id;
}

export async function getDashboardStats() {
  const [leads, newLeads, completed, services, pages, blogs, testimonials] =
    await Promise.all([
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM leads"),
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM leads WHERE status = 'new'"),
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM leads WHERE status = 'completed'"),
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM services"),
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM pages"),
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM blogs"),
      queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM testimonials"),
    ]);

  const leadChart = await query<{ day: string; count: number }>(
    `SELECT DATE(created_at) AS day, COUNT(*) AS count
     FROM leads WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
     GROUP BY DATE(created_at) ORDER BY day ASC`,
  );

  const recentLeads = await query<Lead>(
    "SELECT * FROM leads ORDER BY created_at DESC LIMIT 8",
  );
  const popularServices = await query<ServiceLite>(
    "SELECT id, name, slug, is_featured FROM services WHERE status = 'published' ORDER BY is_featured DESC, sort_order ASC LIMIT 6",
  );
  const recentPages = await query<{ id: number; title: string; slug: string; status: string; updated_at: string }>(
    "SELECT id, title, slug, status, updated_at FROM pages ORDER BY updated_at DESC LIMIT 5",
  );

  return {
    cards: {
      totalLeads: leads?.count || 0,
      newLeads: newLeads?.count || 0,
      completedJobs: completed?.count || 0,
      services: services?.count || 0,
      pages: pages?.count || 0,
      blogs: blogs?.count || 0,
      testimonials: testimonials?.count || 0,
    },
    leadChart,
    recentLeads,
    popularServices,
    recentPages,
  };
}

interface ServiceLite {
  id: number;
  name: string;
  slug: string;
  is_featured: number;
}

export async function listPublishedSlugs() {
  const [pages, services, blogs] = await Promise.all([
    query<{ slug: string; updated_at: string }>(
      "SELECT slug, updated_at FROM pages WHERE status = 'published'",
    ),
    query<{ slug: string; updated_at: string }>(
      "SELECT slug, updated_at FROM services WHERE status = 'published'",
    ),
    query<{ slug: string; updated_at: string }>(
      "SELECT slug, updated_at FROM blogs WHERE status = 'published'",
    ),
  ]);
  return { pages, services, blogs };
}

export async function getActiveRedirects() {
  return query<{ from_path: string; to_path: string; status_code: number }>(
    "SELECT from_path, to_path, status_code FROM redirects WHERE is_active = 1",
  );
}
