"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { SEOFields, type SeoForm } from "@/components/admin/SEOFields";
import { useUiStore } from "@/store/ui";
import type { SeoMetadata } from "@/models";
import type { PaginatedResult } from "@/types";

export default function SeoPage() {
  const toast = useUiStore((s) => s.pushToast);
  const [q, setQ] = useState("");
  const [result, setResult] = useState<PaginatedResult<SeoMetadata> | null>(null);
  const [edit, setEdit] = useState<(SeoForm & { id: number; entity_type: string; entity_id: number }) | null>(null);
  async function load() { setResult(await apiGet("/seo", { q })); }
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Google / SEO</h1>
      <AdminGuide
        title="This does not change the look of the website"
        changes={[
          "Only Google title, description and share image",
          "To change the big heading on Home, open Pages → Home",
        ]}
      />
      <div className="flex gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="max-w-xs" />
        <Button type="button" variant="outline" onClick={load}>Search</Button>
      </div>
      <AdminTable headers={["Type", "Title", "Keyword", ""]} empty={!result?.data.length}>
        {result?.data.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3">{item.entity_type} #{item.entity_id}</td>
            <td className="px-4 py-3">{item.seo_title}</td>
            <td className="px-4 py-3">{item.focus_keyword}</td>
            <td className="px-4 py-3 text-right"><button type="button" className="text-sm" onClick={() => setEdit(item)}>Edit</button></td>
          </tr>
        ))}
      </AdminTable>
      {edit ? (
        <div className="border border-line bg-white p-5">
          <h2 className="mb-4 font-display text-xl">Edit {edit.entity_type}</h2>
          <SEOFields value={edit} onChange={(v) => setEdit({ ...edit, ...v })} />
          <Button className="mt-4" type="button" onClick={async () => {
            await apiPut("/seo", { ...edit, entity_type: edit.entity_type, entity_id: edit.entity_id });
            toast("success", "SEO updated");
            setEdit(null);
            load();
          }}>Save SEO</Button>
        </div>
      ) : null}
    </div>
  );
}
