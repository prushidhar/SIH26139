import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://quresight.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/terms",
          "/privacy",
          "/disclaimer",
          "/cookies",
          "/login",
          "/register",
          "/predict",
          "/benchmarks",
          "/analysis",
          "/hardware",
        ],
        disallow: [
          "/account/",
          "/settings/",
          "/notifications/",
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
