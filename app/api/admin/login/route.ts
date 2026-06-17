import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  makeAdminToken,
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// POST /api/admin/login — { password }
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));

  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
