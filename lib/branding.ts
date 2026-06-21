/** Brand logos + colours. Pure module (no db). Logo fields are image URLs
 *  (data URLs or hosted). */

export interface Branding {
  mainLogo: string | null;
  iconLogo: string | null;
  footerLogo: string | null;
  loadingLogo: string | null;
  invoiceLogo: string | null;
  primaryColor: string; // hex
  navyColor: string; // hex
}

export const DEFAULT_PRIMARY = "#c0392b";
export const DEFAULT_NAVY = "#1a2f5e";

export const DEFAULT_BRANDING: Branding = {
  mainLogo: null,
  iconLogo: null,
  footerLogo: null,
  loadingLogo: null,
  invoiceLogo: null,
  primaryColor: DEFAULT_PRIMARY,
  navyColor: DEFAULT_NAVY,
};

export type LogoSlot =
  | "mainLogo"
  | "iconLogo"
  | "footerLogo"
  | "loadingLogo"
  | "invoiceLogo";

export const LOGO_SLOTS: { key: LogoSlot; label: string; hint: string }[] = [
  { key: "mainLogo", label: "Main Logo", hint: "Navbar & hero (full logo with text)" },
  { key: "iconLogo", label: "Icon Logo", hint: "Favicon & app icon (cart mark only)" },
  { key: "footerLogo", label: "Footer Logo", hint: "Footer (optional alternate)" },
  { key: "loadingLogo", label: "Loading Logo", hint: "Page loading screen" },
  { key: "invoiceLogo", label: "Invoice Logo", hint: "PDF invoices & receipts" },
];

/** Effective logo for a slot, falling back to the main logo. */
export function logoFor(b: Branding, slot: LogoSlot): string | null {
  return b[slot] ?? b.mainLogo;
}

/** "#1a2f5e" → "219 56% 24%" (Tailwind HSL-triplet form). Returns null if invalid. */
export function hexToHslTriplet(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** CSS that overrides the theme tokens from branding colours (for <style>). */
export function brandColorCss(b: Branding): string {
  const primary = hexToHslTriplet(b.primaryColor);
  const navy = hexToHslTriplet(b.navyColor);
  const lines: string[] = [];
  if (primary) lines.push(`--primary:${primary};--ring:${primary};`);
  if (navy) lines.push(`--navy:${navy};`);
  return lines.length ? `:root{${lines.join("")}}` : "";
}
