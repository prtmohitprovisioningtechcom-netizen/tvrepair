"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { useUiStore } from "@/store/ui";
import type { Service } from "@/models";
import type { PaginatedResult } from "@/types";

export default function ServicesPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<Service> | null>(null);
  const toast = useUiStore((s) => s.pushToast);

  async function load() {
    setResult(await apiGet("/services", { q, page }));
  }
  useEffect(() => {
    load().catch((e) => toast("error", e.message));
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="font-display text-3xl">TV services</h1>
          <p className="mt-1 text-sm text-muted">These cards show on Home and the Services page.</p>
        </div>
        <Link href="/admin/services/new" className="btn-primary">
          New service
        </Link>
      </div>
      <AdminGuide
        changes={[
          "Name + photo = the boxes under TV repair services",
          "Click Edit on a row to change that service’s photo and text",
          "Published services show on the website. Draft stays hidden",
        ]}
      />
      <div className="flex gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="max-w-xs" />
        <Button type="button" variant="outline" onClick={() => { setPage(1); load(); }}>
          Search
        </Button>
      </div>
      <AdminTable headers={["Photo", "Name", "Slug", "Status", "Featured", ""]} empty={!result?.data.length}>
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
            <td className="px-4 py-3">{item.name}</td>
            <td className="px-4 py-3 text-muted">/tv-repair/{item.slug}</td>
            <td className="px-4 py-3">{item.status}</td>
            <td className="px-4 py-3">{item.is_featured ? "Yes" : "No"}</td>
            <td className="px-4 py-3 text-right">
              <Link href={`/admin/services/${item.id}`} className="mr-3 text-sm">
                Edit
              </Link>
              <button
                type="button"
                className="text-sm text-danger"
                onClick={async () => {
                  await apiDelete(`/services/${item.id}`);
                  toast("success", "Deleted");
                  load();
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
      <Pagination page={result?.page || 1} totalPages={result?.totalPages || 1} onPage={setPage} />
    </div>
  );
}
