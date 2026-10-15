import { Request, Response, NextFunction } from "express";
import { destinationsService } from "../services/destinationsService.js";
import { DestinationSchema, DestinationUpdateSchema } from "../validators/destinationValidator.js";

export const destinationsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeUnpublished = req.query.includeUnpublished === "true";
      const destinations = await destinationsService.getAll(includeUnpublished);
      return res.json({ destinations, count: destinations.length });
    } catch (err) {
      return next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const destination = await destinationsService.getBySlug(slug);
      if (!destination) {
        return res.status(404).json({ error: `Destination '${slug}' not found` });
      }
      return res.json({ destination });
    } catch (err) {
      return next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = DestinationSchema.parse(req.body);
      const created = await destinationsService.create(validated);
      return res.status(201).json({ success: true, destination: created });
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = DestinationUpdateSchema.parse(req.body);
      const updated = await destinationsService.update(id, validated);
      if (!updated) {
        return res.status(404).json({ error: `Destination with ID '${id}' not found` });
      }
      return res.json({ success: true, destination: updated });
    } catch (err) {
      return next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleted = await destinationsService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: `Destination with ID '${id}' not found` });
      }
      return res.json({ success: true, message: "Destination deleted successfully" });
    } catch (err) {
      return next(err);
    }
  },
};
