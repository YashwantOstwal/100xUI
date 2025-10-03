import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      lastModified: "2025-09-26",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/components/parallax-cards`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/components/motion-dock`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/components/text-switcher`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/components/in-page-navbar`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
