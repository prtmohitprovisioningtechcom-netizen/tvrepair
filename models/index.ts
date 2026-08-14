import type {
  ActiveStatus,
  BlogStatus,
  LeadStatus,
  PublishStatus,
  SectionContent,
  SectionSettings,
  SectionType,
  SeoEntityType,
  UserRole,
} from "@/types";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: ActiveStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  path: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  title: string | null;
  created_at: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  template: string;
  status: PublishStatus;
  is_homepage: number;
  featured_image_id: number | null;
  featured_image_url?: string | null;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: number;
  page_id: number;
  type: SectionType;
  title: string | null;
  content: SectionContent;
  settings: SectionSettings | null;
  sort_order: number;
  is_visible: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_id: number | null;
  icon: string | null;
  benefits: string[] | null;
  symptoms: string[] | null;
  is_featured: number;
  status: PublishStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
}

export interface ServiceFaq {
  id: number;
  service_id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_id: number | null;
  author_id: number | null;
  category_id: number | null;
  status: BlogStatus;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  author_name?: string | null;
  category_name?: string | null;
  tags?: BlogTag[];
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  page_id: number | null;
  category: string | null;
  sort_order: number;
  status: ActiveStatus;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  rating: number;
  review: string;
  location: string | null;
  image_id: number | null;
  review_date: string | null;
  is_featured: number;
  status: ActiveStatus;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
}

export interface Lead {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  tv_brand: string | null;
  tv_type: string | null;
  tv_size: string | null;
  problem: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: LeadStatus;
  assigned_technician: string | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: number;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id: number | null;
  label: string;
  url: string;
  target: string;
  sort_order: number;
  is_enabled: number;
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
}

export interface Setting {
  id: number;
  setting_key: string;
  setting_value: string | null;
  group_name: string;
  updated_at: string;
}

export interface SeoMetadata {
  id: number;
  entity_type: SeoEntityType;
  entity_id: number;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  robots_index: number;
  robots_follow: number;
  og_title: string | null;
  og_description: string | null;
  og_image_id: number | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_id: number | null;
  schema_type: string | null;
  created_at: string;
  updated_at: string;
  og_image_url?: string | null;
  twitter_image_url?: string | null;
}

export interface Redirect {
  id: number;
  from_path: string;
  to_path: string;
  status_code: number;
  is_active: number;
  created_at: string;
}

export interface PageWithSections extends Page {
  sections: PageSection[];
}

export interface ServiceWithRelations extends Service {
  faqs: ServiceFaq[];
}

export interface GalleryImage {
  id: number;
  media_id: number;
  caption: string | null;
  sort_order: number;
  is_visible: number;
  created_at: string;
  image_url?: string | null;
  alt_text?: string | null;
}
