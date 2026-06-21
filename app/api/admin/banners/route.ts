import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function clean(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, 400) : null;
}

// GET — all banners (admin only; public homepage uses getActiveBanners())
export async function GET() {
  if (!isAdmin()) return unauthorized();
  try {
    const rows = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ banners: rows });
  } catch {
    return NextResponse.json({ banners: [], error: true });
  }
}

// POST — create a banner { imageUrl, title?, subtitle?, ctaText?, ctaHref? }
export async function POST(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const imageUrl = clean(body.imageUrl);
  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }
  try {
    const max = await prisma.banner.aggregate({ _max: { sortOrder: true } });
    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        title: clean(body.title),
        subtitle: clean(body.subtitle),
        ctaText: clean(body.ctaText),
        ctaHref: clean(body.ctaHref),
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        active: body.active !== false,
      },
    });
    return NextResponse.json({ ok: true, banner });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PATCH — update fields or reorder { id, ...fields, sortOrder?, active? }
export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if ("imageUrl" in body) data.imageUrl = clean(body.imageUrl) ?? "";
  if ("title" in body) data.title = clean(body.title);
  if ("subtitle" in body) data.subtitle = clean(body.subtitle);
  if ("ctaText" in body) data.ctaText = clean(body.ctaText);
  if ("ctaHref" in body) data.ctaHref = clean(body.ctaHref);
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.sortOrder === "number") data.sortOrder = Math.round(body.sortOrder);

  try {
    await prisma.banner.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// DELETE — /api/admin/banners?id=...
export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
