import { z } from "zod";

export const DestinationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100),
  tagline: z.string().max(200).optional().default(""),
  region: z.string().min(2).max(100).default("Cultural Triangle"),
  summary: z.string().max(1000).optional().default(""),
  content: z.string().optional().default(""),
  hero_image: z.string().min(1, "Hero image is required"),
  gallery_images: z.array(z.any()).optional().default([]),
  highlights: z.array(z.string()).optional().default([]),
  best_time_to_visit: z.string().optional().default(""),
  ideal_duration: z.string().optional().default("2 - 3 Days"),
  travel_tips: z.string().optional().default(""),
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
  display_order: z.number().int().optional().default(0),
  is_featured: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(true),
  seo_title: z.string().optional().default(""),
  seo_description: z.string().optional().default(""),
});

export const DestinationUpdateSchema = DestinationSchema.partial();
