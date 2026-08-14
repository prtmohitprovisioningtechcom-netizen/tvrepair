import type { Service, Testimonial } from "@/models";
import type { SettingsMap } from "@/types";
import { siteUrl } from "@/lib/utils/cn";

export function organizationSchema(settings: SettingsMap) {
  return {
    "@type": "Organization",
    name: settings["business.name"],
    url: siteUrl(),
    logo: settings["business.logo"]
      ? siteUrl(settings["business.logo"])
      : undefined,
    telephone: settings["business.phone"],
    email: settings["business.email"],
    address: {
      "@type": "PostalAddress",
      streetAddress: settings["business.address"],
      addressLocality: settings["business.city"],
      postalCode: settings["business.pincode"],
      addressCountry: "IN",
    },
    sameAs: [
      settings["social.facebook"],
      settings["social.instagram"],
      settings["social.youtube"],
      settings["social.linkedin"],
      settings["social.twitter"],
    ].filter(Boolean),
  };
}

export function localBusinessSchema(settings: SettingsMap) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl()}/#business`,
    name: settings["business.name"],
    image: settings["business.logo"]
      ? siteUrl(settings["business.logo"])
      : undefined,
    url: siteUrl(),
    telephone: settings["business.phone"],
    email: settings["business.email"],
    address: {
      "@type": "PostalAddress",
      streetAddress: settings["business.address"],
      addressLocality: settings["business.city"],
      postalCode: settings["business.pincode"],
      addressCountry: "IN",
    },
    openingHours: settings["business.working_hours"],
    priceRange: "₹₹",
    areaServed: "Delhi NCR",
  };
}

export function websiteSchema(settings: SettingsMap) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings["business.name"],
    url: siteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl()}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function serviceSchema(service: Service, settings: SettingsMap) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.short_description || service.description || "",
    provider: organizationSchema(settings),
    areaServed: "Delhi NCR",
    url: siteUrl(`/tv-repair/${service.slug}`),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  author?: string | null;
  settings: SettingsMap;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      "@type": "Person",
      name: opts.author || opts.settings["business.name"],
    },
    publisher: organizationSchema(opts.settings),
  };
}

export function reviewSchema(reviews: Testimonial[], settings: SettingsMap) {
  if (!reviews.length) return null;
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings["business.name"],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
    },
    review: reviews.slice(0, 8).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customer_name },
      reviewBody: r.review,
      reviewRating: { "@type": "Rating", ratingValue: r.rating },
    })),
  };
}
