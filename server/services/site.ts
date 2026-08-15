import { cache } from "react";
import { getSettingsMap } from "@/server/repositories/settings.repository";
import { getMenuByLocation } from "@/server/repositories/content.repository";
import { getPublishedServices } from "@/server/repositories/services.repository";
import { getActiveFaqs, listTestimonials } from "@/server/repositories/content.repository";
import type { Faq, Menu, Service } from "@/models";
import type { SettingsMap } from "@/types";

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  if (result.status === "fulfilled") return result.value;
  console.error("[site]", result.reason);
  return fallback;
}

export const getSiteContext = cache(async () => {
  const [settings, header, footer, footerLegal, services, faqs, testimonials] = await Promise.allSettled([
    getSettingsMap(),
    getMenuByLocation("header"),
    getMenuByLocation("footer"),
    getMenuByLocation("footer_legal"),
    getPublishedServices(),
    getActiveFaqs(),
    listTestimonials({ status: "active", all: true, pageSize: 20 }),
  ]);
  return {
    settings: settled<SettingsMap>(settings, {}),
    header: settled<Menu | null>(header, null),
    footer: settled<Menu | null>(footer, null),
    footerLegal: settled<Menu | null>(footerLegal, null),
    services: settled<Service[]>(services, []),
    faqs: settled<Faq[]>(faqs, []),
    testimonials: testimonials.status === "fulfilled" ? testimonials.value.data : [],
  };
});

export type SiteContext = Awaited<ReturnType<typeof getSiteContext>>;
