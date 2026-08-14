"use client";

import { Button } from "@/components/ui/Button";

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-navy/50 p-4">
      <div className="w-full max-w-md bg-white p-6 shadow-soft">
        <h3 className="font-display text-xl">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
