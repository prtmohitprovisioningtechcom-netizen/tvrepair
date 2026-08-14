"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import type { Blog } from "@/models";
import type { PaginatedResult } from "@/types";

export default function BlogsPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<PaginatedResult<Blog> | null>(null);
  async function load() { setResult(await apiGet("/blogs", { q })); }
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="font-display text-3xl">Blog</h1>
          <p className="mt-1 text-sm text-muted">Articles on /blog. This does not change the homepage banner.</p>
        </div>
        <Link href="/admin/blogs/new" className="btn-primary">New post</Link>
      </div>
      <AdminGuide changes={["Blog articles on /blog only.", "Homepage photos are in Pages → Home."]} />
      <div className="flex gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="max-w-xs" />
        <Button type="button" variant="outline" onClick={load}>Search</Button>
      </div>
      <AdminTable headers={["Photo", "Title", "Status", ""]} empty={!result?.data.length}>
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
            <td className="px-4 py-3">{item.title}</td>
            <td className="px-4 py-3">{item.status}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/blogs/${item.id}`} className="mr-3 text-sm">Edit</Link>
              <button type="button" className="text-sm text-danger" onClick={async () => { await apiDelete(`/blogs/${item.id}`); load(); }}>Delete</button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
