"use client";

import * as React from "react";
import { logoFor, type Branding, type LogoSlot } from "@/lib/branding";

const Ctx = React.createContext<Branding | null>(null);

export function BrandingProvider({
  branding,
  children,
}: {
  branding: Branding;
  children: React.ReactNode;
}) {
  // keep the browser-tab favicon in sync with the icon logo
  React.useEffect(() => {
    const icon = branding.iconLogo ?? branding.mainLogo;
    if (!icon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = icon;
  }, [branding.iconLogo, branding.mainLogo]);

  return <Ctx.Provider value={branding}>{children}</Ctx.Provider>;
}

export function useBranding(): Branding {
  return (
    React.useContext(Ctx) ?? {
      mainLogo: null,
      iconLogo: null,
      footerLogo: null,
      loadingLogo: null,
      invoiceLogo: null,
      primaryColor: "#c0392b",
      navyColor: "#1a2f5e",
    }
  );
}

/**
 * Renders the uploaded logo for a slot (falling back to the main logo). When no
 * custom logo is set, renders `fallback` (the original CSS/text logo).
 */
export function BrandLogo({
  slot = "mainLogo",
  imgClassName,
  alt = "ChinaCart",
  fallback,
}: {
  slot?: LogoSlot;
  imgClassName?: string;
  alt?: string;
  fallback: React.ReactNode;
}) {
  const branding = useBranding();
  const src = logoFor(branding, slot);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={imgClassName} />;
  }
  return <>{fallback}</>;
}
