"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPut } from "@/lib/api-client";
import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminTable } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { LEAD_STATUSES } from "@/types";
import { formatDateTime } from "@/lib/utils/cn";
import { useUiStore } from "@/store/ui";
import type { Lead } from "@/models";
import type { PaginatedResult } from "@/types";

export default function LeadsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<Lead> | null>(null);
  const [active, setActive] = useState<Lead | null>(null);
  const toast = useUiStore((s) => s.pushToast);

  async function load() {
    setResult(await apiGet("/leads", { q, status, page }));
  }
  useEffect(() => { load().catch((e) => toast("error", e.message)); }, [page, status]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Bookings</h1>
      <AdminGuide
        title="This does not change the website"
        changes={[
          "These are requests from Book a Repair / contact forms",
          "Call the customer, then update the status",
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, city" className="max-w-xs" />
        <Button type="button" variant="outline" onClick={() => { setPage(1); load(); }}>Search</Button>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="max-w-48">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </div>
      <AdminTable headers={["Customer", "Phone", "City", "Status", "Created", ""]} empty={!result?.data.length}>
        {result?.data.map((lead) => (
          <tr key={lead.id}>
            <td className="px-4 py-3">{lead.customer_name}</td>
            <td className="px-4 py-3">{lead.phone}</td>
            <td className="px-4 py-3">{lead.city}</td>
            <td className="px-4 py-3">{lead.status.replace("_", " ")}</td>
            <td className="px-4 py-3 text-muted">{formatDateTime(lead.created_at)}</td>
            <td className="px-4 py-3 text-right">
              <button type="button" className="mr-3 text-sm" onClick={() => setActive(lead)}>Open</button>
              <button type="button" className="text-sm text-danger" onClick={async () => { await apiDelete(`/leads/${lead.id}`); load(); }}>Delete</button>
            </td>
          </tr>
        ))}
      </AdminTable>
      <Pagination page={result?.page || 1} totalPages={result?.totalPages || 1} onPage={setPage} />
      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6">
            <h2 className="font-display text-2xl">{active.customer_name}</h2>
            <p className="mt-1 text-sm text-muted">{active.phone} · {active.email}</p>
            <p className="mt-3 text-sm">{active.tv_brand} {active.tv_type} {active.tv_size}</p>
            <p className="mt-2 text-sm text-muted">{active.problem}</p>
            <p className="mt-2 text-sm">{active.address}, {active.city} {active.pincode}</p>
            <div className="mt-4 space-y-3">
              <Field label="Status">
                <Select value={active.status} onChange={(e) => setActive({ ...active, status: e.target.value as Lead["status"] })}>
                  {LEAD_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </Field>
              <Field label="Assign technician">
                <Input value={active.assigned_technician || ""} onChange={(e) => setActive({ ...active, assigned_technician: e.target.value })} />
              </Field>
              <Field label="Notes">
                <Textarea value={active.notes || ""} onChange={(e) => setActive({ ...active, notes: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setActive(null)}>Close</Button>
              <Button type="button" onClick={async () => {
                await apiPut(`/leads/${active.id}`, {
                  status: active.status,
                  assigned_technician: active.assigned_technician,
                  notes: active.notes,
                });
                toast("success", "Lead updated");
                setActive(null);
                load();
              }}>Save</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
