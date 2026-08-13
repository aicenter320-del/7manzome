import type { MetadataRoute } from "next";

import { env } from "@/shared/config/env";

const PUBLIC_PATHS = ["/", "/products", "/occasions", "/gift", "/about", "/treasures"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.APP_URL.replace(/\/+$/, "");

  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
