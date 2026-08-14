export type UserRole = "admin" | "editor" | "technician";
export type PublishStatus = "draft" | "published";
export type BlogStatus = "draft" | "published" | "scheduled";
export type ActiveStatus = "active" | "inactive";
export type LeadStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "technician_assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type SectionType =
  | "hero"
  | "text"
  | "image_text"
  | "services_grid"
  | "faq"
  | "testimonials"
  | "cta"
  | "features"
  | "statistics"
  | "gallery"
  | "contact_form"
  | "booking_form"
  | "video"
  | "rich_text"
  | "custom_html"
  | "brands"
  | "trust_badges"
  | "before_after";

export type SeoEntityType =
  | "page"
  | "service"
  | "blog"
  | "homepage";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}

export interface ButtonContent {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface SectionSettings {
  background?: string;
  textColor?: string;
  alignment?: "left" | "center" | "right";
  padding?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export interface SectionContent {
  [key: string]: unknown;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface SettingsMap {
  [key: string]: string;
}

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "technician_assigned", label: "Technician Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const SECTION_TYPES: { value: SectionType; label: string; help: string }[] = [
  { value: "hero", label: "Top banner", help: "Big heading, photo and Book a Repair button at the top of this page." },
  { value: "text", label: "Text block", help: "A heading and paragraph of text." },
  { value: "image_text", label: "Photo + text", help: "A photo beside a heading, paragraph and button." },
  { value: "services_grid", label: "TV services list", help: "Shows service cards. Photos and names come from TV services, not from here." },
  { value: "faq", label: "FAQs", help: "Shows questions from the FAQs menu." },
  { value: "testimonials", label: "Reviews", help: "Shows customer quotes from the Reviews menu." },
  { value: "cta", label: "Call / book strip", help: "Dark band with heading and buttons." },
  { value: "features", label: "Why choose us", help: "Three reason cards with photos (example: Why households call Helix)." },
  { value: "statistics", label: "Numbers", help: "Not shown on the public site right now." },
  { value: "gallery", label: "Photo gallery", help: "A grid of uploaded photos." },
  { value: "contact_form", label: "Contact form", help: "The message form on Contact." },
  { value: "booking_form", label: "Booking form", help: "The Book a Repair form on this page." },
  { value: "video", label: "Video", help: "An embedded video." },
  { value: "rich_text", label: "Long text", help: "Longer HTML content." },
  { value: "custom_html", label: "Custom HTML", help: "Advanced. Leave this unless you know HTML." },
  { value: "brands", label: "Brands we service", help: "Brand names (Samsung, LG…)." },
  { value: "trust_badges", label: "Brand strip", help: "Same as brands — names shown as a selector." },
  { value: "before_after", label: "Before / after", help: "Two photos side by side." },
];
