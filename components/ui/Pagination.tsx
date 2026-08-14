"use client";

import { Button } from "@/components/ui/Button";

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-sm">
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1.5 text-sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1.5 text-sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
