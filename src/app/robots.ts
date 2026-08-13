import type { MetadataRoute } from "next";

import { env } from "@/shared/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/g/"],
    },
    sitemap: `${env.APP_URL.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
