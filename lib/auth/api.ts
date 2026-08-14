import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/utils/errors";
import { getSessionFromCookies } from "@/lib/auth/session";
import type { SessionUser } from "@/types";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Validation failed", 422, error.flatten());
  }
  if (error instanceof AppError) {
    return jsonError(error.message, error.status, error.details);
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new AppError("Unauthorized", 401);
  }
  if (session.role !== "admin" && session.role !== "editor") {
    throw new AppError("Forbidden", 403);
  }
  return session;
}

export async function requireRole(
  roles: SessionUser["role"][],
): Promise<SessionUser> {
  const session = await requireAdmin();
  if (!roles.includes(session.role)) {
    throw new AppError("Forbidden", 403);
  }
  return session;
}

export function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  return {
    page: Number(searchParams.get("page") || 1),
    pageSize: Number(searchParams.get("pageSize") || 20),
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || "",
    sort: searchParams.get("sort") || "",
    category: searchParams.get("category") || "",
  };
}
