import type { MetadataRoute } from "next";
import { DOCUMENTS } from "@/lib/documents";
import { PLANNED_AUDIENCES } from "@/lib/audiences";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: updated, priority: 1 },
    { url: `${SITE_URL}/courses`, lastModified: updated, priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: updated, priority: 0.8 },
    { url: `${SITE_URL}/draft-bot`, lastModified: updated, priority: 0.8 },
    { url: `${SITE_URL}/library`, lastModified: updated, priority: 0.5 },
    { url: `${SITE_URL}/map`, lastModified: updated, priority: 0.5 },
    { url: `${SITE_URL}/documents`, lastModified: updated, priority: 0.7 },
    { url: `${SITE_URL}/internship`, lastModified: updated, priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: updated, priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: updated, priority: 0.2 },
    { url: `${SITE_URL}/privacy`, lastModified: updated, priority: 0.2 },
    { url: `${SITE_URL}/refund`, lastModified: updated, priority: 0.2 },
    { url: `${SITE_URL}/limitation`, lastModified: updated, priority: 0.5 },
    { url: `${SITE_URL}/status`, lastModified: updated, priority: 0.5 },
    { url: `${SITE_URL}/courses/moot`, lastModified: updated, priority: 0.5 },
    { url: `${SITE_URL}/courses/case-brief`, lastModified: updated, priority: 0.5 },
    ...PLANNED_AUDIENCES.map((a) => ({
      url: `${SITE_URL}/for/${a.slug}`,
      lastModified: updated,
      priority: 0.4,
    })),
    ...DOCUMENTS.map((d) => ({
      url: `${SITE_URL}/documents/${d.slug}`,
      lastModified: updated,
      priority: 0.6,
    })),
  ];
}
