"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import { SEOFields, type SeoForm } from "@/components/admin/SEOFields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { slugify } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui";
import type { BlogCategory } from "@/models";

export function BlogEditor({ id }: { id?: number }) {
  const router = useRouter();
  const toast = useUiStore((s) => s.pushToast);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_id: null as number | null,
    featured_image_url: "",
    category_id: null as number | null,
    status: "draft" as "draft" | "published" | "scheduled",
    tags: "",
    scheduled_at: "",
  });
  const [seo, setSeo] = useState<SeoForm>({});

  useEffect(() => {
    apiGet<BlogCategory[]>("/categories").then(setCategories);
    if (!id) return;
    apiGet<typeof form & { seo?: SeoForm; tags?: { name: string }[] }>(`/blogs/${id}`).then((b) => {
      setForm({
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt || "",
        content: b.content || "",
        featured_image_id: b.featured_image_id,
        featured_image_url: (b as { image_url?: string }).image_url || "",
        category_id: b.category_id,
        status: b.status,
        tags: (b.tags || []).map((t) => t.name).join(", "),
        scheduled_at: b.scheduled_at || "",
      });
      setSeo(b.seo || {});
    });
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      slug: slugify(form.slug || form.title),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      seo,
    };
    try {
      if (id) {
        await apiPut(`/blogs/${id}`, payload);
        toast("success", "Blog saved");
      } else {
        const created = await apiPost<{ id: number }>("/blogs", payload);
        toast("success", "Blog created");
        router.push(`/admin/blogs/${created.id}`);
      }
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-between">
        <h1 className="font-display text-3xl">{id ? "Edit blog" : "New blog"}</h1>
        <Button type="submit">Save</Button>
      </div>
      <div className="grid gap-4 border border-line bg-white p-5 md:grid-cols-2">
        <Field label="Title">
          <Input value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value, slug: id ? form.slug : slugify(e.target.value) })} />
        </Field>
        <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
        <Field label="Excerpt"><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </Select>
        </Field>
        <Field label="Category">
          <Select value={form.category_id || ""} onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Tags"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
        <Field label="Schedule">
          <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
        </Field>
        <ImageField
          label="Featured image"
          hint="Shows on the blog list and article."
          url={form.featured_image_url}
          onChange={(next) =>
            setForm({ ...form, featured_image_id: next?.id ?? null, featured_image_url: next?.url ?? "" })
          }
        />
      </div>
      <div className="border border-line bg-white p-5">
        <h2 className="mb-3 font-display text-xl">Content</h2>
        <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
      </div>
      <section className="border border-line bg-white p-5">
        <h2 className="mb-4 font-display text-xl">SEO</h2>
        <SEOFields value={seo} onChange={setSeo} />
      </section>
    </form>
  );
}
