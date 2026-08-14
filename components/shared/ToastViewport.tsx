"use client";

import { useUiStore } from "@/store/ui";

export function ToastViewport() {
  const { toasts, dismissToast } = useUiStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed inset-x-4 bottom-24 z-80 flex flex-col gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[min(360px,calc(100%-2rem))]">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={`px-4 py-3 text-left text-sm text-white shadow-soft ${
            toast.type === "error"
              ? "bg-danger"
              : toast.type === "success"
                ? "bg-success"
                : "bg-navy"
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
