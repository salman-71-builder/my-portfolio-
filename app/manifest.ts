import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChinaCart — B2B Wholesale Sourcing",
    short_name: "ChinaCart",
    description:
      "Source wholesale products directly from China and deliver to Bangladesh. Save up to 60%.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1230",
    theme_color: "#CC0000",
    orientation: "portrait",
    categories: ["shopping", "business"],
  };
}
