import { z } from "zod";

export const PageMetaSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  page_key: z.string().min(1),
  title: z.string().min(1),
  navigation_label: z.string().optional().default(""),
  nav_location: z.enum(["header", "footer_quick_links", "footer_legal", "none"]).optional().default("header"),
  is_published: z.boolean().optional().default(true),
  status: z.enum(["published", "draft"]).optional().default("published"),
  seo_title: z.string().optional().default(""),
  seo_description: z.string().optional().default(""),
  seo_og_image: z.string().optional().default(""),
  seo_keywords: z.string().optional().default(""),
  is_template: z.boolean().optional().default(false),
  layout_type: z.string().optional().default("default"),
  display_order: z.number().int().optional().default(0),
});

export const PageSectionSchema = z.object({
  id: z.string().optional(),
  page_key: z.string().min(1),
  section_key: z.string().min(1),
  section_type: z.string().optional().default("hero"),
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  badge: z.string().optional().default(""),
  content: z.string().optional().default(""),
  button_text: z.string().optional().default(""),
  button_url: z.string().optional().default(""),
  secondary_button_text: z.string().optional().default(""),
  secondary_button_url: z.string().optional().default(""),
  image_url: z.string().optional().default(""),
  secondary_image_url: z.string().optional().default(""),
  image_alt: z.string().optional().default(""),
  background_style: z.string().optional().default("default"),
  background_color: z.string().optional().default(""),
  background_image: z.string().optional().default(""),
  text_align: z.enum(["left", "center", "right"]).optional().default("left"),
  layout_options: z.record(z.any()).optional().default({}),
  items: z.array(z.any()).optional().default([]),
  is_visible: z.boolean().optional().default(true),
  status: z.enum(["published", "draft"]).optional().default("published"),
  display_order: z.number().int().optional().default(0),
});

export const PageReorderSchema = z.object({
  page_key: z.string().min(1),
  ordered_ids: z.array(z.string()).min(1),
});

export const PageDuplicateSchema = z.object({
  sourceKey: z.string().min(1),
  newKey: z.string().min(1),
  newSlug: z.string().min(1),
  newTitle: z.string().min(1),
});
