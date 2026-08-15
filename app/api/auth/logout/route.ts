import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/auth/api";
import { applyClearedSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    return applyClearedSessionCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    return handleApiError(error);
  }
}
