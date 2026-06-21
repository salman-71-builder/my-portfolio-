import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";
import { getBranding } from "@/lib/branding-server";

export const dynamic = "force-dynamic";

const MAX_LEN = 4_200_000; // ~3MB image as a data URL
const LOGO_FIELDS = ["mainLogo", "iconLogo", "footerLogo", "loadingLogo", "invoiceLogo"];
const HEX = /^#[0-9a-fA-F]{6}$/;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// GET — current branding (admin)
export async function GET() {
  if (!isAdmin()) return unauthorized();
  return NextResponse.json({ branding: await getBranding() });
}

// POST — update any subset of branding fields (admin)
export async function POST(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const body = await req.json().catch(() => ({}));

  const data: Record<string, string | null> = {};

  for (const f of LOGO_FIELDS) {
    if (f in body) {
      const v = body[f];
      if (v === null || v === "") {
        data[f] = null;
      } else if (typeof v === "string") {
        if (!/^(data:image\/|https?:\/\/)/.test(v)) {
          return NextResponse.json({ error: `Invalid image for ${f}` }, { status: 400 });
        }
        if (v.length > MAX_LEN) {
          return NextResponse.json({ error: `${f} too large (max ~3MB)` }, { status: 413 });
        }
        data[f] = v;
      }
    }
  }

  for (const c of ["primaryColor", "navyColor"]) {
    if (c in body) {
      const v = String(body[c] ?? "");
      if (!HEX.test(v)) {
        return NextResponse.json({ error: `Invalid ${c} (use #rrggbb)` }, { status: 400 });
      }
      data[c] = v;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  try {
    await prisma.brandingSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...data },
      update: data,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
