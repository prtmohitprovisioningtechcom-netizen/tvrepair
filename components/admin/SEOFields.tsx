"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ImageField } from "@/components/admin/ImageField";

export type SeoForm = {
  seo_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  robots_index?: boolean | number;
  robots_follow?: boolean | number;
  og_title?: string | null;
  og_description?: string | null;
  og_image_id?: number | null;
  og_image_url?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image_id?: number | null;
  twitter_image_url?: string | null;
  schema_type?: string | null;
};

export function SEOFields({
  value,
  onChange,
}: {
  value: SeoForm;
  onChange: (next: SeoForm) => void;
}) {
  function set<K extends keyof SeoForm>(key: K, val: SeoForm[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Google title" hint="Blue title in Google results. Not the homepage heading.">
        <Input value={value.seo_title || ""} onChange={(e) => set("seo_title", e.target.value)} />
      </Field>
      <Field label="Main keyword" hint="Optional, for your notes.">
        <Input value={value.focus_keyword || ""} onChange={(e) => set("focus_keyword", e.target.value)} />
      </Field>
      <Field label="Google description" hint="Grey text under the Google title.">
        <Textarea value={value.meta_description || ""} onChange={(e) => set("meta_description", e.target.value)} />
      </Field>
      <Field label="Canonical URL">
        <Input value={value.canonical_url || ""} onChange={(e) => set("canonical_url", e.target.value)} />
      </Field>
      <Field label="Robots index">
        <Select
          value={value.robots_index === 0 || value.robots_index === false ? "0" : "1"}
          onChange={(e) => set("robots_index", e.target.value === "1")}
        >
          <option value="1">Index</option>
          <option value="0">Noindex</option>
        </Select>
      </Field>
      <Field label="Robots follow">
        <Select
          value={value.robots_follow === 0 || value.robots_follow === false ? "0" : "1"}
          onChange={(e) => set("robots_follow", e.target.value === "1")}
        >
          <option value="1">Follow</option>
          <option value="0">Nofollow</option>
        </Select>
      </Field>
      <Field label="OG title">
        <Input value={value.og_title || ""} onChange={(e) => set("og_title", e.target.value)} />
      </Field>
      <Field label="OG description">
        <Textarea value={value.og_description || ""} onChange={(e) => set("og_description", e.target.value)} />
      </Field>
      <ImageField
        label="Social share image"
        hint="Used for Google/Facebook/WhatsApp previews."
        url={value.og_image_url}
        onChange={(next) =>
          onChange({
            ...value,
            og_image_id: next?.id ?? null,
            og_image_url: next?.url ?? "",
            twitter_image_id: next?.id ?? null,
            twitter_image_url: next?.url ?? "",
          })
        }
      />
      <Field label="Twitter title">
        <Input value={value.twitter_title || ""} onChange={(e) => set("twitter_title", e.target.value)} />
      </Field>
      <Field label="Twitter description">
        <Textarea value={value.twitter_description || ""} onChange={(e) => set("twitter_description", e.target.value)} />
      </Field>
      <Field label="Schema type">
        <Select value={value.schema_type || ""} onChange={(e) => set("schema_type", e.target.value)}>
          <option value="">Default</option>
          <option value="WebSite">WebSite</option>
          <option value="LocalBusiness">LocalBusiness</option>
          <option value="Service">Service</option>
          <option value="FAQPage">FAQPage</option>
          <option value="Article">Article</option>
          <option value="Organization">Organization</option>
        </Select>
      </Field>
    </div>
  );
}
