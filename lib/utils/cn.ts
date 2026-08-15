import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function siteUrl(path = ""): string {
  let base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim();
  if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
  base = base.replace(/\/$/, "") || "http://localhost:3000";
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(value: string, length = 160): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1).trim()}…`;
}

export function toBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function pagination(page = 1, pageSize = 20) {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  return {
    page: safePage,
    pageSize: safeSize,
    offset: (safePage - 1) * safeSize,
  };
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappDigits(phone: string): string {
  let digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("0") && digits.length === 11) digits = `91${digits.slice(1)}`;
  else if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

export function whatsappHref(phone: string, text?: string): string {
  const digits = whatsappDigits(phone);
  const msg = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${msg}`;
}

export function absoluteMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return siteUrl(url);
}
