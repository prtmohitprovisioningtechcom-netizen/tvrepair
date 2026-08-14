"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { slugify } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui";
import type { BlogCategory } from "@/models";

export default function CategoriesPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [items, setItems] = useState<BlogCategory[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  async function load() { setItems(await apiGet("/categories")); }
  useEffect(() => { load(); }, []);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await apiPost("/categories", { ...form, slug: slugify(form.slug || form.name) });
    toast("success", "Category saved");
    load();
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Blog topics</h1>
      <AdminGuide changes={["Groups for blog posts only. Does not change Home or TV services."]} />
      <form onSubmit={onSubmit} className="grid gap-3 border border-line bg-white p-5 md:grid-cols-3">
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} required /></Field>
        <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
        <Field label="Description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Button type="submit">Add category</Button>
      </form>
      <AdminTable headers={["Name", "Slug", ""]} empty={!items.length}>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3">{item.name}</td>
            <td className="px-4 py-3">{item.slug}</td>
            <td className="px-4 py-3 text-right">
              <button type="button" className="text-sm text-danger" onClick={async () => { await apiDelete(`/categories/${item.id}`); load(); }}>Delete</button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
