"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import { SEOFields, type SeoForm } from "@/components/admin/SEOFields";
import { ImageField } from "@/components/admin/ImageField";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { slugify } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui";

export function ServiceEditor({ id }: { id?: number }) {
  const router = useRouter();
  const toast = useUiStore((s) => s.pushToast);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    image_id: null as number | null,
    image_url: "",
    icon: "",
    benefits: "",
    symptoms: "",
    is_featured: false,
    status: "draft" as "draft" | "published",
    sort_order: 0,
    faqs: [{ question: "", answer: "" }],
  });
  const [seo, setSeo] = useState<SeoForm>({});

  useEffect(() => {
    if (!id) return;
    apiGet<typeof form & { seo?: SeoForm; faqs?: { question: string; answer: string }[]; benefits?: string[]; symptoms?: string[] }>(
      `/services/${id}`,
    ).then((s) => {
      setForm({
        name: s.name,
        slug: s.slug,
        short_description: s.short_description || "",
        description: s.description || "",
        image_id: s.image_id,
        image_url: s.image_url || "",
        icon: s.icon || "",
        benefits: (s.benefits || []).join("\n"),
        symptoms: (s.symptoms || []).join("\n"),
        is_featured: Boolean(s.is_featured),
        status: s.status,
        sort_order: s.sort_order || 0,
        faqs: s.faqs?.length ? s.faqs : [{ question: "", answer: "" }],
      });
      setSeo(s.seo || {});
    });
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      slug: slugify(form.slug || form.name),
      benefits: form.benefits.split("\n").map((v) => v.trim()).filter(Boolean),
      symptoms: form.symptoms.split("\n").map((v) => v.trim()).filter(Boolean),
      faqs: form.faqs.filter((f) => f.question && f.answer),
      seo,
    };
    try {
      if (id) {
        await apiPut(`/services/${id}`, payload);
        toast("success", "Service saved");
      } else {
        const created = await apiPost<{ id: number }>("/services", payload);
        toast("success", "Service created");
        router.push(`/admin/services/${created.id}`);
      }
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">{id ? "Edit TV service" : "New TV service"}</h1>
          <p className="mt-1 text-sm text-muted">Save, then check the Home page service cards.</p>
        </div>
        <Button type="submit">Save</Button>
      </div>
      <AdminGuide
        changes={[
          "Photo — service card on Home and /tv-repair",
          "Name + short description — text on that card",
          "Full description — inside the service page after you click the card",
        ]}
      />
      <div className="grid gap-4 border border-line bg-white p-5 md:grid-cols-2">
        <Field label="Name on website" hint="Example: LED TV Repair">
          <Input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value, slug: id ? form.slug : slugify(e.target.value) })
            }
            required
          />
        </Field>
        <Field label="Website address" hint="Becomes /tv-repair/this-name">
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <Field label="Short text on the card" hint="One or two lines under the name.">
          <Textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
        </Field>
        <Field label="Show on website?">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}>
            <option value="published">Published — live</option>
            <option value="draft">Draft — hidden</option>
          </Select>
        </Field>
        <Field label="Full details page text" hint="Shown after someone opens this service.">
          <Textarea className="min-h-40" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Benefits (one per line)" hint="Shown on the service page.">
          <Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
        </Field>
        <Field label="Symptoms (one per line)" hint="Shown on the service page.">
          <Textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
        </Field>
        <ImageField
          label="Service photo"
          hint="This is the picture on the Home page card. Change / Upload here."
          url={form.image_url}
          onChange={(next) => setForm({ ...form, image_id: next?.id ?? null, image_url: next?.url ?? "" })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
          />
          Featured (can be listed first)
        </label>
      </div>
      <section className="space-y-3 border border-line bg-white p-5">
        <h2 className="font-display text-xl">Service FAQs</h2>
        {form.faqs.map((faq, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Question"
              value={faq.question}
              onChange={(e) => {
                const faqs = [...form.faqs];
                faqs[i] = { ...faq, question: e.target.value };
                setForm({ ...form, faqs });
              }}
            />
            <Input
              placeholder="Answer"
              value={faq.answer}
              onChange={(e) => {
                const faqs = [...form.faqs];
                faqs[i] = { ...faq, answer: e.target.value };
                setForm({ ...form, faqs });
              }}
            />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setForm({ ...form, faqs: [...form.faqs, { question: "", answer: "" }] })}>
          Add FAQ
        </Button>
      </section>
      <section className="border border-line bg-white p-5">
        <h2 className="mb-4 font-display text-xl">SEO</h2>
        <SEOFields value={seo} onChange={setSeo} />
      </section>
    </form>
  );
}
