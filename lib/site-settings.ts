import type { SettingsMap } from "@/types";
import { phoneHref, whatsappHref } from "@/lib/utils/cn";

export function businessPhone(settings: SettingsMap) {
  return settings["business.phone"] || "";
}

export function businessWhatsApp(settings: SettingsMap) {
  return settings["business.whatsapp"] || settings["business.phone"] || "";
}

export function applySettingsTokens(value: string, settings: SettingsMap) {
  if (!value || !value.includes("{{")) return value;
  return value
    .replaceAll("{{name}}", settings["business.name"] || "")
    .replaceAll("{{phone}}", settings["business.phone"] || "")
    .replaceAll("{{whatsapp}}", businessWhatsApp(settings))
    .replaceAll("{{email}}", settings["business.email"] || "")
    .replaceAll("{{address}}", settings["business.address"] || "")
    .replaceAll("{{hours}}", settings["business.working_hours"] || "")
    .replaceAll("{{city}}", settings["business.city"] || "");
}

function labelText(label?: string) {
  return (label || "").toLowerCase();
}

export function resolveActionHref(href: string | undefined, label: string | undefined, settings: SettingsMap) {
  const raw = (href || "").trim();
  const lower = raw.toLowerCase();
  const labelLow = labelText(label);
  const phone = businessPhone(settings);
  const wa = businessWhatsApp(settings);

  const isWhatsApp =
    lower.includes("wa.me") ||
    lower.startsWith("whatsapp") ||
    lower === "/whatsapp" ||
    labelLow.includes("whatsapp");
  if (isWhatsApp && wa) return whatsappHref(wa);

  const isCall =
    lower.startsWith("tel:") ||
    lower === "call" ||
    lower === "phone" ||
    lower === "/call" ||
    labelLow.includes("call now") ||
    labelLow === "call" ||
    labelLow.startsWith("call ");
  if (isCall && phone) return phoneHref(phone);

  return raw || "/";
}

export function isExternalAction(href: string) {
  return href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("https://wa.me") || href.startsWith("http");
}
