"use client";

import { create } from "zustand";

interface ToastItem {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

interface UiState {
  toasts: ToastItem[];
  pushToast: (type: ToastItem["type"], message: string) => void;
  dismissToast: (id: number) => void;
  bookingOpen: boolean;
  bookingSource: string;
  openBooking: (source?: string) => void;
  closeBooking: () => void;
}

let nextId = 1;

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (type, message) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  bookingOpen: false,
  bookingSource: "modal",
  openBooking: (source = "modal") => set({ bookingOpen: true, bookingSource: source }),
  closeBooking: () => set({ bookingOpen: false }),
}));
