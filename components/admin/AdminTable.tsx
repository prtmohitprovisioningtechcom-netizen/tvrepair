"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-cream text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(!empty && "divide-y divide-line")}>{children}</tbody>
      </table>
      {empty ? (
        <p className="px-4 py-10 text-center text-sm text-muted">No records found.</p>
      ) : null}
    </div>
  );
}
