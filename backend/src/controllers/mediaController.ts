import { Request, Response, NextFunction } from "express";
import { mediaService } from "../services/mediaService.js";

export const mediaController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const destination = req.query.destination as string | undefined;
      const pageKey = req.query.page_key as string | undefined;
      const sectionKey = req.query.section_key as string | undefined;

      const photos = await mediaService.getAll({ category, destination, pageKey, sectionKey });
      return res.json({ photos, count: photos.length });
    } catch (err) {
      return next(err);
    }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided in upload" });
      }

      const file = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      };

      const metadata = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        pageKey: req.body.page_key || "global",
        sectionKey: req.body.section_key || "gallery",
        category: req.body.category || "gallery",
        destination: req.body.destination || "",
        altText: req.body.alt_text || req.body.title || req.file.originalname,
      };

      const created = await mediaService.upload(file, metadata);
      return res.status(201).json({ success: true, photo: created });
    } catch (err) {
      return next(err);
    }
  },

  async replace(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.body.id || (req.query.id as string);
      if (!id) {
        return res.status(400).json({ error: "Missing required photo 'id'" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No replacement image file provided" });
      }

      const file = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      };

      const updated = await mediaService.replace(id, file);
      if (!updated) {
        return res.status(404).json({ error: `Photo with ID '${id}' not found` });
      }
      return res.json({ success: true, photo: updated });
    } catch (err) {
      return next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleted = await mediaService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: `Photo with ID '${id}' not found` });
      }
      return res.json({ success: true, message: "Photo deleted successfully" });
    } catch (err) {
      return next(err);
    }
  },
};
