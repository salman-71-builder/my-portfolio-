import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_BANNERS, type Banner } from "@/lib/banners";

/** Active banners ordered for display; falls back to defaults when none/db down. */
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const rows = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length === 0) return DEFAULT_BANNERS;
    return rows.map((b) => ({
      id: b.id,
      imageUrl: b.imageUrl,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      ctaHref: b.ctaHref,
      sortOrder: b.sortOrder,
      active: b.active,
    }));
  } catch {
    return DEFAULT_BANNERS;
  }
}

/** All banners (admin view, includes inactive). */
export async function getAllBanners(): Promise<Banner[]> {
  try {
    const rows = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map((b) => ({
      id: b.id,
      imageUrl: b.imageUrl,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      ctaHref: b.ctaHref,
      sortOrder: b.sortOrder,
      active: b.active,
    }));
  } catch {
    return [];
  }
}
