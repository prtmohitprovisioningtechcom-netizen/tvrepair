import { z } from "zod";

const dbBool = z
  .union([z.boolean(), z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    return !(value === false || value === 0 || value === "0");
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(72),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(72),
});

export const seoSchema = z.object({
  seo_title: z.string().max(255).optional().nullable(),
  meta_description: z.string().max(320).optional().nullable(),
  focus_keyword: z.string().max(160).optional().nullable(),
  canonical_url: z.string().max(500).optional().nullable(),
  robots_index: dbBool,
  robots_follow: dbBool,
  og_title: z.string().max(255).optional().nullable(),
  og_description: z.string().max(320).optional().nullable(),
  og_image_id: z.number().int().optional().nullable(),
  og_image_url: z.string().optional().nullable(),
  twitter_title: z.string().max(255).optional().nullable(),
  twitter_description: z.string().max(320).optional().nullable(),
  twitter_image_id: z.number().int().optional().nullable(),
  twitter_image_url: z.string().optional().nullable(),
  schema_type: z.string().max(80).optional().nullable(),
});

export const pageSectionSchema = z.object({
  id: z.number().int().optional(),
  type: z.string().min(1),
  title: z.string().max(255).optional().nullable(),
  content: z.record(z.string(), z.unknown()).default({}),
  settings: z.record(z.string(), z.unknown()).optional().nullable(),
  sort_order: z.number().int().default(0),
  is_visible: z
    .union([z.boolean(), z.number()])
    .optional()
    .transform((value) => (value === undefined ? true : Boolean(value))),
});

export const pageSchema = z.object({
  title: z.string().min(2).max(255),
  slug: z.string().min(1).max(190),
  template: z.string().max(80).optional(),
  status: z.enum(["draft", "published"]).optional(),
  is_homepage: z.boolean().optional(),
  featured_image_id: z.number().int().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  sections: z.array(pageSectionSchema).optional(),
  seo: seoSchema.optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2).max(190),
  slug: z.string().min(1).max(190),
  short_description: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  image_id: z.number().int().optional().nullable(),
  icon: z.string().max(80).optional().nullable(),
  benefits: z.array(z.string()).optional().nullable(),
  symptoms: z.array(z.string()).optional().nullable(),
  is_featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  sort_order: z.number().int().optional(),
  faqs: z
    .array(
      z.object({
        id: z.number().int().optional(),
        question: z.string().min(3),
        answer: z.string().min(3),
        sort_order: z.number().int().optional(),
      }),
    )
    .optional(),
  seo: seoSchema.optional(),
});

export const blogSchema = z.object({
  title: z.string().min(2).max(255),
  slug: z.string().min(1).max(190),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  featured_image_id: z.number().int().optional().nullable(),
  author_id: z.number().int().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
  published_at: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  seo: seoSchema.optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(1).max(160),
  description: z.string().max(500).optional().nullable(),
});

export const faqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(5),
  page_id: z.number().int().optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  sort_order: z.number().int().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const testimonialSchema = z.object({
  customer_name: z.string().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(8),
  location: z.string().max(120).optional().nullable(),
  image_id: z.number().int().optional().nullable(),
  review_date: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const leadSchema = z.object({
  customer_name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().optional().or(z.literal("")),
  tv_brand: z.string().max(80).optional().nullable(),
  tv_type: z.string().max(80).optional().nullable(),
  tv_size: z.string().max(40).optional().nullable(),
  problem: z.string().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  preferred_date: z.string().optional().nullable(),
  preferred_time: z.string().max(40).optional().nullable(),
  message: z.string().optional().nullable(),
  source: z.string().max(80).optional(),
});

export const leadUpdateSchema = z.object({
  status: z
    .enum([
      "new",
      "contacted",
      "confirmed",
      "technician_assigned",
      "in_progress",
      "completed",
      "cancelled",
    ])
    .optional(),
  assigned_technician: z.string().max(120).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const menuItemSchema = z.object({
  id: z.number().int().optional(),
  parent_id: z.number().int().optional().nullable(),
  label: z.string().min(1).max(160),
  url: z.string().min(1).max(500),
  target: z.string().max(20).optional(),
  sort_order: z.number().int().optional(),
  is_enabled: z.boolean().optional(),
});

export const menuSchema = z.object({
  name: z.string().min(2).max(120),
  location: z.string().min(2).max(80),
  items: z.array(menuItemSchema).optional(),
});

export const settingsSchema = z.record(z.string(), z.string().nullable());

export const userSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72).optional(),
  role: z.enum(["admin", "editor", "technician"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const mediaMetaSchema = z.object({
  alt_text: z.string().max(255).optional().nullable(),
  title: z.string().max(255).optional().nullable(),
});
