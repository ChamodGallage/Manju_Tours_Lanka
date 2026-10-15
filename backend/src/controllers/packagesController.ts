import { Request, Response, NextFunction } from "express";
import { packagesService } from "../services/packagesService.js";
import { TourPackageSchema, TourPackageUpdateSchema } from "../validators/packageValidator.js";

export const packagesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeUnpublished = req.query.includeUnpublished === "true";
      const packages = await packagesService.getAll(includeUnpublished);
      return res.json({ packages, count: packages.length });
    } catch (err) {
      return next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const pkg = await packagesService.getBySlug(slug);
      if (!pkg) {
        return res.status(404).json({ error: `Tour package '${slug}' not found` });
      }
      return res.json({ package: pkg });
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = TourPackageSchema.parse(req.body);
      const created = await packagesService.create(validated);
      return res.status(201).json({ success: true, package: created });
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = TourPackageUpdateSchema.parse(req.body);
      const updated = await packagesService.update(id, validated);
      if (!updated) {
        return res.status(404).json({ error: `Tour package with ID '${id}' not found` });
      }
      return res.json({ success: true, package: updated });
    } catch (err) {
      return next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleted = await packagesService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: `Tour package with ID '${id}' not found` });
      }
      return res.json({ success: true, message: "Tour package deleted successfully" });
    } catch (err) {
      return next(err);
    }
  },
};
