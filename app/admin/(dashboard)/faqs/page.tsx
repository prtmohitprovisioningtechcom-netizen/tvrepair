"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useUiStore } from "@/store/ui";
import type { Faq } from "@/models";
import type { PaginatedResult } from "@/types";

export default function FaqsPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [result, setResult] = useState<PaginatedResult<Faq> | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "general", status: "active" });
  async function load() { setResult(await apiGet("/faqs", { pageSize: 50 })); }
  useEffect(() => { load(); }, []);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await apiPost("/faqs", form);
    toast("success", "FAQ saved");
    setForm({ question: "", answer: "", category: "general", status: "active" });
    load();
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">FAQs</h1>
      <AdminGuide changes={["Questions and answers shown on the website FAQ sections.", "Active = visible. Inactive = hidden."]} />
      <form onSubmit={onSubmit} className="grid gap-3 border border-line bg-white p-5 md:grid-cols-2">
        <Field label="Question"><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required /></Field>
        <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
        <Field label="Answer"><Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required /></Field>
        <div className="self-end"><Button type="submit">Add FAQ</Button></div>
      </form>
      <AdminTable headers={["Question", "Category", "Status", ""]} empty={!result?.data.length}>
        {result?.data.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3">{item.question}</td>
            <td className="px-4 py-3">{item.category}</td>
            <td className="px-4 py-3">
              <Select value={item.status} onChange={async (e) => { await apiPut(`/faqs/${item.id}`, { ...item, status: e.target.value }); load(); }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </td>
            <td className="px-4 py-3 text-right">
              <button type="button" className="text-sm text-danger" onClick={async () => { await apiDelete(`/faqs/${item.id}`); load(); }}>Delete</button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
