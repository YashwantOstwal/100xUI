import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://100xui.com`,
      lastModified: "2025-09-26",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `https://100xui.com/components/parallax-cards`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/motion-dock`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/text-switcher`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/in-page-navbar`,
      lastModified: "2025-09-26",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/spinning-testimonials`,
      lastModified: "2025-10-09",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/motion-link`,
      lastModified: "2025-10-10",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/morph-modal`,
      lastModified: "2025-10-13",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/chat-bento-card`,
      lastModified: "2025-10-17",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `https://100xui.com/components/notification`,
      lastModified: "2025-10-22",
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
