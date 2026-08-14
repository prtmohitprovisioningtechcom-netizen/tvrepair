"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { BookingForm } from "@/components/forms/BookingForm";
import { useUiStore } from "@/store/ui";

export function BookingModal() {
  const open = useUiStore((s) => s.bookingOpen);
  const source = useUiStore((s) => s.bookingSource);
  const closeBooking = useUiStore((s) => s.closeBooking);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeBooking();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeBooking]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
        aria-label="Close booking form"
        onClick={closeBooking}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="relative z-10 max-h-[min(92dvh,calc(100dvh-0.5rem))] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-soft sm:rounded-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Same-day slots</p>
            <h2 id="booking-modal-title" className="mt-1.5 font-display text-xl text-ink sm:text-3xl">
              Book a repair visit
            </h2>
            <p className="mt-1 text-sm text-muted">A coordinator will confirm before the technician leaves.</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-navy hover:border-copper"
            onClick={closeBooking}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <BookingForm variant="panel" source={source} onSuccess={closeBooking} />
      </div>
    </div>
  );
}
