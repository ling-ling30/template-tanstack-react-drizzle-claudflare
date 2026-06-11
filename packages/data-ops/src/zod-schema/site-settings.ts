import { z } from "zod";

export const siteSettingsInputSchema = z.object({
  siteName: z.string().min(1).max(120),
  ogTitle: z.string().min(1).max(120),
  ogDescription: z.string().min(1).max(300),
  ogImage: z.string().url().nullable(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;

export type SiteSettings = SiteSettingsInput & {
  id: string;
  updatedAt: string;
};
