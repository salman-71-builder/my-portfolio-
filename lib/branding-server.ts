import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_BRANDING, type Branding } from "@/lib/branding";

/** The site branding (singleton row "default"); falls back to defaults. */
export async function getBranding(): Promise<Branding> {
  try {
    const row = await prisma.brandingSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return DEFAULT_BRANDING;
    return {
      mainLogo: row.mainLogo,
      iconLogo: row.iconLogo,
      footerLogo: row.footerLogo,
      loadingLogo: row.loadingLogo,
      invoiceLogo: row.invoiceLogo,
      primaryColor: row.primaryColor ?? DEFAULT_BRANDING.primaryColor,
      navyColor: row.navyColor ?? DEFAULT_BRANDING.navyColor,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}
