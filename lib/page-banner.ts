import type { PageSection } from "@/models";

export function hasSection(sections: PageSection[] | undefined, type: string) {
  return Boolean(sections?.some((s) => s.type === type));
}

export function pageBanner(
  page?: {
    featured_image_url?: string | null;
    sections?: PageSection[];
  } | null,
) {
  if (page?.featured_image_url) return page.featured_image_url;
  const hero = page?.sections?.find((s) => s.type === "hero");
  const image = hero?.content?.image;
  return typeof image === "string" && image ? image : null;
}
