import { Request, Response, NextFunction } from "express";
import { pagesService } from "../services/pagesService.js";
import { PageMetaSchema, PageSectionSchema, PageReorderSchema, PageDuplicateSchema } from "../validators/pageValidator.js";
import type { PageSectionItem } from "../types/database.types.js";

export const pagesController = {
  async handlePagesRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const mode = req.query.mode as string;
      const pageKey = (req.query.page as string) || "home";

      if (mode === "pages") {
        const pages = await pagesService.getPages();
        return res.json({ pages, count: pages.length });
      }

      const page = await pagesService.getPage(pageKey);
      const sections = await pagesService.getPageSections(pageKey, false);
      return res.json({ page, sections, count: sections.length });
    } catch (err) {
      return next(err);
    }
  },

  async getPublishedSections(req: Request, res: Response, next: NextFunction) {
    try {
      const pageKey = (req.params.pageKey as string) || "home";
      const page = await pagesService.getPage(pageKey);
      const sections = await pagesService.getPageSections(pageKey, true);
      return res.json({ page, sections, count: sections.length });
    } catch (err) {
      return next(err);
    }
  },

  async saveItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, ...payload } = req.body;

      if (targetType === "page") {
        const validated = PageMetaSchema.parse(payload);
        const updated = await pagesService.savePage(validated);
        return res.json({ success: true, page: updated });
      }

      const validated = PageSectionSchema.parse(payload) as unknown as Partial<PageSectionItem>;
      const saved = await pagesService.saveSection(validated);
      return res.json({ success: true, section: saved });
    } catch (err) {
      return next(err);
    }
  },

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.query.id as string;
      if (!id) {
        return res.status(400).json({ error: "Missing required 'id' parameter" });
      }
      const deleted = await pagesService.deleteSection(id);
      return res.json({ success: deleted });
    } catch (err) {
      return next(err);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { page_key, ordered_ids } = PageReorderSchema.parse(req.body);
      const success = await pagesService.reorderSections(page_key, ordered_ids);
      return res.json({ success });
    } catch (err) {
      return next(err);
    }
  },

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const { sourceKey, newTitle, newSlug, newKey } = PageDuplicateSchema.parse(req.body);
      const duplicated = await pagesService.duplicatePage(sourceKey, newTitle, newSlug, newKey);
      if (!duplicated) {
        return res.status(404).json({ error: `Source page '${sourceKey}' not found` });
      }
      return res.status(201).json({ success: true, page: duplicated });
    } catch (err) {
      return next(err);
    }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const pageKey = req.body.page_key;
      const unpublish = Boolean(req.body.unpublish);

      if (!pageKey) {
        return res.status(400).json({ error: "Missing required 'page_key'" });
      }

      if (unpublish && pageKey === "home") {
        return res.status(400).json({ error: "Home page cannot be unpublished" });
      }

      const result = await pagesService.publishPage(pageKey, unpublish);
      return res.json({
        success: true,
        message: unpublish ? "Page unpublished safely" : "Page published live successfully",
        ...result,
      });
    } catch (err) {
      return next(err);
    }
  },
};
