import { cache } from "react";
import { getSettingsMap } from "@/server/repositories/settings.repository";
import { getMenuByLocation } from "@/server/repositories/content.repository";
import { getPublishedServices } from "@/server/repositories/services.repository";
import { getActiveFaqs, listTestimonials } from "@/server/repositories/content.repository";

export const getSiteContext = cache(async () => {
  const [settings, header, footer, footerLegal, services, faqs, testimonials] = await Promise.all([
    getSettingsMap(),
    getMenuByLocation("header"),
    getMenuByLocation("footer"),
    getMenuByLocation("footer_legal"),
    getPublishedServices(),
    getActiveFaqs(),
    listTestimonials({ status: "active", all: true, pageSize: 20 }),
  ]);
  return {
    settings,
    header,
    footer,
    footerLegal,
    services,
    faqs,
    testimonials: testimonials.data,
  };
});
