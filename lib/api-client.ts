import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data as {
      error?: string;
      details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
    } | undefined;
    const fieldErrors = data?.details?.fieldErrors;
    const firstField = fieldErrors
      ? Object.entries(fieldErrors).find(([, messages]) => messages?.length)
      : undefined;
    const message =
      (firstField ? `${firstField[0]}: ${firstField[1].join(", ")}` : data?.details?.formErrors?.[0]) ||
      data?.error ||
      error.message ||
      "Request failed";
    return Promise.reject(new Error(message));
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await api.get<T>(url, { params });
  return data;
}

export async function apiPost<T>(url: string, body?: unknown) {
  const { data } = await api.post<T>(url, body);
  return data;
}

export async function apiPut<T>(url: string, body?: unknown) {
  const { data } = await api.put<T>(url, body);
  return data;
}

export async function apiDelete<T>(url: string) {
  const { data } = await api.delete<T>(url);
  return data;
}
