"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useUiStore } from "@/store/ui";
import type { Testimonial } from "@/models";
import type { PaginatedResult } from "@/types";

const emptyForm = {
  customer_name: "",
  rating: 5,
  review: "",
  location: "",
  image_id: null as number | null,
  image_url: "",
  is_featured: false,
  status: "active",
};

export default function TestimonialsPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [result, setResult] = useState<PaginatedResult<Testimonial> | null>(null);
  const [form, setForm] = useState(emptyForm);
  async function load() {
    setResult(await apiGet("/testimonials", { pageSize: 50 }));
  }
  useEffect(() => {
    load();
  }, []);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await apiPost("/testimonials", {
      customer_name: form.customer_name,
      rating: form.rating,
      review: form.review,
      location: form.location,
      image_id: form.image_id,
      is_featured: form.is_featured,
      status: form.status,
    });
    toast("success", "Review saved");
    setForm(emptyForm);
    load();
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Reviews</h1>
      <AdminGuide changes={["Customer quotes on Home / About.", "Featured reviews show first. Add a photo if you have one."]} />
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-line bg-white p-5 md:grid-cols-2">
        <Field label="Customer">
          <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <Field label="Rating">
          <Select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Review">
          <Textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} required />
        </Field>
        <ImageField
          label="Photo"
          hint="Optional customer or TV photo on the review slider."
          url={form.image_url}
          onChange={(next) => setForm({ ...form, image_id: next?.id ?? null, image_url: next?.url ?? "" })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
          />{" "}
          Featured
        </label>
        <Button type="submit">Add review</Button>
      </form>
      <AdminTable headers={["Photo", "Customer", "Rating", "Location", ""]} empty={!result?.data.length}>
        {result?.data.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt="" className="h-10 w-14 rounded-lg object-cover" />
              ) : (
                <span className="block h-10 w-14 rounded-lg bg-cream" />
              )}
            </td>
            <td className="px-4 py-3">{item.customer_name}</td>
            <td className="px-4 py-3">{item.rating}</td>
            <td className="px-4 py-3">{item.location}</td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm text-danger"
                onClick={async () => {
                  await apiDelete(`/testimonials/${item.id}`);
                  load();
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
