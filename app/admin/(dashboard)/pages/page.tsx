"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateTime } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui";
import type { Page } from "@/models";
import type { PaginatedResult } from "@/types";

export default function PagesListPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<Page> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const toast = useUiStore((s) => s.pushToast);

  async function load() {
    const data = await apiGet<PaginatedResult<Page>>("/pages", { q, status, page, pageSize: 20 });
    setResult(data);
  }

  useEffect(() => {
    load().catch((e) => toast("error", e.message));
  }, [page, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Website</p>
          <h1 className="font-display text-3xl">Pages</h1>
        </div>
        <Link href="/admin/pages/new" className="btn-primary">
          New page
        </Link>
      </div>
      <AdminGuide
        title="Open a page to change it"
        changes={[
          "Home — homepage heading, banner photo, Why Helix cards, service list heading",
          "About / Contact / other pages — that page only",
          "After Save, click View website to check",
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search pages" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Button type="button" variant="outline" onClick={() => { setPage(1); load(); }}>
          Search
        </Button>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="max-w-40">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </div>
      <AdminTable headers={["Banner", "Title", "Slug", "Status", "Updated", ""]} empty={!result?.data.length}>
        {result?.data.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3">
              {item.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.featured_image_url} alt="" className="h-10 w-14 rounded-lg object-cover" />
              ) : (
                <span className="block h-10 w-14 rounded-lg bg-cream" />
              )}
            </td>
            <td className="px-4 py-3">
              <span className="font-medium">{item.title}</span>
              {item.is_homepage ? <span className="ml-2 text-xs text-copper">Homepage</span> : null}
              <span className="mt-0.5 block text-xs text-muted">
                {item.slug === "home" || item.is_homepage
                  ? "Changes the first screen people see"
                  : `Changes /${item.slug}`}
              </span>
            </td>
            <td className="px-4 py-3 text-muted">/{item.slug}</td>
            <td className="px-4 py-3">{item.status}</td>
            <td className="px-4 py-3 text-muted">{formatDateTime(item.updated_at)}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/pages/${item.id}`} className="mr-3 text-sm text-navy">
                Edit
              </Link>
              <button type="button" className="text-sm text-danger" onClick={() => setDeleteId(item.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
      <Pagination page={result?.page || 1} totalPages={result?.totalPages || 1} onPage={setPage} />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete page"
        message="This removes the page and its sections."
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await apiDelete(`/pages/${deleteId}`);
          setDeleteId(null);
          toast("success", "Page deleted");
          load();
        }}
      />
    </div>
  );
}
