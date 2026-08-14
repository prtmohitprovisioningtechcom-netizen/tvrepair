"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import { PageBuilder, defaultSection, type BuilderSection } from "@/components/admin/PageBuilder";
import { SEOFields, type SeoForm } from "@/components/admin/SEOFields";
import { ImageField } from "@/components/admin/ImageField";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { slugify } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui";
import type { SectionType } from "@/types";

export function PageEditor({ id }: { id?: number }) {
  const router = useRouter();
  const toast = useUiStore((s) => s.pushToast);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isHomepage, setIsHomepage] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [sections, setSections] = useState<BuilderSection[]>([defaultSection("hero")]);
  const [seo, setSeo] = useState<SeoForm>({});
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    apiGet<{
      title: string;
      slug: string;
      status: "draft" | "published";
      is_homepage: number;
      excerpt: string | null;
      featured_image_id?: number | null;
      featured_image_url?: string | null;
      sections: BuilderSection[];
      seo?: SeoForm;
    }>(`/pages/${id}`)
      .then((page) => {
        setTitle(page.title);
        setSlug(page.slug);
        setStatus(page.status);
        setIsHomepage(Boolean(page.is_homepage));
        setExcerpt(page.excerpt || "");
        setFeaturedImageId(page.featured_image_id ?? null);
        setFeaturedImageUrl(page.featured_image_url || "");
        setSections(page.sections?.length ? page.sections.map((s) => ({ ...s, is_visible: Boolean(s.is_visible) })) : [defaultSection("hero")]);
        setSeo(page.seo || {});
      })
      .catch((e) => toast("error", e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      slug: slugify(slug || title),
      status,
      is_homepage: isHomepage,
      excerpt,
      featured_image_id: featuredImageId,
      sections: sections.map((s, i) => ({
        id: s.id,
        type: s.type as SectionType,
        title: s.title ?? null,
        content: s.content || {},
        settings: s.settings ?? null,
        sort_order: i,
        is_visible: Boolean(s.is_visible),
      })),
      seo: {
        seo_title: seo.seo_title ?? null,
        meta_description: seo.meta_description ?? null,
        focus_keyword: seo.focus_keyword ?? null,
        canonical_url: seo.canonical_url ?? null,
        robots_index: seo.robots_index !== 0 && seo.robots_index !== false,
        robots_follow: seo.robots_follow !== 0 && seo.robots_follow !== false,
        og_title: seo.og_title ?? null,
        og_description: seo.og_description ?? null,
        og_image_id: seo.og_image_id ?? null,
        twitter_title: seo.twitter_title ?? null,
        twitter_description: seo.twitter_description ?? null,
        twitter_image_id: seo.twitter_image_id ?? null,
        schema_type: seo.schema_type ?? null,
      },
    };
    try {
      if (id) {
        await apiPut(`/pages/${id}`, payload);
        toast("success", "Page saved");
      } else {
        const created = await apiPost<{ id: number }>("/pages", payload);
        toast("success", "Page created");
        router.push(`/admin/pages/${created.id}`);
      }
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Save failed");
    }
  }

  if (loading) return <p className="text-muted">Loading page…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Website</p>
          <h1 className="font-display text-3xl">{id ? "Edit this page" : "New page"}</h1>
          <p className="mt-1 text-sm text-muted">Change the fields below, click Save page, then open View website.</p>
        </div>
        <Button type="submit">Save page</Button>
      </div>
      {slug === "home" || isHomepage ? (
        <AdminGuide
          title="This is the homepage"
          changes={[
            "Top banner heading, photo and Book a Repair button",
            "Why households call Helix cards and photos",
            "TV services list heading (photos are in TV services)",
            "Other blocks on the home page",
          ]}
        />
      ) : (
        <AdminGuide
          changes={[
            "Text, photos and buttons on this page only",
            "Published = visible on the website. Draft = hidden",
          ]}
        />
      )}
      <div className="grid gap-4 border border-line bg-white p-5 md:grid-cols-2">
        <Field label="Page name in admin" hint="For you. Visitors see the headings inside the blocks below.">
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!id) setSlug(slugify(e.target.value));
            }}
            required
          />
        </Field>
        <Field label="Website address" hint="home = helix site home. about = /about">
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </Field>
        <Field label="Show on website?">
          <Select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}>
            <option value="published">Published — live on website</option>
            <option value="draft">Draft — hidden</option>
          </Select>
        </Field>
        <label className="flex items-center gap-2 self-end text-sm">
          <input type="checkbox" checked={isHomepage} onChange={(e) => setIsHomepage(e.target.checked)} />
          This is the homepage
        </label>
        <Field label="Short summary" hint="Optional. Used in lists / SEO, not the main headline.">
          <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </Field>
        <ImageField
          label="Page banner photo"
          hint="Used on inner pages (About, Contact). Homepage uses the Top banner photo instead."
          url={featuredImageUrl}
          onChange={(next) => {
            setFeaturedImageId(next?.id ?? null);
            setFeaturedImageUrl(next?.url ?? "");
          }}
        />
      </div>
      <PageBuilder sections={sections} onChange={setSections} />
      <section className="border border-line bg-white p-5">
        <h2 className="mb-1 font-display text-xl">Google search title</h2>
        <p className="mb-4 text-sm text-muted">This is what Google / WhatsApp preview shows. It is not the big heading on the page.</p>
        <SEOFields value={seo} onChange={setSeo} />
      </section>
    </form>
  );
}
